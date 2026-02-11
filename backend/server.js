import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import jsonServer from 'json-server';

const PORT = process.env.PORT ?? 3000;
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

const app = express();
app.use(cors());
app.use(express.json());

//reutilizacion de un solo router/db (evita crear router("db.json") cada vez)
const router = jsonServer.router('db.json');
const db = router.db;

// -- Helpers --
function signToken(user) {
    return jwt.sign(
        { sub: user.id, username: user.username, email: user.email }, 
        JWT_SECRET, 
        { expiresIn: '3h' }
    );
}

function authRequired(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: "Missing token" });
    
    const token = header.slice("Bearer ".length);
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
}

const userIdFromReq = (req) => Number(req.user?.sub);

function recetaBelongsToUser(receta, userid) {
    return receta && Number(receta.userId) === Number(userid);
}

// -- auth endpoints --
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
        return res.status(400).json({ message: "Missing email or password" });
    } 

    const user = db.get('users').find({ email }).value();
    if (!user?.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);
    return res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email }
        });
    });

    app.post('/auth/register', async (req, res) => {
        const { username, email, password } = req.body ?? {};
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Missing username, email or password" });
        }
    
    const exists = db.get("users").find({ email }).value();
    if (exists) {
        return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const users = db.get("users");
    const nextId = (users.maxBy("id").value()?.id ?? 0) + 1;

    const newUser = {
        id: nextId,
        username,
        email,
        passwordHash
    };

    users.push(newUser).write();

    return res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
        });
    });

    app.get('/auth/me', authRequired, (req, res) => {
        return res.json({
            id: req.user.sub,
            username: req.user.username,
            email: req.user.email
        });
    });

// -- protect /recetas --
/**
     * --- TASKS: acceso solo a tareas del usuario ---
     * En lugar de depender de filtros “mágicos” de json-server via req.query,
     * implementamos handlers Express limpios y dejamos json-server para el resto.
*/

// -- json-server CRUD --
app.get('/recetas', authRequired, (req, res) => {
    const userId = userIdFromReq(req);
    const recetas = db.get("recetas").filter({ userId }).value();
    return res.json(recetas);
});

app.get('/recetas/:id', authRequired, (req, res) => {
    const userId = userIdFromReq(req);
    const id = Number(req.params.id);

    const receta = db.get("recetas").find({ id }).value();
    if (!recetaBelongsToUser(receta, userId)) {
        return res.status(404).json({ message: "Receta not found" });
    }

    return res.json(receta);
});

app.post('/recetas', authRequired, (req, res) => {
    const userId = userIdFromReq(req);
    const { nombre, ingredientes, pasos, dificultad = "Facil" } = req.body ?? {};

    if (!nombre?.trim()) return res.status(400).json({ message: "nombre es obligatorio" });

    const recetas = db.get("recetas");
    const nextId = (recetas.maxBy("id").value()?.id ?? 0) + 1;

    const newReceta = {
        id: nextId,
        nombre: nombre.trim(),
        ingredientes: ingredientes ?? [],
        pasos: pasos ?? [],
        dificultad,
        userId: userId
    };

    recetas.push(newReceta).write();
    return res.status(201).json(newReceta);
});

app.put('/recetas/:id', authRequired, (req, res) => {
    const userId = userIdFromReq(req);
    const id = Number(req.params.id);

    const receta = db.get("recetas").find({ id }).value();
    if (!recetaBelongsToUser(receta, userId)) {
        return res.status(404).json({ message: "Receta not found" });
    }

    const { nombre, ingredientes, pasos, dificultad } = req.body ?? {};
    if (!nombre?.trim()) return res.status(400).json({ message: "nombre es obligatorio" });

    const updated = {
        ...receta,
        nombre: nombre.trim(),
        ingredientes: ingredientes ?? receta.ingredientes,
        pasos: pasos ?? receta.pasos,
        dificultad: dificultad ?? receta.dificultad,
        userId: userId
    };
    db.get("recetas").find({ id }).assign(updated).write();

    return res.json(updated);
});

app.patch('/recetas/:id', authRequired, (req, res) => {
    const userId = userIdFromReq(req);
    const id = Number(req.params.id);

    const receta = db.get("recetas").find({ id }).value();
    if (!recetaBelongsToUser(receta, userId)) {
        return res.status(404).json({ message: "Receta not found" });
    }

    const patch = {};
    if (req.body?.nombre !== undefined) {
        const n = String(req.body.nombre).trim();
        if (!n) return res.status(400).json({ message: "nombre no puede estar vacío" });
        patch.nombre = n;
    }
    if (req.body?.ingredientes !== undefined) patch.ingredientes = req.body.ingredientes;
    if (req.body?.pasos !== undefined) patch.pasos = req.body.pasos;
    if (req.body?.dificultad !== undefined) patch.dificultad = req.body.dificultad;

    const updated = db.get("recetas").find({ id }).assign(patch).write();
    return res.json(updated);
});

app.delete('/recetas/:id', authRequired, (req, res) => {
    const userId = userIdFromReq(req);
    const id = Number(req.params.id);

    const receta = db.get("recetas").find({ id }).value();
    if (!recetaBelongsToUser(receta, userId)) {
        return res.status(404).json({ message: "Receta not found" });
    }

    db.get("recetas").remove({ id }).write();
    return res.status(204).send();
});

// -- json-server CRUD (resto de resto de recursos) --
const middlewares = jsonServer.defaults();
app.use(middlewares);
// IMPORTANTE: montamos json-server DESPUÉS, para que /tasks use nuestros handlers
app.use(router);

app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});
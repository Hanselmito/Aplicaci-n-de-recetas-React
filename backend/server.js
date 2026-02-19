import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import jsonServer from 'json-server';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ?? 3000;
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

// Configurar multer para guardar imágenes
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde uploads
app.use('/uploads', express.static(uploadDir));

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
    if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "Missing token" });
    
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

app.post('/recetas', authRequired, upload.single('imagen'), (req, res) => {
    const userId = userIdFromReq(req);
    const { nombre, ingredientes, pasos, dificultad = "Facil" } = req.body ?? {};

    if (!nombre?.trim()) return res.status(400).json({ message: "nombre es obligatorio" });

    const recetas = db.get("recetas");
    const nextId = (recetas.maxBy("id").value()?.id ?? 0) + 1;

    // Si hay archivo, guardar la ruta relativa
    const imagenPath = req.file ? `/uploads/${req.file.filename}` : null;

    const newReceta = {
        id: nextId,
        nombre: nombre.trim(),
        ingredientes: typeof ingredientes === 'string' ? JSON.parse(ingredientes) : (ingredientes ?? []),
        pasos: typeof pasos === 'string' ? JSON.parse(pasos) : (pasos ?? []),
        dificultad,
        imagen: imagenPath,
        userId: userId
    };

    recetas.push(newReceta).write();
    return res.status(201).json(newReceta);
});

app.put('/recetas/:id', authRequired, upload.single('imagen'), (req, res) => {
    const userId = userIdFromReq(req);
    const id = Number(req.params.id);

    const receta = db.get("recetas").find({ id }).value();
    if (!recetaBelongsToUser(receta, userId)) {
        return res.status(404).json({ message: "Receta not found" });
    }

    const { nombre, ingredientes, pasos, dificultad } = req.body ?? {};
    if (!nombre?.trim()) return res.status(400).json({ message: "nombre es obligatorio" });

    let imagenPath = receta.imagen;
    
    // Si hay nuevo archivo, actualizar la imagen
    if (req.file) {
        // Eliminar imagen anterior si existe
        if (receta.imagen && receta.imagen.startsWith('/uploads/')) {
            const oldImagePath = path.join(__dirname, receta.imagen);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        imagenPath = `/uploads/${req.file.filename}`;
    } else if (req.body?.imagen !== undefined) {
        imagenPath = req.body.imagen;
    }

    const updated = {
        ...receta,
        nombre: nombre.trim(),
        ingredientes: typeof ingredientes === 'string' ? JSON.parse(ingredientes) : (ingredientes ?? receta.ingredientes),
        pasos: typeof pasos === 'string' ? JSON.parse(pasos) : (pasos ?? receta.pasos),
        dificultad: dificultad ?? receta.dificultad,
        imagen: imagenPath,
        userId: userId
    };
    db.get("recetas").find({ id }).assign(updated).write();

    return res.json(updated);
});

app.patch('/recetas/:id', authRequired, upload.single('imagen'), (req, res) => {
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
    if (req.body?.ingredientes !== undefined) {
        patch.ingredientes = typeof req.body.ingredientes === 'string' 
            ? JSON.parse(req.body.ingredientes) 
            : req.body.ingredientes;
    }
    if (req.body?.pasos !== undefined) {
        patch.pasos = typeof req.body.pasos === 'string' 
            ? JSON.parse(req.body.pasos) 
            : req.body.pasos;
    }
    if (req.body?.dificultad !== undefined) patch.dificultad = req.body.dificultad;
    
    // Si hay nuevo archivo, actualizar la imagen
    if (req.file) {
        // Eliminar imagen anterior si existe
        if (receta.imagen && receta.imagen.startsWith('/uploads/')) {
            const oldImagePath = path.join(__dirname, receta.imagen);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        patch.imagen = `/uploads/${req.file.filename}`;
    } else if (req.body?.imagen !== undefined) {
        patch.imagen = req.body.imagen;
    }
    
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

    // Eliminar imagen si existe
    if (receta.imagen && receta.imagen.startsWith('/uploads/')) {
        const imagePath = path.join(__dirname, receta.imagen);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
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
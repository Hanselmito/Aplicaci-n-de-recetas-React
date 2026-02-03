import { useState } from "react";
import type { Receta } from "../types/Recetas";

type RecetaFormProps = {
    anadirReceta: (nombre: string, ingredientes: string[], pasos: string[], dificultad: 'Facil' | 'Media' | 'Dificil') => void;
    editarReceta : (receta: Receta) => (void);
    cancelarEdicionReceta: () => (void);
    peticionEnProgreso: boolean;
    recetaSeleccionada: Receta | null
}

function RecetaForm({ anadirReceta, peticionEnProgreso, recetaSeleccionada, editarReceta, cancelarEdicionReceta }: RecetaFormProps ) {
    const [nombre, setNombre] = useState(recetaSeleccionada?.nombre ?? "");
    const [ingredientes, setIngredientes] = useState(recetaSeleccionada?.ingredientes.join(", ") ?? "");
    const [pasos, setPasos] = useState(recetaSeleccionada?.pasos.join(". ") ?? "");
    const [dificultad, setDificultad] = useState<'Facil' | 'Media' | 'Dificil'>(recetaSeleccionada?.dificultad ?? "Facil");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if(nombre.trim().length > 0 && ingredientes.length > 0 && pasos.length > 0 && dificultad) {
            if (recetaSeleccionada != null) {
                const nuevaReceta : Receta = {...recetaSeleccionada, nombre: nombre, ingredientes: ingredientes.split(',').map(ing => ing.trim()), pasos: pasos.split('.').map(p => p.trim()), dificultad: dificultad};
                editarReceta(nuevaReceta)
            }else {
                anadirReceta(nombre.trim(), ingredientes.split(',').map(ing => ing.trim()), pasos.split('.').map(p => p.trim()), dificultad)
            }
        }
    }

    return <>
    <h2>{recetaSeleccionada ? `Editar receta: ${recetaSeleccionada.nombre}` : "agregar nueva receta"}</h2>
    <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nombre de la receta" value={nombre} onChange={e => setNombre(e.target.value)} />
        <br />
        <textarea placeholder="Ingredientes (separados por comas)" value={ingredientes} onChange={e => setIngredientes(e.target.value)}></textarea>
        <br />
        <textarea placeholder="Pasos (separados por puntos)" value={pasos} onChange={e => setPasos(e.target.value)}></textarea>
        <br />
        <select value={dificultad} onChange={e => setDificultad(e.target.value as 'Facil' | 'Media' | 'Dificil')}>
            <option value="Facil">Fácil</option>
            <option value="Media">Media</option>
            <option value="Dificil">Difícil</option>
        </select>
        <br />
        <button type="submit" disabled={peticionEnProgreso}>{recetaSeleccionada ? "Editar" : "agregar"}</button>
        {recetaSeleccionada && <button className="cancel" disabled={peticionEnProgreso} onClick={cancelarEdicionReceta}>Cancelar</button>}
    </form>
    </>;
}

export default RecetaForm;
import { useState } from "react";
import type { Receta } from "../types/Recetas";

type RecetaFormProps = {
    anadirReceta: (nombre: string, ingredientes: string[], pasos: string[], dificultad: 'Facil' | 'Media' | 'Dificil', imagenFile?: File) => void;
    editarReceta : (receta: Receta, imagenFile?: File) => (void);
    cancelarEdicionReceta: () => (void);
    recetaSeleccionada: Receta | null
}

function RecetaForm({ anadirReceta, recetaSeleccionada, editarReceta, cancelarEdicionReceta }: RecetaFormProps ) {
    const [nombre, setNombre] = useState(recetaSeleccionada?.nombre ?? "");
    const [ingredientes, setIngredientes] = useState(recetaSeleccionada?.ingredientes.join(", ") ?? "");
    const [pasos, setPasos] = useState(recetaSeleccionada?.pasos.join(". ") ?? "");
    const [dificultad, setDificultad] = useState<'Facil' | 'Media' | 'Dificil'>(recetaSeleccionada?.dificultad ?? "Facil");
    const [imagenFile, setImagenFile] = useState<File | null>(null);
    const [imagenPreview, setImagenPreview] = useState<string | null>(recetaSeleccionada?.imagen ?? null);

    function handleImagenChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setImagenFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagenPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if(nombre.trim().length > 0 && ingredientes.length > 0 && pasos.length > 0 && dificultad) {
            if (recetaSeleccionada != null) {
                const nuevaReceta : Receta = {...recetaSeleccionada, nombre: nombre,
                     ingredientes: ingredientes.split(',').map(ing => ing.trim()),
                      pasos: pasos.split('.').map(p => p.trim()),
                       dificultad: dificultad};

                editarReceta(nuevaReceta, imagenFile ?? undefined)
            }else {
                anadirReceta(nombre.trim(),
                 ingredientes.split(',').map(ing => ing.trim()),
                  pasos.split('.').map(p => p.trim()),
                   dificultad,
                   imagenFile ?? undefined);
            }
        }
    }

    return <>
    <h2>{recetaSeleccionada ? `Editar receta: ${recetaSeleccionada.nombre}` : "agregar nueva receta"}</h2>
    <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nombre de la receta" value={nombre} onChange={e => setNombre(e.target.value)} required />
        <br />
        
        <div className="imagen-upload-container">
            <label className="imagen-upload-label">
                <span>Seleccionar imagen (opcional)</span>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImagenChange}
                    className="imagen-upload-input"
                />
            </label>
            {imagenPreview && (
                <div className="imagen-preview">
                    <img src={imagenPreview.startsWith('data:') ? imagenPreview : `http://localhost:3000${imagenPreview}`} alt="Vista previa" />
                </div>
            )}
        </div>
        <br />
        
        <textarea placeholder="Ingredientes (separados por comas)" value={ingredientes} onChange={e => setIngredientes(e.target.value)} required></textarea>
        <br />
        <textarea placeholder="Pasos (separados por puntos)" value={pasos} onChange={e => setPasos(e.target.value)} required></textarea>
        <br />
        <select value={dificultad} onChange={e => setDificultad(e.target.value as 'Facil' | 'Media' | 'Dificil')}>
            <option value="Facil">Fácil</option>
            <option value="Media">Media</option>
            <option value="Dificil">Difícil</option>
        </select>
        <br />
        <button type="submit">{recetaSeleccionada ? "Editar" : "agregar"}</button>
        {recetaSeleccionada && <button type="button" className="cancel" onClick={cancelarEdicionReceta}>Cancelar</button>}
    </form>
    </>;
}

export default RecetaForm;
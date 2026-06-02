import { useState } from "react";
import type { Receta } from "../types/Recetas";

type RecetaFormProps = {
    anadirReceta: (nombre: string, ingredientes: string[], pasos: string[], dificultad: 'Facil' | 'Media' | 'Dificil', imagenFile?: File) => Promise<void>;
    editarReceta : (receta: Receta, imagenFile?: File) => Promise<void>;
    cancelarEdicionReceta: () => (void);
    recetaSeleccionada: Receta | null;
    guardando: boolean;
    error: string | null;
}

function RecetaForm({ anadirReceta, recetaSeleccionada, editarReceta, cancelarEdicionReceta, guardando, error }: RecetaFormProps ) {
    const [nombre, setNombre] = useState(recetaSeleccionada?.nombre ?? "");
    const [ingredientes, setIngredientes] = useState(recetaSeleccionada?.ingredientes.join(", ") ?? "");
    const [pasos, setPasos] = useState(recetaSeleccionada?.pasos.join(". ") ?? "");
    const [dificultad, setDificultad] = useState<'Facil' | 'Media' | 'Dificil'>(recetaSeleccionada?.dificultad ?? "Facil");
    const [imagenFile, setImagenFile] = useState<File | null>(null);
    const [imagenPreview, setImagenPreview] = useState<string | null>(recetaSeleccionada?.imagen ?? null);
    const [imagenError, setImagenError] = useState<string | null>(null);

    function handleImagenChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setImagenFile(null);
                setImagenError("La imagen no es válida. Selecciona un archivo de imagen.");
                return;
            }

            setImagenError(null);
            setImagenFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagenPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (guardando || imagenError) {
            return;
        }

        if(nombre.trim().length > 0 && ingredientes.length > 0 && pasos.length > 0 && dificultad) {
            if (recetaSeleccionada != null) {
                const nuevaReceta : Receta = {...recetaSeleccionada, nombre: nombre,
                     ingredientes: ingredientes.split(',').map(ing => ing.trim()),
                      pasos: pasos.split('.').map(p => p.trim()),
                       dificultad: dificultad};

                await editarReceta(nuevaReceta, imagenFile ?? undefined)
            }else {
                await anadirReceta(nombre.trim(),
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
        <input type="text" placeholder="Nombre de la receta" value={nombre} onChange={e => setNombre(e.target.value)} required disabled={guardando} />
        <br />
        
        <div className="imagen-upload-container">
            <label className="imagen-upload-label">
                <span>Seleccionar imagen (opcional)</span>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImagenChange}
                    className="imagen-upload-input"
                    disabled={guardando}
                />
            </label>
            {imagenError && <div className="toast error">{imagenError}</div>}
            {imagenPreview && (
                <div className="imagen-preview">
                    <img src={imagenPreview.startsWith('data:') ? imagenPreview : `http://localhost:3000${imagenPreview}`} alt="Vista previa" />
                </div>
            )}
        </div>
        <br />
        
        <textarea placeholder="Ingredientes (separados por comas)" value={ingredientes} onChange={e => setIngredientes(e.target.value)} required disabled={guardando}></textarea>
        <br />
        <textarea placeholder="Pasos (separados por puntos)" value={pasos} onChange={e => setPasos(e.target.value)} required disabled={guardando}></textarea>
        <br />
        <select value={dificultad} onChange={e => setDificultad(e.target.value as 'Facil' | 'Media' | 'Dificil')} disabled={guardando}>
            <option value="Facil">Fácil</option>
            <option value="Media">Media</option>
            <option value="Dificil">Difícil</option>
        </select>
        <br />
        <button type="submit" disabled={guardando}>{guardando ? "Guardando..." : recetaSeleccionada ? "Editar" : "Agregar"}</button>
        {recetaSeleccionada && <button type="button" className="cancel" onClick={cancelarEdicionReceta} disabled={guardando}>Cancelar</button>}
        {error && <div className="toast error">{error}</div>}
    </form>
    </>;
}

export default RecetaForm;
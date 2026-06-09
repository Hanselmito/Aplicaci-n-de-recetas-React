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
    const [validationError, setValidationError] = useState<string | null>(null);

    function handleImagenChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setImagenFile(null);
                setImagenError("La imagen no es válida. Selecciona un archivo de imagen.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB
                setImagenFile(null);
                setImagenError("La imagen es demasiado grande. El tamaño máximo es 5MB.");
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
        setValidationError(null);

        if (guardando || imagenError) {
            return;
        }

        const nombreTrimmed = nombre.trim();
        if (nombreTrimmed.length < 3) {
            setValidationError("El nombre de la receta debe tener al menos 3 caracteres.");
            return;
        }

        const ingredientesList = ingredientes.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
        if (ingredientesList.length === 0) {
            setValidationError("Debes añadir al menos un ingrediente.");
            return;
        }

        const pasosList = pasos.split('.').map(p => p.trim()).filter(p => p.length > 0);
        if (pasosList.length === 0) {
            setValidationError("Debes añadir al menos un paso.");
            return;
        }

        if (recetaSeleccionada != null) {
            const nuevaReceta : Receta = {...recetaSeleccionada, nombre: nombreTrimmed,
                    ingredientes: ingredientesList,
                    pasos: pasosList,
                    dificultad: dificultad};

            await editarReceta(nuevaReceta, imagenFile ?? undefined)
        } else {
            await anadirReceta(nombreTrimmed,
                ingredientesList,
                pasosList,
                dificultad,
                imagenFile ?? undefined);
        }
    }

    return <>
    <h2>{recetaSeleccionada ? `Editar receta: ${recetaSeleccionada.nombre}` : "agregar nueva receta"}</h2>
    <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nombre de la receta (mín. 3 caracteres)" value={nombre} onChange={e => setNombre(e.target.value)} required disabled={guardando} />
        <br />
        
        <div className="imagen-upload-container">
            <label className="imagen-upload-label">
                <span>Seleccionar imagen (opcional, máx. 5MB)</span>
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
        {validationError && <div className="toast error">{validationError}</div>}
        {error && !validationError && <div className="toast error">{error}</div>}
    </form>
    </>;
}

export default RecetaForm;
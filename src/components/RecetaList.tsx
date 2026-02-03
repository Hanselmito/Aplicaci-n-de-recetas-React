import type { Receta } from "../types/Recetas";

type RecetaListProps = {
    recetas: Receta[];
    cargando: boolean;
    peticionEnProgreso: boolean;
    borrarReceta: (receta : Receta) => void;
    setRecetaSeleccionada: (receta :Receta) => void;
};

function RecetaList({ recetas, cargando, peticionEnProgreso, setRecetaSeleccionada, borrarReceta }: RecetaListProps) {
    return (
        <>
        {cargando && <p>Cargando...</p>}
        {!cargando && (
        <ul>
            {recetas && 
                recetas.map((receta) => (
                <li key={receta.id} className={receta.nombre ? "" :""}>
                    {receta.nombre}{" "}
                    <button disabled={peticionEnProgreso}
                    className="edit"
                    onClick={() => setRecetaSeleccionada(receta)}
                    >Edit
                    </button>
                    <button 
                    disabled={peticionEnProgreso} 
                    className="delete" 
                    onClick={() => borrarReceta(receta)}
                    >X
                    </button></li>
                ))}
        </ul>
        )}
        </>
    );
}

export default RecetaList;
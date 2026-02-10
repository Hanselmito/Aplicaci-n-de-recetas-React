import { useNavigate } from "react-router-dom";
import type { Receta } from "../types/Recetas";

type RecetaListProps = {
    recetas: Receta[];
    cargando: boolean;
    borrarReceta: (receta : Receta) => void;
    editarReceta: (receta : Receta) => void;
    setRecetaSeleccionada: (receta :Receta) => void;
};

function RecetaList({ recetas, cargando, setRecetaSeleccionada, borrarReceta, editarReceta }: RecetaListProps) {
    const navigate = useNavigate();
    function verReceta(receta: Receta): void {
        navigate(`/recetas/${receta.id}`);
    } 

    return (
        <>
        {cargando && <p>Cargando...</p>}
        {!cargando && (
        <ul>
            {recetas && 
                recetas.map((receta) => (
                <li key={receta.id} className={receta.nombre ? "" :""}>
                    <span className="nombreReceta" onClick={() => {verReceta(receta)}}>{receta.nombre}</span>{" "}
                    <button
                    className="complete"
                    onClick={() => editarReceta({...receta})}>V</button>
                    <button
                    className="edit"
                    onClick={() => setRecetaSeleccionada(receta)}
                    >Edit
                    </button>
                    <button
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
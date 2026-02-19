import { useNavigate } from "react-router-dom";
import type { Receta } from "../types/Recetas";

type RecetaCardProps = {
    receta: Receta;
    borrarReceta: (receta: Receta) => void;
};

function RecetaCard({ receta, borrarReceta }: RecetaCardProps) {
    const navigate = useNavigate();

    function verReceta(): void {
        navigate(`/recetas/${receta.id}`);
    }

    const imagenPredeterminada = "https://via.placeholder.com/300x200?text=Sin+Imagen";
    const imagenUrl = receta.imagen 
        ? (receta.imagen.startsWith('http') ? receta.imagen : `http://localhost:3000${receta.imagen}`)
        : imagenPredeterminada;

    return (
        <div className="receta-card">
            <div className="receta-card-imagen" onClick={verReceta}>
                <img 
                    src={imagenUrl} 
                    alt={receta.nombre}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = imagenPredeterminada;
                    }}
                />
            </div>
            <div className="receta-card-content">
                <h3 onClick={verReceta} className="receta-card-titulo">{receta.nombre}</h3>
                <p className="receta-card-dificultad">Dificultad: {receta.dificultad}</p>
                <div className="receta-card-actions">
                    <button
                        className="delete"
                        onClick={() => borrarReceta(receta)}
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RecetaCard;

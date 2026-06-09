import { useEffect,useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { recetaService } from "../services/recetaService";
import type { Receta } from "../types/Recetas";
import RecetaForm from "../components/RecetaForm";
import IngredientesList from "../components/IngredientesList";
import { getApiErrorMessage } from "../services/http";

export default function RecetaDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [cargando, setCargando] = useState<boolean>(true);
    const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | undefined | null>(undefined);
    const [modoEdicion, setModoEdicion] = useState<boolean>(false);
    const [guardando, setGuardando] = useState<boolean>(false);
    const [eliminando, setEliminando] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    function cargarReceta() {
        if (id) {
            setCargando(true);
            setError(null);
            recetaService.get(parseInt(id))
                .then((receta) => setRecetaSeleccionada(receta))
                .catch((error) => {
                    setRecetaSeleccionada(null)
                    setError(getApiErrorMessage(error, "No se pudo cargar la receta."))
                })
                .finally(() => setCargando(false));
        }
    }

    useEffect(() => {
        if (id) {
            cargarReceta();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function editarReceta(receta: Receta, imagenFile?: File): Promise<void> {
        setError(null);
        setGuardando(true);

        try {
            const recetaActualizada = await recetaService.update(receta, imagenFile);
            setRecetaSeleccionada(recetaActualizada);
            setModoEdicion(false);
        } catch (error) {
            setError(getApiErrorMessage(error, "No se pudo guardar la receta."));
        } finally {
            setGuardando(false);
        }
    }

    function cancelarEdicion(): void {
        setModoEdicion(false);
    }

    async function eliminarReceta(): Promise<void> {
        if (recetaSeleccionada && window.confirm(`¿Estás seguro de eliminar "${recetaSeleccionada.nombre}"?`)) {
            setError(null);
            setEliminando(true);

            try {
                await recetaService.delete(recetaSeleccionada.id);
                navigate('/recetas');
            } catch (error) {
                setError(getApiErrorMessage(error, "No se pudo eliminar la receta."));
            } finally {
                setEliminando(false);
            }
        }
    }

    if (!id) {
        return <p className="card">No se encontró el ID de la receta.</p>
    }

    const imagenUrl = recetaSeleccionada?.imagen 
        ? (recetaSeleccionada.imagen.startsWith('http') ? recetaSeleccionada.imagen : `http://localhost:3000${recetaSeleccionada.imagen}`)
        : "https://via.placeholder.com/400x300?text=Sin+Imagen";

    return (<section className="detail card">
        {cargando && <p>Cargando...</p>}
        {error && <div className="toast error">{error}</div>}
        
        {!cargando && recetaSeleccionada && !modoEdicion && <>
            <div className="detail-header">
                <div className="detail-actions">
                    <Link className="btn" to="/recetas">Volver a la lista de recetas</Link>
                </div>
                <span className="detail-dificultad">Dificultad: {recetaSeleccionada.dificultad}</span>
                <div className="detail-actions">
                    <button className="edit" onClick={() => setModoEdicion(true)} disabled={eliminando}>Editar</button>
                    <button className="delete" onClick={eliminarReceta} disabled={eliminando}>{eliminando ? "Eliminando..." : "Eliminar"}</button>
                </div>
            </div>
            
            {recetaSeleccionada.imagen && (
                <div className="detail-imagen">
                    <img src={imagenUrl} alt={recetaSeleccionada.nombre} />
                </div>
            )}
            
            <h1 className="detail-nombre">{recetaSeleccionada.nombre}</h1>
            
            <div className="detail-section">
                <h3>Ingredientes:</h3>
                <IngredientesList ingredientes={recetaSeleccionada.ingredientes} />
            </div>
            
            <div className="detail-section">
                <h3>Pasos:</h3>
                <ol className="detail-list">
                    {recetaSeleccionada.pasos.map((paso, idx) => (
                        <li key={idx}>{paso}</li>
                    ))}
                </ol>
            </div>
        </>}
        
        {!cargando && recetaSeleccionada && modoEdicion && <>
            <RecetaForm
                anadirReceta={async () => {}}
                recetaSeleccionada={recetaSeleccionada}
                editarReceta={editarReceta}
                cancelarEdicionReceta={cancelarEdicion}
                guardando={guardando}
                error={error}
            />
        </>}
        
        {!cargando && !error && recetaSeleccionada === null && <p>Receta no encontrada</p>}
    </section>)
}
import { useEffect,useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { recetaService } from "../services/recetaService";
import type { Receta } from "../types/Recetas";
import RecetaForm from "../components/RecetaForm";

export default function RecetaDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [cargando, setCargando] = useState<boolean>(true);
    const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | undefined | null>(undefined);
    const [modoEdicion, setModoEdicion] = useState<boolean>(false);

    function cargarReceta() {
        if (id) {
            setCargando(true);
            recetaService.get(parseInt(id))
                .then((receta) => setRecetaSeleccionada(receta))
                .catch(() => {setRecetaSeleccionada(null)})
                .finally(() => setCargando(false));
        }
    }

    useEffect(() => {
        if (id) {
            cargarReceta();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    function editarReceta(receta: Receta, imagenFile?: File): void {
        recetaService.update(receta, imagenFile).then((recetaActualizada) => {
            setRecetaSeleccionada(recetaActualizada);
            setModoEdicion(false);
        });
    }

    function cancelarEdicion(): void {
        setModoEdicion(false);
    }

    function eliminarReceta(): void {
        if (recetaSeleccionada && window.confirm(`¿Estás seguro de eliminar "${recetaSeleccionada.nombre}"?`)) {
            recetaService.delete(recetaSeleccionada.id).then(() => {
                navigate('/recetas');
            });
        }
    }

    if (!id) {
        return <p className="card">No se encontró el ID de la receta.</p>
    }

    if (recetaSeleccionada === null) {
        return <p className="card">Receta no existente</p>
    }

    const imagenUrl = recetaSeleccionada?.imagen 
        ? (recetaSeleccionada.imagen.startsWith('http') ? recetaSeleccionada.imagen : `http://localhost:3000${recetaSeleccionada.imagen}`)
        : "https://via.placeholder.com/400x300?text=Sin+Imagen";

    return (<section className="detail card">
        {cargando && <p>Cargando...</p>}
        
        {!cargando && recetaSeleccionada && !modoEdicion && <>
            <div className="detail-header">
                <span className="detail-dificultad">Dificultad: {recetaSeleccionada.dificultad}</span>
                <div className="detail-actions">
                    <button className="edit" onClick={() => setModoEdicion(true)}>Editar</button>
                    <button className="delete" onClick={eliminarReceta}>Eliminar</button>
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
                <ul className="detail-list">
                    {recetaSeleccionada.ingredientes.map((ing, idx) => (
                        <li key={idx}>{ing}</li>
                    ))}
                </ul>
            </div>
            
            <div className="detail-section">
                <h3>Pasos:</h3>
                <ol className="detail-list">
                    {recetaSeleccionada.pasos.map((paso, idx) => (
                        <li key={idx}>{paso}</li>
                    ))}
                </ol>
            </div>
            
            <div className="detail-footer">
                <Link className="btn" to="/recetas">Volver a la lista de recetas</Link>
            </div>
        </>}
        
        {!cargando && recetaSeleccionada && modoEdicion && <>
            <RecetaForm
                anadirReceta={() => {}}
                recetaSeleccionada={recetaSeleccionada}
                editarReceta={editarReceta}
                cancelarEdicionReceta={cancelarEdicion}
            />
        </>}
        
        {!cargando && recetaSeleccionada === null && <p>Receta no encontrada</p>}
    </section>)
}
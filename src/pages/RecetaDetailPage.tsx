import { useEffect,useState } from "react";
import { Link,useParams } from "react-router-dom";
import { recetaService } from "../services/recetaService";
import type { Receta } from "../types/Recetas";

export default function RecetaDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [cargando, setCargando] = useState<boolean>(true);
    const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | undefined | null>(undefined);


    useEffect(() => {
        if (id) {
            recetaService.get(parseInt(id)).then((receta) => setRecetaSeleccionada(receta)).catch(() => {setRecetaSeleccionada(null)}).finally(() => setCargando(false));
        }
    }, [id]);

    if (!id) {
        return <p>No se encontró el ID de la receta.</p>
    }

    if (recetaSeleccionada === null) {
        return <p>Receta no existente</p>
    }

    return (<section className="detail card">
        <div className="detail-header">
            <Link className="detail-back" to="/recetas">Volver a la lista de recetas </Link>
            {!cargando && recetaSeleccionada && <span className="detail-dificultad">Dificultad: {recetaSeleccionada.dificultad}</span>}
        </div>
        {!cargando && recetaSeleccionada && <>
            <h1 className="detail-nombre">{recetaSeleccionada.nombre}</h1>
            <p className="muted"> ID: {recetaSeleccionada.id}</p>
            <p className="muted">Ingrediente: {recetaSeleccionada.ingredientes.join(", ")}</p>
            <p className="muted">Pasos: {recetaSeleccionada.pasos.join(". ")}</p>
        </>
        }
        {cargando && <p>Cargando...</p>}
        {!cargando && recetaSeleccionada === null && <p>Receta no encontrada</p>}
        <div className="detail-footer">
            <Link className="btn" to="/recetas">Volver a la lista de recetas</Link>
        </div>
    </section>)
}
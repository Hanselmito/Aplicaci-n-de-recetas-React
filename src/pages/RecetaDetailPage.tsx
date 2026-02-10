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
            recetaService.get(parseInt(id)).then((receta) => setRecetaSeleccionada(receta)).finally(() => setCargando(false));
        }
    }, [id]);

    if (!id) {
        return <p>No se encontró el ID de la receta.</p>
    }

    if (recetaSeleccionada === null) {
        return <p>receta no existente</p>
    }

    return (<section className="">
        <div className="">
            <Link className="" to="/recetas">Volver a la lista de recetas</Link>
            {!cargando && recetaSeleccionada && <span className="">Dificultad: {recetaSeleccionada.dificultad}</span>}
        </div>
        {!cargando && recetaSeleccionada && <>
            <h1 className="">{recetaSeleccionada.nombre}</h1>
            <p className="muted"> ID: {recetaSeleccionada.id}</p>
        </>
        }
        {cargando && <p>Cargando...</p>}
        <div className="">
            <Link className="btn" to="/recetas">Volver a la lista de recetas</Link>
        </div>
    </section>)
}
import { recetaService } from "../services/recetaService";
import type { Receta } from "../types/Recetas";
import { useEffect, useState } from "react";
import RecetaCard from "../components/RecetaCard";


export default function RecetasPage() {
    const [error, setError] = useState<string | null>(null);
    const [recetas, setRecetas] = useState<Receta[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);



    function borrarReceta(recetaObjetivo : Receta): void {
        recetaService.delete(recetaObjetivo.id).then(() => {
            setRecetas((prev) => prev.filter((r) => r.id !== recetaObjetivo.id));
        });
    }

    useEffect(() => {
        recetaService
        .getAll()
        .then((listaRecetas) => setRecetas(listaRecetas))
        .catch((respuestaErronea) => { setError(respuestaErronea.message + ": " + respuestaErronea.response.data.message)})
        .finally(() => setCargando(false));
    }, []);

    return (
        <section>
            <h1>Mis Recetas</h1>
            {!error && (
                <>
                    {cargando && <p>Cargando recetas...</p>}
                    {!cargando && (
                        <div className="recetas-grid">
                            {recetas.length === 0 ? (
                                <p>No hay recetas. ¡Crea tu primera receta!</p>
                            ) : (
                                recetas.map((receta) => (
                                    <RecetaCard
                                        key={receta.id}
                                        receta={receta}
                                        borrarReceta={borrarReceta}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </>
            )}
            {error && <div className="toast error">{error}</div>}
        </section>
    );
}
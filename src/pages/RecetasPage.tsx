import { recetaService } from "../services/recetaService";
import type { Receta } from "../types/Recetas";
import { useEffect, useState } from "react";
import RecetaList from "../components/RecetaList";
import RecetaForm from "../components/RecetaForm";


export default function RecetasPage() {
    const [error, setError] = useState<string | null>(null);
    const [recetas, setRecetas] = useState<Receta[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [recetaSeleccionada, setRecetaSleccionada] = useState<Receta | null>(null);


    function borrarReceta(recetaObjetivo : Receta): void {
        recetaService.delete(recetaObjetivo.id).then(() => {
            setRecetas((prev) => prev.filter((r) => r.id !== recetaObjetivo.id));
        });
    }

    function cancelarEdicionReceta(): void {
        setRecetaSleccionada(null);
    }

    function editarReceta(recetaObjetivo : Receta): void {
        recetaService.update(recetaObjetivo).then(() => {
            setRecetas((prev) => prev.map((r) => r.id == recetaObjetivo.id ? recetaObjetivo : r));
            cancelarEdicionReceta();
        });
    }

    function anadirReceta(nombre : string, ingredientes: string[], pasos: string[], dificultad: 'Facil' | 'Media' | 'Dificil'): void {
        recetaService.create(nombre, ingredientes, pasos, dificultad).then((nuevaReceta) => {
            setRecetas((prev) => [...prev, nuevaReceta]);
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
        <section className="card">
            <h1>Lista de Recetas</h1>

            <p className="muted">
                consejo: haz click en el nombre para ver los detalles de la receta.
            </p>

            {!error && <>
            <RecetaList
            recetas={recetas}
            cargando={cargando}
            borrarReceta={borrarReceta}
            editarReceta={editarReceta}
            setRecetaSeleccionada={setRecetaSleccionada}
            />

            <RecetaForm
            key = {recetaSeleccionada?.id ?? null}
            anadirReceta={anadirReceta}
            recetaSeleccionada={recetaSeleccionada}
            editarReceta={editarReceta}
            cancelarEdicionReceta={cancelarEdicionReceta}
            />
            </>}
            {error && <div className="toast error">{error}</div>}
        </section>
    );
}
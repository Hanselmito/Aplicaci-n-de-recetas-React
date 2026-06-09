import { recetaService } from "../services/recetaService";
import type { Receta } from "../types/Recetas";
import { useEffect, useState, useMemo } from "react";
import RecetaCard from "../components/RecetaCard";


export default function RecetasPage() {
    const [error, setError] = useState<string | null>(null);
    const [recetas, setRecetas] = useState<Receta[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    
    // Estados para filtrado y ordenación
    const [filtroDificultad, setFiltroDificultad] = useState<string>("");
    const [orden, setOrden] = useState<string>("");

    useEffect(() => {
        recetaService
        .getAll()
        .then((listaRecetas) => setRecetas(listaRecetas))
        .catch((respuestaErronea) => { setError(respuestaErronea.message + ": " + respuestaErronea.response.data.message)})
        .finally(() => setCargando(false));
    }, []);

    const recetasProcesadas = useMemo(() => {
        let resultado = [...recetas];

        // Filtrado por dificultad
        if (filtroDificultad) {
            resultado = resultado.filter(r => r.dificultad === filtroDificultad);
        }

        // Ordenación
        if (orden === "nombre") {
            resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
        } else if (orden === "dificultad") {
            const pesoDificultad: Record<string, number> = { "Facil": 1, "Media": 2, "Dificil": 3 };
            resultado.sort((a, b) => pesoDificultad[a.dificultad] - pesoDificultad[b.dificultad]);
        }

        return resultado;
    }, [recetas, filtroDificultad, orden]);

    return (
        <section>
            <h1>Mis Recetas</h1>
            
            <div className="controles-recetas" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                    <label htmlFor="filtroDificultad" style={{ marginRight: '0.5rem' }}>Filtrar por dificultad:</label>
                    <select 
                        id="filtroDificultad" 
                        value={filtroDificultad} 
                        onChange={(e) => setFiltroDificultad(e.target.value)}
                    >
                        <option value="">Todas</option>
                        <option value="Facil">Fácil</option>
                        <option value="Media">Media</option>
                        <option value="Dificil">Difícil</option>
                    </select>
                </div>
                
                <div>
                    <label htmlFor="ordenRecetas" style={{ marginRight: '0.5rem' }}>Ordenar por:</label>
                    <select 
                        id="ordenRecetas" 
                        value={orden} 
                        onChange={(e) => setOrden(e.target.value)}
                    >
                        <option value="">Sin orden específico</option>
                        <option value="nombre">Nombre (A-Z)</option>
                        <option value="dificultad">Dificultad (Fácil a Difícil)</option>
                    </select>
                </div>
            </div>

            {!error && (
                <>
                    {cargando && <p>Cargando recetas...</p>}
                    {!cargando && (
                        <div className="recetas-grid">
                            {recetasProcesadas.length === 0 ? (
                                <p>{recetas.length === 0 ? "No hay recetas. ¡Crea tu primera receta!" : "No hay recetas que coincidan con los filtros."}</p>
                            ) : (
                                recetasProcesadas.map((receta) => (
                                    <RecetaCard
                                        key={receta.id}
                                        receta={receta}
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
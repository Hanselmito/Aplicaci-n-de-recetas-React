import { useState } from "react";
import RecetaForm from "../components/RecetaForm";
import { recetaService } from "../services/recetaService";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../services/http";

export default function AboutPage() {
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [guardando, setGuardando] = useState<boolean>(false);
    const navigate = useNavigate();

    async function anadirReceta(nombre: string, ingredientes: string[], pasos: string[], dificultad: 'Facil' | 'Media' | 'Dificil', imagenFile?: File): Promise<void> {
        setError(null);
        setMensaje(null);
        setGuardando(true);

        try {
            const nuevaReceta = await recetaService.create(nombre, ingredientes, pasos, dificultad, imagenFile);
            setMensaje(`¡Receta "${nuevaReceta.nombre}" creada exitosamente!`);
            setTimeout(() => {
                navigate('/recetas');
            }, 2000);
        } catch (error) {
            setError(getApiErrorMessage(error, "No se pudo guardar la receta."));
        } finally {
            setGuardando(false);
        }
    }

    return (
        <section className="card">
            <h1>Crear Nueva Receta</h1>
            <p className="muted">
                Completa el formulario para agregar una nueva receta a tu colección.
            </p>
            
            <RecetaForm
                anadirReceta={anadirReceta}
                recetaSeleccionada={null}
                editarReceta={async () => {}}
                cancelarEdicionReceta={() => {}}
                guardando={guardando}
                error={error}
            />
            
            {mensaje && (
                <div className='toast success'>
                    {mensaje}
                </div>
            )}
        </section>
    );
}
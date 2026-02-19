import { useState } from "react";
import RecetaForm from "../components/RecetaForm";
import { recetaService } from "../services/recetaService";
import { useNavigate } from "react-router-dom";

export default function AboutPage() {
    const [mensaje, setMensaje] = useState<string | null>(null);
    const navigate = useNavigate();

    function anadirReceta(nombre: string, ingredientes: string[], pasos: string[], dificultad: 'Facil' | 'Media' | 'Dificil', imagenFile?: File): void {
        recetaService.create(nombre, ingredientes, pasos, dificultad, imagenFile).then((nuevaReceta) => {
            setMensaje(`¡Receta "${nuevaReceta.nombre}" creada exitosamente!`);
            setTimeout(() => {
                navigate('/recetas');
            }, 2000);
        }).catch((error) => {
            setMensaje(`Error al crear la receta: ${error.message}`);
        });
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
                editarReceta={() => {}}
                cancelarEdicionReceta={() => {}}
            />
            
            {mensaje && (
                <div className={mensaje.includes('Error') ? 'toast error' : 'toast success'}>
                    {mensaje}
                </div>
            )}
        </section>
    );
}
import { useState,useEffect } from 'react'
import './App.css'
import RecetaForm from './components/RecetaForm'
import RecetaList from './components/RecetaList'
import type { Receta } from './types/Recetas'
import { recetaService } from './services/recetaService'

function App() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [peticionEnProgreso, setPeticionEnProgreso] = useState<boolean>(false);
  const [recetaSeleccionada, setRecetaSleccionada] = useState<Receta | null>(null);

  function borrarReceta(recetaObjetivo : Receta): void {
    setPeticionEnProgreso(true);
    recetaService.delete(recetaObjetivo.id).then(() => {
      setRecetas(recetas.filter(receta => receta.id !== recetaObjetivo.id))
      setPeticionEnProgreso(false);
    })
  }

  function cancelarEdicionReceta(): void {
    setRecetaSleccionada(null);
  }

  function anadirReceta(nombre : string, ingredientes: string[], pasos: string[], dificultad: 'Facil' | 'Media' | 'Dificil'): void {
    setPeticionEnProgreso(true);
    recetaService.create(nombre, ingredientes, pasos, dificultad).then((nuevaReceta) => {
      setRecetas([...recetas, nuevaReceta]);
      setPeticionEnProgreso(false);
    })
  }

  function editarReceta(recetaObjetivo : Receta): void {
    setPeticionEnProgreso(true);
    recetaService.update(recetaObjetivo).then(() => {
      setRecetas(recetas.map(receta => receta.id == recetaObjetivo.id ? recetaObjetivo : receta))
      setPeticionEnProgreso(false);
      cancelarEdicionReceta();
    })
  }

  useEffect(() => {
    recetaService.getAll().then((listaRecetas) => {
      setRecetas(listaRecetas);
    }).finally(() => setCargando(false));
  }, []);

  return (
    <div>
      <h1>Aplicación de Recetas</h1>
      <RecetaList recetas={recetas} cargando={cargando} peticionEnProgreso={peticionEnProgreso} borrarReceta={borrarReceta} setRecetaSeleccionada={setRecetaSleccionada} />
      <RecetaForm anadirReceta={anadirReceta} peticionEnProgreso={peticionEnProgreso} recetaSeleccionada={recetaSeleccionada} editarReceta={editarReceta} cancelarEdicionReceta={cancelarEdicionReceta}/>
    </div>
  )
}

export default App

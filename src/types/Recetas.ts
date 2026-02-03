export type Receta = {
    id: number,
    nombre: string,
    ingredientes: string[],
    pasos: string[],
    dificultad: 'Facil' | 'Media' | 'Dificil'
}
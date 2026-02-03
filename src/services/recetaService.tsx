import axios from 'axios';
import type { Receta } from '../types/Recetas';

const API_URL = 'http://localhost:3000/recetas';

export const recetaService = {

    getAll(): Promise<Receta[]> {
        return axios.get<Receta[]>(API_URL).then(response => response.data);
    },


    delete(id: number): Promise<void> {
        return axios.delete<void>(API_URL + "/" + id).then(() => {})
    },

    create(receta: string, ingredientes: string[], pasos: string[], dificultad: string) : Promise<Receta> {
        return axios.post<Receta>(API_URL, {nombre: receta, ingredientes: ingredientes, pasos: pasos, dificultad: dificultad } ).then(response => response.data);
    },

    update(receta : Receta): Promise<Receta> {
        return axios.patch<Receta>((API_URL + "/" + receta.id),receta).then(response => response.data)
    }
}
import type { Receta } from '../types/Recetas';
import { http } from './http';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (API_BASE_URL == undefined) {
    throw new Error("La variable de entorno VITE_API_BASE_URL no está definida");
}

const API_URL = "/recetas";

export const recetaService = {

    get(id: number): Promise<Receta> {
        return http.get<Receta>(API_URL + "/" + id).then(response => response.data);
    },

    getAll(): Promise<Receta[]> {
        return http.get<Receta[]>(API_URL).then(response => response.data);
    },

    delete(id: number): Promise<void> {
        return http.delete<void>(API_URL + "/" + id).then(() => {})
    },

    create(nombre: string, ingredientes: string[], pasos: string[], dificultad: string, imagenFile?: File) : Promise<Receta> {
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('ingredientes', JSON.stringify(ingredientes));
        formData.append('pasos', JSON.stringify(pasos));
        formData.append('dificultad', dificultad);
        
        if (imagenFile) {
            formData.append('imagen', imagenFile);
        }
        
        return http.post<Receta>(API_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(response => response.data);
    },

    update(receta : Receta, imagenFile?: File): Promise<Receta> {
        const formData = new FormData();
        formData.append('nombre', receta.nombre);
        formData.append('ingredientes', JSON.stringify(receta.ingredientes));
        formData.append('pasos', JSON.stringify(receta.pasos));
        formData.append('dificultad', receta.dificultad);
        
        if (imagenFile) {
            formData.append('imagen', imagenFile);
        } else if (receta.imagen) {
            formData.append('imagen', receta.imagen);
        }
        
        return http.patch<Receta>((API_URL + "/" + receta.id), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(response => response.data);
    }
}
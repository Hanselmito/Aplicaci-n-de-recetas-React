import axios from 'axios';
import type { Receta } from '../types/Recetas';
import { authStorage } from '../auth/authStorage';
import type { AuthSession } from '../types/Auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (API_BASE_URL == undefined) {
    throw new Error("La variable de entorno VITE_API_BASE_URL no está definida");
}

const API_URL = API_BASE_URL+"/recetas";

// Crear instancia de axios configurada con interceptor para añadir el token
const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
    const session: AuthSession | null = authStorage.get();
    if (session?.token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
});

export const recetaService = {

    get(id: number): Promise<Receta> {
        return axiosInstance.get<Receta>(API_URL + "/" + id).then(response => response.data);
    },

    getAll(): Promise<Receta[]> {
        return axiosInstance.get<Receta[]>(API_URL).then(response => response.data);
    },

    delete(id: number): Promise<void> {
        return axiosInstance.delete<void>(API_URL + "/" + id).then(() => {})
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
        
        return axiosInstance.post<Receta>(API_URL, formData, {
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
        
        return axiosInstance.patch<Receta>((API_URL + "/" + receta.id), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(response => response.data);
    }
}
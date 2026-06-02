import axios from "axios";
import { authStorage } from "../auth/authStorage";
import type { AuthSession } from "../types/Auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const http =axios.create( {baseURL: API_BASE_URL} );

export function getApiErrorMessage(error: unknown, fallback = "Ha ocurrido un error inesperado.") {
    if (!axios.isAxiosError(error)) {
        return fallback;
    }

    if (error.code === "ERR_NETWORK" || !error.response) {
        return "El servidor no está disponible. Inténtalo más tarde.";
    }

    const status = error.response.status;
    const serverMessage = String(error.response.data?.message ?? "").toLowerCase();

    if (status === 401) {
        return "Tu sesión ha caducado. Vuelve a iniciar sesión.";
    }

    if (status === 403) {
        return "No tienes permiso para realizar esta acción.";
    }

    if (status === 404) {
        return "No se pudo cargar la receta.";
    }

    if (
        status === 400 &&
        (serverMessage.includes("imagen") ||
            serverMessage.includes("image") ||
            serverMessage.includes("archivo") ||
            serverMessage.includes("formato"))
    ) {
        return "La imagen no es válida.";
    }

    if (serverMessage) {
        return String(error.response.data?.message);
    }

    return fallback;
}

http.interceptors.request.use((config) => {
    const session: AuthSession | null = authStorage.get();
    if (session?.token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
})

http.interceptors.response.use( (response) => response, (error) => {
    if (error.response?.status === 401) {
        authStorage.clear();
        window.location.assign("/login");
    }
    return Promise.reject(error);
});
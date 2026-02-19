# Aplicacion de recetas (React + backend en Docker)

Repositorio: https://github.com/Hanselmito/Aplicaci-n-de-recetas-React.git

## Autor

- Juan David Dominguez Prieto

## Descripcion

Frontend en React (Vite + TypeScript) y backend Node.js en contenedor Docker. El backend expone la API en `http://localhost:3000` y el frontend consume esa API mediante una variable de entorno.

## Instalacion

1) Clonar el repositorio

```bash
git clone https://github.com/Hanselmito/Aplicaci-n-de-recetas-React.git
cd Aplicacion-de-recetas
```

2) Configurar variables de entorno del frontend

```bash
copy .env.dist .env
```

3) Levantar el backend con Docker

```bash
docker compose up --build
```

4) Instalar dependencias del frontend y arrancar

```bash
npm install
npm run dev
```

El frontend queda disponible en la URL que muestre Vite (por defecto `http://localhost:5173`).

## Variables de entorno

Frontend (`.env`):

- `VITE_API_BASE_URL` = `http://localhost:3000`

Backend (Docker Compose):

- `PORT` = `3000`
- `JWT_SECRET` = `mi-codigo-secreto`

## Usuario de prueba

- Email: juan@gmail.com
- Nombre: Juan
- Password: Ha123456789

## Checklist final

- [x] Proyecto React con Vite y TypeScript
- [x] Backend en Docker (docker-compose)
- [x] Variables de entorno documentadas
- [x] Usuario de prueba documentado
- [x] Pasos de instalacion detallados


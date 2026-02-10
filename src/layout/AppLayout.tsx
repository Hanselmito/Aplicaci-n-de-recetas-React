import { NavLink, Outlet } from "react-router-dom";

export default function AppLayout() {
    return (
        <div>
            <header className="navbar">
                <div className="navbar-inner">
                    <span className="brand"> React Recetas</span>
                    <nav className="navlinks">
                        <NavLink to="/recetas">Recetas</NavLink>
                        <NavLink to="/about">About</NavLink>
                        <NavLink to="/perfil">Perfil</NavLink>
                        <NavLink to="/login">Login</NavLink>
                    </nav>
                </div>
            </header>

            <main className="page">
                <Outlet />
            </main>
        </div>
    );
}
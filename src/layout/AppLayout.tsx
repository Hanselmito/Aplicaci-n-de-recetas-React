import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/authContext";

export default function AppLayout() {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <div>
            <header className="navbar">
                <div className="navbar-inner">
                    <span className="brand"> React Recetas</span>
                    <nav className="navlinks">
                        { isAuthenticated && user && <NavLink to="/recetas">Recetas</NavLink>}
                        { isAuthenticated && user && <NavLink to="/crear">Crear Receta</NavLink>}
                        { !isAuthenticated && <NavLink to="/login">Login</NavLink>}
                        { !isAuthenticated && <NavLink to="/register">Register</NavLink>}
                        { isAuthenticated && user && <>
                            <div className="nav-username"><span className="username-message">Usuario:</span><span className="username-name">{user.username}</span></div>
                            <button className="nav-btn logout" onClick={logout}>Logout</button>
                            </>}
                    </nav>
                </div>
            </header>

            <main className="page">
                <Outlet />
            </main>
        </div>
    );
}
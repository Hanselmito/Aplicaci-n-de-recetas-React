import { useState } from "react";
import { useAuth } from "../auth/authContext";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthService } from "../services/authService";

export default function LoginPage() {
    const { isAuthenticated, login } = useAuth();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ error, setError ] = useState<string | null>(null);

    const navigate = useNavigate();

    if (isAuthenticated) {
        return <Navigate to="/recetas" replace />;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const session = await AuthService.login(email.trim(), password);
            login(session);
            navigate("/recetas", {replace: true });
        } catch {
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    }
    
    return ( <section className="login-page">
        <h1>Login</h1>
        <p className="muted">Introdusca sus datos para iniciar sesion</p>

        <form onSubmit={handleSubmit}>
        <div className="form-row login-row">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </form>
      {error && <div className="toast error">{error}</div>}
      </section>);
}
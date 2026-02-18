import { useState } from "react";
import { useAuth } from "../auth/authContext";
import { Link, Navigate } from "react-router-dom";
import { AuthService } from "../services/authService";

interface DatosRegistro {
  email: string;
  password: string;
  username: string
}

export default function RegisterPage() {
    const { isAuthenticated } = useAuth();
    const [datosRegistro, setDatosRegistro] = useState<DatosRegistro>({email: "", password: "", username: ""})
    const [loading, setLoading] = useState<boolean>(false);
    const [mensaje, setMensaje] = useState<{texto: string, tipo: string} | null>(null);

    if (isAuthenticated) {
      return <Navigate to="/tasks" replace />
    }


    async function handleSubmit( e: React.FormEvent) {
      e.preventDefault();
      setMensaje(null);
      setLoading(true);

      try {
        const {email, username, password} = datosRegistro
        await AuthService.register(email.trim(), password, username.trim());
          setMensaje({texto: "Registro completado" , tipo: "success"})
      } catch (error) {
        if (AuthService.isAuthError(error)) {
          setMensaje({texto: "Error al registrarse: " + error.response?.data.message , tipo: "error"} );
        } else {
          setMensaje({texto: "Error desconocido" , tipo: "error"})
        }
      } finally {
        setLoading(false);
      }
    }

    return (<section className="card">
      <h1>Register</h1>
      { mensaje && mensaje.tipo === "success" && <p>Registro realizado con éxito. Dirígase a <Link to="/login" replace>login</Link> para iniciar sesión.</p>}
      { (!mensaje || mensaje.tipo === "error") && <>
      <p className="muted">Introduzca sus datos para registrarse</p>
      <form onSubmit={handleSubmit}>
        <div className="form-row login-row">
          <input
            type="text"
            placeholder="Username"
            value={datosRegistro.username}
            onChange={(e) => setDatosRegistro({...datosRegistro, username: e.target.value})}
            autoComplete="username"
          />

          <input
            type="text"
            placeholder="Email"
            value={datosRegistro.email}
            onChange={(e) => setDatosRegistro({...datosRegistro, email: e.target.value})}
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Password"
            value={datosRegistro.password}
            onChange={(e) => setDatosRegistro({...datosRegistro, password: e.target.value})}
            autoComplete="current-password"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrarme"}
          </button>
        </div>
      </form>
      {mensaje && <div className={`toast ${mensaje.tipo}`}>{mensaje.texto}</div>}
      </> }
    </section>);
}
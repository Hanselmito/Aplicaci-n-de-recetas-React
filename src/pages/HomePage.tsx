import { Link } from "react-router-dom";
import { useAuth } from "../auth/authContext";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="home-hero card">
      <p className="home-eyebrow">Tu recetario personal</p>

      <h1>Guarda tus recetas y vuelve a ellas cuando quieras</h1>

      <p className="home-lead">
        Reune en un mismo sitio tus platos caseros, sus ingredientes y la forma
        de prepararlos para consultar todo de manera rápida y ordenada.
      </p>

      <div className="home-actions">
        {!isAuthenticated && (
          <>
            <Link className="btn" to="/login">
              Entrar al recetario
            </Link>
            <Link className="btn secondary" to="/register">
              Crear mi cuenta
            </Link>
          </>
        )}

        {isAuthenticated && (
          <>
            <p className="home-welcome">Bienvenido, {user?.username}. Tu cocina te espera.</p>
            <Link className="btn" to="/recetas">
              Ir a mis recetas
            </Link>
          </>
        )}
      </div>

      <div className="home-features">
        <article className="home-feature">
          <h2>Tu espacio privado</h2>
          <p>Entra con tu cuenta y mantén tu recetario en una zona protegida y personal.</p>
        </article>

        <article className="home-feature">
          <h2>Edición rápida</h2>
          <p>Consulta una receta, actualiza sus pasos o elimínala cuando ya no te haga falta.</p>
        </article>
      </div>
    </section>
  );
}
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../theme';
import { clearSession, getSession } from '../session';

export default function Header({ title, children }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const session = getSession();

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{title}</p>
        {children}
      </div>
      <nav className="topbar-actions">
        <button type="button" className="btn-secondary" onClick={toggleTheme}>
          Tema: {theme === 'dark' ? 'Escuro' : 'Claro'}
        </button>
        {session && (
          <>
            {title !== 'Home' && (
              <Link className="btn-secondary" to="/home">
                Home
              </Link>
            )}
            {title !== 'Dashboard' && (
              <Link className="btn-primary" to="/dashboard">
                Dashboard
              </Link>
            )}
            {title !== 'Registros' && (
              <Link className="btn-secondary" to="/registro">
                Novo chamado
              </Link>
            )}
            {session?.user?.role === 'admin' && title !== 'Usuarios' && (
              <Link className="btn-secondary" to="/usuarios">
                Usuarios
              </Link>
            )}
            <button type="button" className="btn-secondary" onClick={handleLogout}>
              Sair
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

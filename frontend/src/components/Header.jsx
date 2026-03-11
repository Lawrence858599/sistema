import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../theme';
import { clearSession, getSession } from '../session';

export default function Header({ title, children }) {
  const { toggleTheme } = useTheme();
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
          Alternar tema
        </button>
        {session && (
          <>
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
            <button type="button" className="btn-secondary" onClick={handleLogout}>
              Sair
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

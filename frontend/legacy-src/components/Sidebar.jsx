import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../theme';
import { clearSession, getSession } from '../session';
import logo from '../assets/logo-placeholder.svg';

function NavItem({ to, children }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link className={`sidebar-link ${active ? 'is-active' : ''}`} to={to}>
      {children}
    </Link>
  );
}

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const session = getSession();
  const isAdmin = session?.user?.role === 'admin';

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <aside className="sidebar" aria-label="Navegacao">
      <div className="sidebar-handle" aria-hidden="true" />
      <div className="sidebar-inner">
        <div className="sidebar-brand">
          <div className="sidebar-logo" aria-hidden="true">
            <img src={logo} alt="" />
          </div>
          <div className="sidebar-brand-text">
            <strong>Sistema</strong>
            <span className="muted">Manutencao</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavItem to="/home">Home</NavItem>
          <NavItem to="/dashboard">Dashboard</NavItem>
          <NavItem to="/registro">Novo chamado</NavItem>
          {isAdmin && <NavItem to="/usuarios">Usuarios</NavItem>}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="btn-secondary sidebar-btn" onClick={toggleTheme}>
            Tema: {theme === 'dark' ? 'Escuro' : 'Claro'}
          </button>
          <button type="button" className="btn-secondary sidebar-btn" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}

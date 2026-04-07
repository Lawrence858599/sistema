import Sidebar from './Sidebar';

export default function Layout({ title, subtitle, children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-content">
        <header className="page-header">
          <p className="eyebrow">{title}</p>
          <h1>{subtitle}</h1>
        </header>
        <main className="page-shell">{children}</main>
      </div>
    </div>
  );
}

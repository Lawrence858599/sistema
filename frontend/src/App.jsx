import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Registro from './pages/Registro';
import Detail from './pages/Detail';
import { getSession } from './session';

function RequireAuth({ children }) {
  return getSession() ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/registro"
        element={
          <RequireAuth>
            <Registro />
          </RequireAuth>
        }
      />
      <Route
        path="/detail/:id"
        element={
          <RequireAuth>
            <Detail />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import History from './pages/History';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AddTask from './pages/AddTask';
import EditTask from './pages/EditTask';

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/add" element={<AddTask />} />
          <Route path="tasks/edit/:id" element={<EditTask />} />
          <Route path="history" element={<History />} />
          <Route path="stats" element={<Stats />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;


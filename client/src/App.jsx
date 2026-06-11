import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import ThemeToggle from './components/ui/ThemeToggle.jsx';
import Home from './features/home/Home.jsx';
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';
import BarberList from './features/barbers/BarberList.jsx';
import BarberProfile from './features/barbers/BarberProfile.jsx';
import BookingPage from './features/booking/BookingPage.jsx';
import MyReservations from './features/reservations/MyReservations.jsx';
import AdminDashboard from './features/admin/AdminDashboard.jsx';
import AdminBarbers from './features/admin/AdminBarbers.jsx';
import AdminBarberForm from './features/admin/AdminBarberForm.jsx';
import AdminServices from './features/admin/AdminServices.jsx';
import AdminReservations from './features/admin/AdminReservations.jsx';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner spinner-lg" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) {
    return <div className="loading-screen"><div className="spinner spinner-lg" /></div>;
  }

  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/barbers" element={<BarberList />} />
          <Route path="/barbers/:id" element={<BarberProfile />} />
          <Route path="/barbers/:id/book" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
          <Route path="/my-reservations" element={<ProtectedRoute><MyReservations /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/barbers" element={<ProtectedRoute roles={['ADMIN']}><AdminBarbers /></ProtectedRoute>} />
          <Route path="/admin/barbers/new" element={<ProtectedRoute roles={['ADMIN']}><AdminBarberForm /></ProtectedRoute>} />
          <Route path="/admin/barbers/:id/edit" element={<ProtectedRoute roles={['ADMIN']}><AdminBarberForm /></ProtectedRoute>} />
          <Route path="/admin/services" element={<ProtectedRoute roles={['ADMIN']}><AdminServices /></ProtectedRoute>} />
          <Route path="/admin/reservations" element={<ProtectedRoute roles={['ADMIN']}><AdminReservations /></ProtectedRoute>} />
        </Routes>
      </main>
      <ThemeToggle />
      <Footer />
    </>
  );
}

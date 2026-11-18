import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import Home from './pages/Home';
import { HomePage } from './pages/HomePage';
import Explore from './pages/Explore';
import { CreateAdvertisementPage } from './pages/CreateAdvertisementPage';
import MyAdvertisementsPage from './pages/MyAdvertisementsPage';
import MyServiceRequestsPage from './pages/MyServiceRequestsPage';
import ConversationsPage from './pages/ConversationsPage';
import SellerProfile from './pages/SellerProfile';
import ServiceDetail from './pages/ServiceDetail';
import { ToastNotification } from './components/ToastNotification';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { useSmoothScroll } from './hooks/use-smooth-scroll';
import { RequireAuth } from './components/RequireAuth';
import { AIChatWidget } from './components/AIChatWidget';
import { ThemeToggle } from './components/ThemeToggle';

function Layout() {
  const location = useLocation();
  const isConversationsRoute = location.pathname.startsWith('/conversas');

  return (
    <div
      className={
        isConversationsRoute
          ? 'flex h-screen flex-col overflow-hidden'
          : 'flex min-h-screen flex-col'
      }
    >
      <Navbar />
      <main className={isConversationsRoute ? 'grow overflow-hidden' : 'grow'}>
        <Outlet />
      </main>
      {!isConversationsRoute ? <Footer /> : null}
      {!isConversationsRoute ? <AIChatWidget /> : null}
    </div>
  );
}

function RootRoute() {
  const { user } = useAuth();
  return user ? (
    <RequireAuth>
      <HomePage />
    </RequireAuth>
  ) : (
    <Home />
  );
}

function AppContent() {
  useSmoothScroll();
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/verify-email';
  return (
    <AuthProvider>
      <ToastProvider>
        {isAuthPage && (
          <div className="fixed right-4 top-4 z-50">
            <ThemeToggle />
          </div>
        )}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<RootRoute />} />
            <Route path="/explore" element={<Explore />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <HomePage />
                </RequireAuth>
              }
            />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/novo-anuncio" element={<CreateAdvertisementPage />} />
            <Route path="/meus-anuncios" element={<MyAdvertisementsPage />} />
            <Route path="/meus-pedidos" element={<MyServiceRequestsPage />} />
            <Route
              path="/conversas"
              element={
                <RequireAuth>
                  <ConversationsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/conversas/:participantId"
              element={
                <RequireAuth>
                  <ConversationsPage />
                </RequireAuth>
              }
            />
            <Route path="/seller/:id" element={<SellerProfile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
        <ToastNotification />
      </ToastProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

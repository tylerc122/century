import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { ThemeProvider } from './theme/ThemeContext';
import { AuthProvider, useAuth } from './auth/AuthContext';

// Pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const MainApp = React.lazy(() => import('./pages/MainApp'));

const LoadingScreen = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.secondary};
  font-weight: 500;
`;

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  // Show loading indicator while checking auth
  if (isLoading) {
    return <LoadingScreen>Opening century...</LoadingScreen>;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Render children if authenticated
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Suspense fallback={<LoadingScreen>Opening century...</LoadingScreen>}><HomePage /></Suspense>} />
            <Route path="/login" element={<Suspense fallback={<LoadingScreen>Opening login...</LoadingScreen>}><LoginPage /></Suspense>} />
            <Route path="/signup" element={<Suspense fallback={<LoadingScreen>Opening signup...</LoadingScreen>}><SignupPage /></Suspense>} />
            
            {/* Protected routes */}
            <Route 
              path="/app/*" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingScreen>Opening journal...</LoadingScreen>}>
                    <MainApp />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect all other routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;

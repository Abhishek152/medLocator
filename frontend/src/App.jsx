import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import ClinicSearchPage from './pages/ClinicSearchPage';
import LabSearchPage from './pages/LabSearchPage';
import ClinicDetailsPage from './pages/ClinicDetailsPage';
import ScrollToTop from './components/ScrollToTop';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import LegalPage from './pages/LegalPage';
import ReportUploadPage from './pages/ReportUploadPage';
import MyReportsPage from './pages/MyReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col selection:bg-primary-500/30 selection:text-primary-200">
        <Navbar />
        
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/clinics" element={<ClinicSearchPage />} />
            <Route path="/labs" element={<LabSearchPage />} />
            <Route path="/clinics/:id" element={<ClinicDetailsPage />} />
            <Route path="/privacy" element={<LegalPage type="privacy" />} />
            <Route path="/terms" element={<LegalPage type="terms" />} />
            <Route path="/disclaimer" element={<LegalPage type="disclaimer" />} />

            {/* Medical Report Routes (Authenticated) */}
            <Route path="/reports/upload" element={
              <ProtectedRoute><ReportUploadPage /></ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute><MyReportsPage /></ProtectedRoute>
            } />
            <Route path="/reports/:id" element={
              <ProtectedRoute><ReportDetailPage /></ProtectedRoute>
            } />

            <Route 
              path="/doctor-dashboard" 
              element={
                <ProtectedRoute role="DOCTOR">
                  <DoctorDashboardPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>

        <Footer />
      </div>
      </BrowserRouter>
      </SearchProvider>
    </AuthProvider>
  );
}

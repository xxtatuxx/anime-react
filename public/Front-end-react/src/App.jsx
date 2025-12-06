import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/HomePage';
import AnimePage from './pages/AnimePage';
import MoviesPage from './pages/MoviesPage';
import EpisodesPage from './pages/EpisodesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WatchLaterPage from './pages/WatchLaterPage';
import HistoryPage from './pages/HistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import AnimeShowPage from './pages/AnimeShowPage';
import EpisodeShowPage from './pages/EpisodeShowPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth pages without AppLayout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Main pages with AppLayout */}
          <Route path="/" element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          } />
          <Route path="/anime" element={
            <AppLayout>
              <AnimePage />
            </AppLayout>
          } />
          <Route path="/movies" element={
            <AppLayout>
              <MoviesPage />
            </AppLayout>
          } />
          <Route path="/episodes" element={
            <AppLayout>
              <EpisodesPage />
            </AppLayout>
          } />

          {/* Show pages */}
          <Route path="/anime/:id" element={
            <AppLayout>
              <AnimeShowPage />
            </AppLayout>
          } />
          <Route path="/episodes/:id" element={
            <AppLayout>
              <EpisodeShowPage />
            </AppLayout>
          } />

          {/* User pages with AppLayout */}
          <Route path="/watch-later" element={
            <AppLayout>
              <WatchLaterPage />
            </AppLayout>
          } />
          <Route path="/history" element={
            <AppLayout>
              <HistoryPage />
            </AppLayout>
          } />
          <Route path="/notifications" element={
            <AppLayout>
              <NotificationsPage />
            </AppLayout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import LearnLesson from './pages/LearnLesson';
import Progress from './pages/Progress';
import CreatorApply from './pages/CreatorApply';
import CreatorDashboard from './pages/CreatorDashboard';
import CreatorAddLesson from './pages/CreatorAddLesson';
import AdminReview from './pages/AdminReview';
import AdminCreatorApprovals from './pages/AdminCreatorApprovals';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/courses" replace />} />
              <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
              <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
              <Route path="/learn/:courseId/:lessonId" element={<ProtectedRoute><LearnLesson /></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
              <Route path="/creator/apply" element={<ProtectedRoute><CreatorApply /></ProtectedRoute>} />
              <Route path="/creator/dashboard" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
              <Route path="/creator/add-lesson/:courseId" element={<ProtectedRoute><CreatorAddLesson /></ProtectedRoute>} />
              <Route path="/admin/review/courses" element={<ProtectedRoute><AdminReview /></ProtectedRoute>} />
              <Route path="/admin/creators/pending" element={<ProtectedRoute><AdminCreatorApprovals /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default App;

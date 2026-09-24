import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import About from './pages/About';
import Resources from './pages/Resources';
import ResourceDetails from './pages/ResourceDetails';
import Subjects from './pages/Subjects';
import SubjectDetails from './pages/SubjectDetails';

// Student Pages
import Dashboard from './pages/Dashboard';
import UploadResource from './pages/UploadResource';
import MyUploads from './pages/MyUploads';
import Bookmarks from './pages/Bookmarks';
import Profile from './pages/Profile';

// Admin / Moderator Pages
import AdminDashboard from './pages/AdminDashboard';
import PendingResources from './pages/PendingResources';
import Reports from './pages/Reports';
import ResourceManagement from './pages/ResourceManagement';
import DepartmentManagement from './pages/DepartmentManagement';
import SubjectManagement from './pages/SubjectManagement';
import UnitManagement from './pages/UnitManagement';
import UserManagement from './pages/UserManagement';
import StudentManagement from './pages/StudentManagement';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
              <Navbar />
              <div className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Navigate to="/login" replace />} />
                <Route path="/about" element={<About />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/resources/:id" element={<ResourceDetails />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/subjects/:id" element={<SubjectDetails />} />

                {/* Student Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <UploadResource />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-uploads"
                  element={
                    <ProtectedRoute>
                      <MyUploads />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookmarks"
                  element={
                    <ProtectedRoute>
                      <Bookmarks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Staff & Moderation Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['moderator', 'admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/pending"
                  element={
                    <ProtectedRoute allowedRoles={['moderator', 'admin']}>
                      <PendingResources />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['moderator', 'admin']}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/resources"
                  element={
                    <ProtectedRoute allowedRoles={['moderator', 'admin']}>
                      <ResourceManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Strict Admin Routes */}
                <Route
                  path="/admin/departments"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DepartmentManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/subjects"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <SubjectManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/units"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UnitManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/students"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <StudentManagement />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </BrowserRouter>
  );
}

export default App;

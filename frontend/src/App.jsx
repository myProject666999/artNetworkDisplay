import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Spin } from 'antd';

import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ArtworkList from './pages/ArtworkList';
import ArtworkDetail from './pages/ArtworkDetail';
import AnnouncementList from './pages/AnnouncementList';
import AnnouncementDetail from './pages/AnnouncementDetail';
import MessageBoard from './pages/MessageBoard';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminArtworks from './pages/admin/Artworks';
import AdminCategories from './pages/admin/Categories';
import AdminMessages from './pages/admin/Messages';
import AdminCarousel from './pages/admin/Carousel';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminProfile from './pages/admin/Profile';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  return user && isAdmin() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="artworks" element={<ArtworkList />} />
            <Route path="artworks/:id" element={<ArtworkDetail />} />
            <Route path="announcements" element={<AnnouncementList />} />
            <Route path="announcements/:id" element={<AnnouncementDetail />} />
            <Route path="messages" element={<MessageBoard />} />
            <Route path="profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="favorites" element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            } />
          </Route>
          
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="artworks" element={<AdminArtworks />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="carousel" element={<AdminCarousel />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

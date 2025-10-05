import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, User, LogOut, Home, Plus, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];

    const baseLinks = [
      { to: '/courses', label: 'Courses', icon: BookOpen }
    ];

    // Show Apply button for users who are not approved creators
    if (user.role === 'Creator' && user.creatorApplicationStatus !== 'Approved') {
      baseLinks.push({ to: '/creator/apply', label: 'Apply', icon: Plus });
    }

    if (user.role === 'Learner') {
      return [
        ...baseLinks,
        { to: '/progress', label: 'Progress', icon: User }
      ];
    }

    if (user.role === 'Creator') {
      return [
        ...baseLinks,
        { to: '/creator/dashboard', label: 'Dashboard', icon: Plus }
      ];
    }

    if (user.role === 'Admin') {
      return [
        ...baseLinks,
        { to: '/admin/review/courses', label: 'Review', icon: Shield },
        { to: '/admin/creators/pending', label: 'Creator Approvals', icon: Shield }
      ];
    }

    return baseLinks;
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo">
          <BookOpen size={24} style={{ marginRight: '0.5rem', display: 'inline' }} />
          MicroCourses
        </Link>
        
        {user && (
          <div className="nav-links">
            {getNavLinks().map((link) => (
              <Link key={link.to} to={link.to} className="nav-link">
                <link.icon size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
                {link.label}
              </Link>
            ))}
            
            <div className="user-info">
              <span className="user-role">{user.role}</span>
              <span>{user.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary">
                <LogOut size={16} style={{ marginRight: '0.5rem' }} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

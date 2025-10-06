import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, BookOpen, Eye, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/animations.css';

const CreatorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: 0,
    thumbnail: ''
  });
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (user && user.creatorApplicationStatus === 'Approved') {
      setShowApprovalPopup(true);
    }
  }, [user]);

  useEffect(() => {
    if (showApprovalPopup) {
      const timer = setTimeout(() => {
        setShowApprovalPopup(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showApprovalPopup]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://micro-courses-aoit.onrender.com/api/courses/creator');
      setCourses(response.data);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://micro-courses-aoit.onrender.com/api/courses', newCourse);
      setNewCourse({ title: '', description: '', price: 0, thumbnail: '' });
      setShowCreateForm(false);
      fetchCourses();
      alert('Course created successfully!');
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to create course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`https://micro-courses-aoit.onrender.com/api/courses/${courseId}`);
        fetchCourses();
        alert('Course deleted successfully!');
      } catch (err) {
        alert(err.response?.data?.msg || 'Failed to delete course');
      }
    }
  };

  const handleStatusChange = async (courseId, status) => {
    try {
      await axios.put(`https://micro-courses-aoit.onrender.com/api/courses/${courseId}`, { status });
      fetchCourses();
      alert(`Course status updated to ${status}`);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to update course status');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Draft': 'status-draft',
      'Pending Review': 'status-pending',
      'Published': 'status-published',
      'Rejected': 'status-rejected'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <BookOpen size={32} style={{ marginBottom: '1rem' }} />
        Loading your courses...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</div>
        <button onClick={fetchCourses} className="btn btn-primary">Try Again</button>
      </div>
    );
  }

  return (
    <div>
      {showApprovalPopup && (
        <div className="approval-popup" style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#2ecc71',
          color: 'white',
          padding: '2rem',
          borderRadius: '8px',
          zIndex: 1000,
          textAlign: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'opacity 0.5s ease-in-out',
          opacity: 1
        }}>
          <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
          <h2>Creator Application Approved</h2>
          <p>Your application has been approved. You can now create courses.</p>
          <button
            onClick={() => {
              setShowApprovalPopup(false);
              setShowCreateForm(true);
            }}
            className="btn btn-light"
            style={{ marginTop: '1rem' }}
          >
            Create Course Now
          </button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>
          <TrendingUp size={48} style={{ marginRight: '1rem', display: 'inline' }} />
          Creator Dashboard
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)' }}>
          Manage your courses and track your teaching journey
        </p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#333' }}>My Courses ({courses.length})</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn btn-primary"
            disabled={user && user.creatorApplicationStatus !== 'Approved'}
            title={user && user.creatorApplicationStatus !== 'Approved' ? 'You cannot create courses until your application is approved' : ''}
          >
            <Plus size={16} style={{ marginRight: '0.5rem' }} />
            Create New Course
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateCourse} style={{ 
            background: '#f8f9fa', 
            padding: '1.5rem', 
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>Create New Course</h3>
            
            <div className="form-group">
              <label className="form-label">Course Title</label>
              <input
                type="text"
                value={newCourse.title}
                onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                className="form-input"
                required
                placeholder="Enter course title"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                className="form-textarea"
                required
                placeholder="Enter course description"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({...newCourse, price: parseFloat(e.target.value) || 0})}
                  className="form-input"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Thumbnail URL</label>
                <input
                  type="url"
                  value={newCourse.thumbnail}
                  onChange={(e) => setNewCourse({...newCourse, thumbnail: e.target.value})}
                  className="form-input"
                  placeholder="Enter thumbnail URL"
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                Create Course
              </button>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <BookOpen size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
            <h3 style={{ color: '#666', marginBottom: '1rem' }}>No courses yet</h3>
            <p style={{ color: '#999', marginBottom: '1.5rem' }}>
              Create your first course to start teaching!
            </p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
            >
              <Plus size={16} style={{ marginRight: '0.5rem' }} />
              Create Your First Course
            </button>
          </div>
        ) : (
          <div className="card-grid">
            {courses.map((course) => (
              <div key={course._id} className="course-card">
                <div className="course-thumbnail">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      background: `linear-gradient(135deg, #667eea, #764ba2)`,
                      display: course.thumbnail ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '3rem',
                      width: '100%',
                      height: '100%',
                      borderRadius: '8px'
                    }}
                  >
                    <BookOpen />
                  </div>
                </div>
                
                <div className="course-content">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">{course.description}</p>
                  
                  <div className="course-meta">
                    <div className="course-price">
                      ${course.price === 0 ? 'Free' : course.price}
                    </div>
                    {getStatusBadge(course.status)}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <a
                      href={`/courses/${course._id}`}
                      className="btn btn-secondary"
                      style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
                    >
                      <Eye size={14} style={{ marginRight: '0.25rem' }} />
                      View
                    </a>

                    <Link
                      to={`/creator/add-lesson/${course._id}`}
                      className="btn btn-primary"
                      style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem', padding: '0.5rem' }}
                    >
                      <Plus size={14} style={{ marginRight: '0.25rem' }} />
                      Add Lesson
                    </Link>

                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="btn btn-danger"
                      style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  {course.status === 'Draft' && (
                    <button 
                      onClick={() => handleStatusChange(course._id, 'Pending Review')}
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.5rem' }}
                    >
                      Submit for Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;

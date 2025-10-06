import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { BookOpen, Play, DollarSign, User } from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'Learner') {
        fetchCourses();
      }
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://micro-courses-aoit.onrender.com/api/learner/courses');
      setCourses(response.data);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

const handleEnroll = async (courseId) => {
    try {
      await axios.post(`https://micro-courses-aoit.onrender.com/api/learner/courses/${courseId}/enroll`);
      alert('Enrolled successfully!');
      // Optionally refresh courses or user progress here
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to enroll in course');
      console.error(err);
    }
  };

  if (!user) {
    return null; // or loading indicator
  }

  if (user.role === 'Creator') {
    return <Navigate to="/creator/dashboard" replace />;
  }

  if (user.role === 'Admin') {
    return <Navigate to="/admin/review/courses" replace />;
  }

  if (loading) {
    return (
      <div className="loading">
        <BookOpen size={32} style={{ marginBottom: '1rem' }} />
        Loading courses...
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
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>
          <BookOpen size={48} style={{ marginRight: '1rem', display: 'inline' }} />
          Available Courses
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)' }}>
          Discover amazing courses and start your learning journey
        </p>
      </div>

      {courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <BookOpen size={64} style={{ color: '#ccc', marginBottom: '1rem' }} />
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>No courses available</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>
            Check back later for new courses!
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {courses.map((course) => (
            <div key={course._id} className="course-card">
              <div 
                className="course-thumbnail"
                style={{
                  background: `linear-gradient(135deg, #667eea, #764ba2)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '3rem'
                }}
              >
                <BookOpen />
              </div>
              
              <div className="course-content">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                
                <div className="course-meta">
                  <div className="course-price">
                    <DollarSign size={16} style={{ marginRight: '0.25rem', display: 'inline' }} />
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </div>
                  <div className="course-creator">
                    <User size={14} style={{ marginRight: '0.25rem', display: 'inline' }} />
                    {course.creator?.name || 'Unknown'}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <Link 
                    to={`/courses/${course._id}`} 
                    className="btn btn-primary"
                    style={{ flex: 1, textAlign: 'center' }}
                  >
                    <Play size={16} style={{ marginRight: '0.5rem' }} />
                    View Details
                  </Link>
                  
                  <button 
                    onClick={() => handleEnroll(course._id)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;

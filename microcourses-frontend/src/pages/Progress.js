import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Play, Award, Clock, TrendingUp } from 'lucide-react';

const Progress = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
const response = await axios.get('https://micro-courses-aoit.onrender.com/api/learner/progress');
      setEnrollments(response.data);
    } catch (err) {
      setError('Failed to load progress');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCertificate = async (courseId) => {
    try {
      const response = await axios.get(`https://micro-courses-aoit.onrender.com/api/learner/courses/${courseId}/certificate`);
      alert(`Certificate issued! Hash: ${response.data.certificateHash}`);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to get certificate');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <TrendingUp size={32} style={{ marginBottom: '1rem' }} />
        Loading your progress...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</div>
        <button onClick={fetchProgress} className="btn btn-primary">Try Again</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>
          <TrendingUp size={48} style={{ marginRight: '1rem', display: 'inline' }} />
          My Progress
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)' }}>
          Track your learning journey and achievements
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <BookOpen size={64} style={{ color: '#ccc', marginBottom: '1rem' }} />
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>No enrolled courses</h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
            Start your learning journey by enrolling in courses!
          </p>
          <Link to="/courses" className="btn btn-primary">
            <BookOpen size={16} style={{ marginRight: '0.5rem' }} />
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {enrollments.map((enrollment) => (
            <div key={enrollment._id} className="card">
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div 
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2rem',
                    flexShrink: 0
                  }}
                >
                  <BookOpen />
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#333' }}>
                    {enrollment.course?.title || 'Course Title'}
                  </h3>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    {enrollment.course?.description || 'Course description'}
                  </p>
                </div>
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${enrollment.progress}%` }}
                />
              </div>
              
              <div className="progress-text">
                {enrollment.progress}% Complete
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} style={{ color: '#667eea' }} />
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </span>
                </div>
                
                {enrollment.progress === 100 ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {enrollment.certificateIssued ? (
                      <div style={{ 
                        background: '#d4edda', 
                        color: '#155724', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <Award size={14} />
                        Certificate Issued
                      </div>
                    ) : (
                      <button 
                        onClick={() => getCertificate(enrollment.course._id)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                      >
                        <Award size={14} style={{ marginRight: '0.25rem' }} />
                        Get Certificate
                      </button>
                    )}
                  </div>
                ) : (
                  <Link 
                    to={`/courses/${enrollment.course._id}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  >
                    <Play size={14} style={{ marginRight: '0.25rem' }} />
                    Continue
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Progress;

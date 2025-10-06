import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Eye, CheckCircle, XCircle, Clock, User, DollarSign } from 'lucide-react';

const AdminReview = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://micro-courses-aoit.onrender.com/api/admin/review/courses');
      setCourses(response.data);
    } catch (err) {
      setError('Failed to load courses for review');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (courseId, status) => {
    try {
      await axios.put(`https://micro-courses-aoit.onrender.com/api/admin/courses/${courseId}/status`, { status });
      fetchPendingCourses();
      alert(`Course ${status.toLowerCase()} successfully!`);
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
        <Shield size={32} style={{ marginBottom: '1rem' }} />
        Loading courses for review...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</div>
        <button onClick={fetchPendingCourses} className="btn btn-primary">Try Again</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>
          <Shield size={48} style={{ marginRight: '1rem', display: 'inline' }} />
          Admin Review
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)' }}>
          Review and approve courses for publication
        </p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#333' }}>Courses Pending Review ({courses.length})</h2>
          <button onClick={fetchPendingCourses} className="btn btn-secondary">
            <Clock size={16} style={{ marginRight: '0.5rem' }} />
            Refresh
          </button>
        </div>

        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Shield size={64} style={{ color: '#ccc', marginBottom: '1rem' }} />
            <h3 style={{ color: '#666', marginBottom: '1rem' }}>No courses pending review</h3>
            <p style={{ color: '#999' }}>
              All courses have been reviewed. Check back later for new submissions.
            </p>
          </div>
        ) : (
          <div className="card-grid">
            {courses.map((course) => (
              <div key={course._id} className="card">
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
                    📚
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#333' }}>
                      {course.title}
                    </h3>
                    <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                      {course.description}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User size={14} style={{ color: '#667eea' }} />
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>
                          {course.creator?.name || 'Unknown'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <DollarSign size={14} style={{ color: '#667eea' }} />
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>
                          ${course.price === 0 ? 'Free' : course.price}
                        </span>
                      </div>
                    </div>
                    
                    {getStatusBadge(course.status)}
                  </div>
                </div>

                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Course Details</h4>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    <p><strong>Created:</strong> {new Date(course.createdAt).toLocaleDateString()}</p>
                    <p><strong>Creator Email:</strong> {course.creator?.email || 'N/A'}</p>
                    <p><strong>Status:</strong> {course.status}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => handleStatusUpdate(course._id, 'Published')}
                    className="btn btn-primary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <CheckCircle size={16} />
                    Approve & Publish
                  </button>
                  
                  <button 
                    onClick={() => handleStatusUpdate(course._id, 'Rejected')}
                    className="btn btn-danger"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReview;

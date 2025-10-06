import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { User, Mail, FileText, Send, CheckCircle } from 'lucide-react';

const CreatorApply = () => {
  const [formData, setFormData] = useState({
    experience: '',
    motivation: '',
    portfolio: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { user, login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/creator-apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.msg || 'Failed to submit application');
      } else {
        // Refresh user data to update creatorApplicationStatus
        try {
          const userResponse = await axios.get('https://micro-courses-aoit.onrender.com//api/auth/me');
          localStorage.setItem('user', JSON.stringify(userResponse.data));
          // Update the user state in AuthContext
          window.location.reload(); // Simple way to refresh the app state
        } catch (refreshErr) {
          console.error('Failed to refresh user data:', refreshErr);
        }
        setSubmitted(true);
      }
    } catch (err) {
      setError('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div style={{ textAlign: 'center' }}>
            <CheckCircle size={64} style={{ color: '#28a745', marginBottom: '1rem' }} />
            <h2 style={{ marginBottom: '1rem', color: '#333' }}>Application Submitted!</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Thank you for your interest in becoming a creator. 
              We'll review your application and get back to you soon.
            </p>
            <button 
              onClick={() => window.location.href = '/creator/dashboard'}
              className="btn btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-title">
          <User size={48} style={{ color: '#667eea', marginBottom: '1rem' }} />
          Become a Creator
        </div>
        <p className="auth-subtitle">
          Share your knowledge and create amazing courses for learners worldwide
        </p>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <FileText size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
              Teaching Experience
            </label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="form-textarea"
              required
              placeholder="Tell us about your teaching experience and expertise..."
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <FileText size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
              Motivation
            </label>
            <textarea
              name="motivation"
              value={formData.motivation}
              onChange={handleChange}
              className="form-textarea"
              required
              placeholder="Why do you want to become a creator on our platform?"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <FileText size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
              Portfolio/Previous Work (Optional)
            </label>
            <textarea
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Share links to your previous work, courses, or portfolio..."
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              'Submitting Application...'
            ) : (
              <>
                <Send size={16} style={{ marginRight: '0.5rem' }} />
                Submit Application
              </>
            )}
          </button>
        </form>
        
        <div style={{ 
          background: '#e3f2fd', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          color: '#1565c0'
        }}>
          <strong>Note:</strong> After submitting your application, our team will review it within 2-3 business days. 
          You'll receive an email notification once your application is approved.
        </div>
      </div>
    </div>
  );
};

export default CreatorApply;

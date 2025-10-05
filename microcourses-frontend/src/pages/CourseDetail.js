import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Play, Clock, User, DollarSign, ArrowLeft } from 'lucide-react';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolled, setEnrolled] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcripts, setTranscripts] = useState({}); // Map lessonId to transcript text

  useEffect(() => {
    fetchCourseDetails();
    checkEnrollmentStatus();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const [courseResponse, lessonsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/courses/${id}`),
        axios.get(`http://localhost:5000/api/courses/${id}/lessons`)
      ]);
      
      setCourse(courseResponse.data);
      setLessons(lessonsResponse.data);
    } catch (err) {
      setError('Failed to load course details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/learner/progress');
      const enrollment = response.data.find(e => e.course._id === id);
      if (enrollment) {
        setEnrolled(true);
      } else {
        setEnrolled(false);
      }
    } catch (err) {
      console.error('Failed to check enrollment status', err);
    }
  };

  const handleEnroll = async () => {
    try {
      await axios.post(`http://localhost:5000/api/learner/courses/${id}/enroll`);
      setEnrolled(true);
      alert('Successfully enrolled in course!');
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to enroll in course');
    }
  };

  const startLearning = (lessonId) => {
    window.location.href = `/learn/${id}/${lessonId}`;
  };

  const handleGenerateTranscript = async (lessonId) => {
    setTranscriptLoading(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/transcripts/${lessonId}/generate`);
      setTranscripts(prev => ({ ...prev, [lessonId]: response.data.transcript }));
      alert('Transcript generated successfully');
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to generate transcript');
    } finally {
      setTranscriptLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <BookOpen size={32} style={{ marginBottom: '1rem' }} />
        Loading course details...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error || 'Course not found'}</div>
        <Link to="/courses" className="btn btn-primary">
          <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/courses" className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
          Back to Courses
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <div 
            style={{
              width: '200px',
              height: '150px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '3rem',
              flexShrink: 0
            }}
          >
            <BookOpen />
          </div>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
              {course.title}
            </h1>
            
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#666', 
              lineHeight: '1.6',
              marginBottom: '1.5rem'
            }}>
              {course.description}
            </p>
            
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} style={{ color: '#667eea' }} />
                <span>{course.creator?.name || 'Unknown Creator'}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={18} style={{ color: '#667eea' }} />
                <span>{course.price === 0 ? 'Free' : `$${course.price}`}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} style={{ color: '#667eea' }} />
                <span>{lessons.length} lessons</span>
              </div>
            </div>
            
            {!enrolled ? (
              <button onClick={handleEnroll} className="btn btn-primary">
                <Play size={16} style={{ marginRight: '0.5rem' }} />
                Enroll in Course
              </button>
            ) : (
              <div style={{ 
                background: '#d4edda', 
                color: '#155724', 
                padding: '0.75rem 1rem', 
                borderRadius: '8px',
                display: 'inline-block'
              }}>
                ✓ Enrolled in this course
              </div>
            )}
          </div>
        </div>
      </div>

      {lessons.length > 0 && (
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>
            Course Lessons ({lessons.length})
          </h2>
          
          <div className="lesson-list">
            {lessons.map((lesson, index) => (
              <div key={lesson._id} className="lesson-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 className="lesson-title">
                      {index + 1}. {lesson.title}
                    </h3>
                    <p className="lesson-description">{lesson.description}</p>
                    {enrolled && transcripts[lesson._id] && (
                      <div style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', background: '#f0f0f0', padding: '0.75rem', borderRadius: '6px' }}>
                        <h4>Transcript:</h4>
                        <p>{transcripts[lesson._id]}</p>
                      </div>
                    )}
                  </div>
                  
                  {enrolled && (
                    <>
                      <button 
                        onClick={() => startLearning(lesson._id)}
                        className="btn btn-primary"
                        style={{ marginRight: '0.5rem' }}
                      >
                        <Play size={16} style={{ marginRight: '0.5rem' }} />
                        Start
                      </button>
                      <button
                        onClick={() => handleGenerateTranscript(lesson._id)}
                        className="btn btn-secondary"
                        disabled={transcriptLoading}
                      >
                        {transcriptLoading ? 'Generating Transcript...' : 'Generate Transcript'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;

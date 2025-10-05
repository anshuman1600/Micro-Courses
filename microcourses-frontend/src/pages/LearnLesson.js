import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Play, ArrowLeft, ArrowRight, CheckCircle, Clock } from 'lucide-react';

function formatYouTubeUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  const videoId = match ? match[1] : null;
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

const LearnLesson = () => {
  const { courseId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetchLessonDetails();
  }, [courseId, lessonId]);

  const fetchLessonDetails = async () => {
    try {
      setLoading(true);
      // Fetch lesson details from backend
      const lessonResponse = await axios.get(`http://localhost:5000/api/courses/${courseId}/lessons/${lessonId}`);
      console.log('Lesson data:', lessonResponse.data);
      console.log('Original videoUrl:', lessonResponse.data.videoUrl);
      console.log('Formatted videoUrl:', formatYouTubeUrl(lessonResponse.data.videoUrl));
      setLesson(lessonResponse.data);

      // Fetch course details
      const courseResponse = await axios.get(`http://localhost:5000/api/courses/${lessonResponse.data.course}`);
      setCourse(courseResponse.data);

      // Check if lesson is completed by user
      const enrollmentResponse = await axios.get(`http://localhost:5000/api/learner/progress`);
      const enrollment = enrollmentResponse.data.find(e => e.course._id === lessonResponse.data.course);
      if (enrollment && enrollment.completedLessons.includes(lessonId)) {
        setCompleted(true);
      } else {
        setCompleted(false);
      }
    } catch (err) {
      setError('Failed to load lesson');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsComplete = async () => {
    try {
      await axios.put(`http://localhost:5000/api/learner/courses/${lesson.course}/lessons/${lesson._id}/complete`);
      setCompleted(true);
      alert('Lesson marked as complete!');
    } catch (err) {
      alert('Failed to mark lesson as complete');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <Play size={32} style={{ marginBottom: '1rem' }} />
        Loading lesson...
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error || 'Lesson not found'}</div>
        <button onClick={() => window.close()} className="btn btn-primary">
          Close
        </button>
        <pre style={{ textAlign: 'left', marginTop: '1rem', background: '#eee', padding: '1rem', borderRadius: '8px', maxHeight: '300px', overflow: 'auto' }}>
          {JSON.stringify(lesson, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>
          {lesson.title}
        </h1>
        
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#666', 
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          {lesson.description}
        </p>

      <div className="video-container" style={{ marginBottom: '2rem' }}>
        {lesson.videoUrl ? (
          <>
            {formatYouTubeUrl(lesson.videoUrl) ? (
              <iframe
                className="video-player"
                src={formatYouTubeUrl(lesson.videoUrl)}
                title={lesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '600px', borderRadius: '8px' }}
              />
            ) : (
              <p style={{ color: 'red' }}>Invalid video URL: {lesson.videoUrl}</p>
            )}
            <p style={{ marginTop: '0.5rem', color: '#333' }}>
              Raw videoUrl: {lesson.videoUrl}
            </p>
          </>
        ) : (
          <p style={{ color: '#666' }}>No video available for this lesson.</p>
        )}
      </div>
      </div>

      {lesson.transcript && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', color: '#333' }}>
            <Clock size={20} style={{ marginRight: '0.5rem', display: 'inline' }} />
            Lesson Transcript
          </h2>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1.5rem', 
            borderRadius: '8px',
            lineHeight: '1.6',
            color: '#333'
          }}>
            {lesson.transcript}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>
              {completed ? 'Lesson Completed!' : 'Mark as Complete'}
            </h3>
            <p style={{ color: '#666' }}>
              {completed 
                ? 'Great job! You have completed this lesson.' 
                : 'Click the button below when you have finished watching the lesson.'
              }
            </p>
          </div>
          
          <button 
            onClick={markAsComplete}
            className={`btn ${completed ? 'btn-secondary' : 'btn-primary'}`}
            disabled={completed}
            style={{ minWidth: '200px' }}
          >
            {completed ? (
              <>
                <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
                Completed
              </>
            ) : (
              <>
                <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
                Mark Complete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearnLesson;

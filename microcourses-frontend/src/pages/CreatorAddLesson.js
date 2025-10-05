import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

const CreatorAddLesson = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState({
    title: '',
    description: '',
    videoUrl: '',
    order: '',
    id: null,
    transcript: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  const handleChange = (e) => {
    setLesson({ ...lesson, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!lesson.title || !lesson.description || !lesson.videoUrl || !lesson.order) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/courses/${courseId}/lessons`, {
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        order: parseInt(lesson.order, 10)
      });
      alert('Lesson added successfully');
      setLesson({ ...lesson, id: response.data._id });
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTranscript = async () => {
    if (!lesson.id) {
      alert('Please save the lesson first before generating transcript.');
      return;
    }
    setTranscriptLoading(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/transcripts/${lesson.id}/generate`);
      setLesson({ ...lesson, transcript: response.data.transcript });
      alert('Transcript generated successfully');
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to generate transcript');
    } finally {
      setTranscriptLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>Add Lesson to Course</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={lesson.title}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={lesson.description}
            onChange={handleChange}
            className="form-textarea"
            required
          />
        </div>
        <div className="form-group">
          <label>Video URL</label>
          <input
            type="url"
            name="videoUrl"
            value={lesson.videoUrl}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label>Order</label>
          <input
            type="number"
            name="order"
            value={lesson.order}
            onChange={handleChange}
            className="form-input"
            min="1"
            required
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Lesson'}
        </button>
      </form>
      {lesson.id && (
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={handleGenerateTranscript}
            className="btn btn-secondary"
            disabled={transcriptLoading}
          >
            {transcriptLoading ? 'Generating Transcript...' : 'Generate Transcript'}
          </button>
          {lesson.transcript && (
            <div style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', background: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
              <h4>Transcript:</h4>
              <p>{lesson.transcript}</p>
            </div>
          )}
        </div>
      )}
      <Link to="/creator/dashboard" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
        Back to Dashboard
      </Link>
    </div>
  );
};

export default CreatorAddLesson;

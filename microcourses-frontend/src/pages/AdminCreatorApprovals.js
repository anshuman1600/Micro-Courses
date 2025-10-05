import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminCreatorApprovals = () => {
  const [pendingCreators, setPendingCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingCreators();
  }, []);

  const fetchPendingCreators = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/creators/pending');
      setPendingCreators(response.data);
    } catch (err) {
      setError('Failed to load pending creator applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/creators/${userId}/status`, { status });
      fetchPendingCreators();
      alert(`Creator application ${status.toLowerCase()}`);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to update status');
    }
  };

  if (loading) {
    return <div>Loading pending creator applications...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (pendingCreators.length === 0) {
    return <div>No pending creator applications.</div>;
  }

  return (
    <div>
      <h1>Pending Creator Applications</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Application Data</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingCreators.map((user) => (
            <tr key={user._id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.name}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', whiteSpace: 'pre-wrap', maxWidth: '400px', overflowWrap: 'break-word' }}>
                <strong>Experience:</strong> {user.experience || 'N/A'}<br />
                <strong>Motivation:</strong> {user.motivation || 'N/A'}<br />
                <strong>Portfolio:</strong> {user.portfolio || 'N/A'}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                <button onClick={() => handleStatusChange(user._id, 'Approved')} style={{ marginRight: '8px' }}>
                  Approve
                </button>
                <button onClick={() => handleStatusChange(user._id, 'Rejected')}>
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCreatorApprovals;

// src/components/ServerConnectionTest.tsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api-client';

const ServerConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [serverUrl, setServerUrl] = useState<string>('');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus('loading');

        // Extract base URL from apiClient
        const baseURL = apiClient.defaults.baseURL || 'http://localhost:3060';
        setServerUrl(baseURL);

        // Try to connect to the server
        const response = await apiClient.get('/auth/check-connection', {
          timeout: 5000,
          validateStatus: () => true, // Accept any status code
        });

        if (response.status >= 200 && response.status < 500) {
          // Either a successful response or a handled error
          setStatus('connected');
        } else {
          setStatus('error');
          setErrorDetails(`Server returned status ${response.status}`);
        }
      } catch (error) {
        setStatus('error');
        if (error instanceof Error) {
          setErrorDetails(error.message);
        } else {
          setErrorDetails('Unknown error');
        }
      }
    };

    checkConnection();
  }, []);

  // Function to manually test file upload endpoint
  const testFileUpload = async () => {
    try {
      // Create a small text file
      const blob = new Blob(['Test file content'], { type: 'text/plain' });
      const file = new File([blob], 'test.txt', { type: 'text/plain' });

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Try to upload
      const response = await apiClient.post('/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      });

      alert(`Upload successful! URL: ${response.data.url}`);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Upload failed: ${error.message}`);
      } else {
        alert('Upload failed with unknown error');
      }
    }
  };

  return (
    <div className="card border-0 shadow-lg rounded-4 p-4">
      <h4 className="mb-3">Server Connection Status</h4>

      <div className="d-flex align-items-center mb-3">
        <strong className="me-2">Server URL:</strong>
        <code>{serverUrl}</code>
      </div>

      <div className="d-flex align-items-center mb-3">
        <strong className="me-2">Status:</strong>
        {status === 'loading' && <div className="badge bg-secondary">Checking connection...</div>}
        {status === 'connected' && <div className="badge bg-success">Connected</div>}
        {status === 'error' && <div className="badge bg-danger">Connection Error</div>}
      </div>

      {status === 'error' && (
        <div className="alert alert-danger">
          <strong>Error Details:</strong>
          <p className="mb-0 mt-1">{errorDetails}</p>
        </div>
      )}

      <div className="mt-3">
        <button className="btn btn-primary me-2" onClick={() => window.location.reload()}>
          Retry Connection
        </button>

        <button className="btn btn-outline-primary" onClick={testFileUpload}>
          Test File Upload
        </button>
      </div>
    </div>
  );
};

export default ServerConnectionTest;

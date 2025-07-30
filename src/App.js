import React, { useState } from 'react';
import './style.css';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription)
      .then(() => alert('Transcript copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  };

  const isValidAudioFile = (filename) => {
    const validExtensions = [
      'mp3', 'wav', 'ogg', 'flac', 'm4a',
      'aac', 'wma', 'webm', 'mp4', 'mov'
    ];
    const ext = filename.split('.').pop().toLowerCase();
    return validExtensions.includes(ext);
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    // 🚫 Reject too‑large files
    if (file.size > MAX_FILE_SIZE) {
      alert('File too large—please pick one under 20 MB.');
      return;
    }
    // 🚫 Reject invalid extensions
    if (!isValidAudioFile(file.name)) {
      alert('Please upload a valid audio file.');
      return;
    }

    setSelectedFile(file);
    setTranscription(''); // clear any previous transcript

    // get duration
    const audio = document.createElement('audio');
    audio.src = URL.createObjectURL(file);
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration.toFixed(1));
    });
  };

  const handleFileChange = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Updated for user-facing error messages
  const handleTranscribe = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setTranscription('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      console.log('Calling:', `${process.env.REACT_APP_API_BASE_URL}/transcribe`);
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/transcribe`,
        { method: 'POST', body: formData }
      );

      const text = await response.text();

      if (response.status === 413) {
        setTranscription('File too large. Please pick a file under 20 MB.');
      } else if (response.status === 415) {
        setTranscription('Unsupported file type. Please upload mp3, mp4, mpeg, mpga, m4a, wav, or webm.');
      } else if (response.status === 429) {
        setTranscription('Too many requests. Please wait a minute and try again.');  
      } else if (!response.ok) {
        setTranscription('An error occurred during transcription. Please try again.');
      } else {
        setTranscription(text || 'No text returned.');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setTranscription('An error occurred while connecting to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    setSelectedFile(null);
    setTranscription('');
    setDuration(null);
    setIsLoading(false);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTranscription('');
    setDuration(null);
    setIsLoading(false);
  };

  return (
    <div className="container">
      <h1>The No‑Fuss Transcriber</h1>
      <p>
        <a
          href="https://www.varunshetty.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          by Varun Shetty
        </a>
      </p>

      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>Drag & drop your audio file here or upload below</p>
        <input type="file" onChange={handleFileChange} />
      </div>

      {selectedFile && (
        <div className="file-info">
          <span className="checkmark">✅</span>
          <strong>{selectedFile.name}</strong> —{' '}
          {duration ? `${duration} seconds` : 'Loading...'}
        </div>
      )}

      <div className="button-group">
        <button
          onClick={handleTranscribe}
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? 'Transcribing...' : 'Transcribe'}
        </button>
        <button onClick={handleStop}>Stop</button>
      </div>

      {isLoading && (
        <div className="loader">
          <svg className="spinner" viewBox="0 0 50 50">
            <circle
              className="path"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="5"
            />
          </svg>
          <p>Transcribing...</p>
        </div>
      )}

      <textarea
        value={transcription}
        placeholder="Your transcript will appear here..."
        readOnly
      />

      {transcription && (
        <div className="post-actions">
          <button
            onClick={handleCopy}
            className="copy-button"
          >
            Copy
          </button>
          <button
            onClick={handleReset}
            className="reset-button"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default App;

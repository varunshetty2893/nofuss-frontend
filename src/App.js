import React, { useState } from 'react';
import './style.css';

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
    const validExtensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma', 'webm', 'mp4', 'mov'];
    const extension = filename.split('.').pop().toLowerCase();
    return validExtensions.includes(extension);
  };

  const handleFileSelect = (file) => {
    if (!file || !isValidAudioFile(file.name)) {
      alert('Please upload a valid audio file.');
      return;
    }

    setSelectedFile(file);

    const audio = document.createElement('audio');
    audio.src = URL.createObjectURL(file);
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration.toFixed(1));
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleTranscribe = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setTranscription('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/transcribe`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.text();
      setTranscription(data || 'No text returned.');
    } catch (err) {
      console.error('Transcription error:', err);
      const errorText = await err.response?.text?.();        // try to capture backend error
      console.log('Raw error response:', errorText);         // NEW
      setTranscription('An error occurred during transcription.');
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
      <h1>The No-Fuss Transcriber</h1>
      <p><a href="https://www.varunshetty.com" target="_blank" rel="noopener noreferrer">by Varun Shetty</a></p>

      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>Drag & drop your audio file here or upload below</p>
        <input type="file" id="fileInput" onChange={handleFileChange} />
      </div>

      {selectedFile && (
        <div className="file-info">
          <span className="checkmark">✅</span>
          <strong>{selectedFile.name}</strong> — {duration ? `${duration} seconds` : 'Loading...'}
        </div>
      )}

      <div className="button-group">
        <button onClick={handleTranscribe} disabled={!selectedFile || isLoading}>
          {isLoading ? 'Transcribing...' : 'Transcribe'}
        </button>
        <button onClick={handleStop}>Stop</button>
      </div>

     {/* ✅ Spinner */}
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
    <button onClick={handleCopy} className="copy-button">
      Copy
    </button>
    <button onClick={handleReset} className="reset-button">
      Reset
    </button>
  </div>
  )}
</div>
 );
};
export default App;

import React, { useRef, useState } from 'react';

const SimpleProfilePage = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SIMPLEST POSSIBLE CLICK HANDLER
  const handleUploadClick = () => {
    console.log('UPLOAD CLICKED');
    alert('Upload button clicked! File dialog should open.');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('File input not found');
    }
  };

  // SIMPLEST FILE HANDLER
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File change event triggered');
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      alert(`File selected: ${file.name}`);
      
      // Read file
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (result) {
          setProfileImage(result as string);
          localStorage.setItem('profileImage', result as string);
          alert('Profile picture saved!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Try all images from localStorage
  const savedImage = localStorage.getItem('profileImage');

  return (
    <div style={{ 
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>Profile Picture Test</h1>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      {/* BIG RED TEST BUTTON - Can't miss this */}
      <div style={{ 
        marginBottom: '40px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#d32f2f' }}>TEST BUTTON 1 - Click This</h2>
        <button
          onClick={handleUploadClick}
          style={{
            padding: '20px 40px',
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '10px 0'
          }}
        >
          🔴 CLICK HERE TO UPLOAD IMAGE
        </button>
        <p>This button should open file picker</p>
      </div>
      
      {/* Direct HTML Label Button */}
      <div style={{ 
        marginBottom: '40px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#1976d2' }}>TEST BUTTON 2 - Label Method</h2>
        <label
          htmlFor="fileInput"
          style={{
            padding: '20px 40px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            display: 'inline-block',
            margin: '10px 0'
          }}
        >
          🔵 CLICK THIS LABEL TO UPLOAD
        </label>
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <p>This uses HTML label to trigger file input</p>
      </div>
      
      {/* Profile Picture Display */}
      <div style={{ 
        marginBottom: '40px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h2>Profile Picture Preview</h2>
        <div style={{
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          backgroundColor: profileImage || savedImage ? 'transparent' : '#e0e0e0',
          margin: '20px auto',
          overflow: 'hidden',
          border: '3px solid #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {profileImage || savedImage ? (
            <img 
              src={profileImage || savedImage || ''} 
              alt="Profile" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '60px' }}>👤</span>
          )}
        </div>
        <p>Current image: {profileImage || savedImage ? 'Loaded' : 'No image'}</p>
      </div>
      
      {/* Debug Info */}
      <div style={{ 
        padding: '20px',
        backgroundColor: '#333',
        color: 'white',
        borderRadius: '10px',
        marginTop: '40px'
      }}>
        <h2 style={{ color: '#4caf50' }}>📊 DEBUG INFORMATION</h2>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Click the RED button or BLUE label above</li>
          <li>You should see an alert saying "Upload button clicked!"</li>
          <li>File picker should open</li>
          <li>Select any image file</li>
          <li>You should see another alert with the filename</li>
        </ol>
        
        <p><strong>If nothing happens:</strong></p>
        <ul>
          <li>Open browser console (F12 → Console)</li>
          <li>Check for any error messages</li>
          <li>Try in Chrome/Firefox/Edge</li>
          <li>Try in Incognito mode</li>
          <li>Disable browser extensions</li>
        </ul>
        
        <button
          onClick={() => {
            console.clear();
            console.log('Debug button clicked');
            alert('Console cleared. Try clicking upload buttons again.');
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Clear Console & Retry
        </button>
      </div>
      
      {/* Test vanilla JavaScript */}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => {
            // Direct vanilla JS
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e: any) => {
              const file = e.target.files[0];
              if (file) alert('Vanilla JS: ' + file.name);
            };
            input.click();
          }}
          style={{
            padding: '15px 30px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Vanilla JavaScript
        </button>
      </div>
    </div>
  );
};

export default SimpleProfilePage;
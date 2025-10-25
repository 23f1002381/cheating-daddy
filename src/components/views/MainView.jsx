import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../styles/views/MainView.css';

const MainView = ({ onStart, onAPIKeyHelp, layoutMode, onLayoutModeChange }) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [showKey, setShowKey] = useState(false);
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Validate API key format (basic validation)
  useEffect(() => {
    const isValid = apiKey.length > 30 && apiKey.startsWith('AIza');
    setIsApiKeyValid(isValid);
    
    // Save to localStorage when it changes
    if (apiKey) {
      localStorage.setItem('apiKey', apiKey);
    }
  }, [apiKey]);

  const handleStart = async () => {
    if (!isApiKeyValid) {
      setError('Please enter a valid Gemini API key');
      inputRef.current?.focus();
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onStart(apiKey);
    } catch (err) {
      console.error('Failed to start session:', err);
      setError('Failed to start session. Please check your API key and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  const toggleKeyVisibility = () => {
    setShowKey(!showKey);
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text/plain').trim();
    if (pastedText) {
      setApiKey(pastedText);
      e.preventDefault(); // Prevent default paste behavior to avoid duplication
    }
  };

  return (
    <div className={`main-view ${layoutMode === 'compact' ? 'compact' : ''}`}>
      <div className="main-content">
        <div className="welcome-container">
          <div className="app-logo">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          
          <h1>Cheating Daddy</h1>
          <p className="subtitle">Your AI-powered interview assistant</p>
          
          <div className={`api-key-input ${error ? 'error' : ''}`}>
            <div className="input-group">
              <input
                ref={inputRef}
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Enter your Gemini API key"
                className={`form-input ${isApiKeyValid ? 'valid' : ''}`}
                autoComplete="off"
                spellCheck="false"
              />
              <button 
                type="button" 
                className="toggle-visibility"
                onClick={toggleKeyVisibility}
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="api-key-actions">
              <button 
                type="button" 
                className="help-link"
                onClick={onAPIKeyHelp}
              >
                Where do I find my API key?
              </button>
              
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="get-key-link"
              >
                Get API Key
              </a>
            </div>
          </div>
          
          <button 
            className={`start-button ${!isApiKeyValid || isSubmitting ? 'disabled' : ''}`}
            onClick={handleStart}
            disabled={!isApiKeyValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                <span>Starting...</span>
              </>
            ) : (
              'Start Session'
            )}
          </button>
          
          <div className="layout-toggle">
            <span className="layout-label">Layout:</span>
            <div className="toggle-buttons">
              <button 
                className={`toggle-button ${layoutMode === 'normal' ? 'active' : ''}`}
                onClick={() => onLayoutModeChange('normal')}
              >
                Normal
              </button>
              <button 
                className={`toggle-button ${layoutMode === 'compact' ? 'active' : ''}`}
                onClick={() => onLayoutModeChange('compact')}
              >
                Compact
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer">
        <p>By using this application, you agree to our Terms of Service and Privacy Policy.</p>
        <p className="version">v0.4.0</p>
      </div>
    </div>
  );
};

MainView.propTypes = {
  onStart: PropTypes.func.isRequired,
  onAPIKeyHelp: PropTypes.func.isRequired,
  layoutMode: PropTypes.oneOf(['normal', 'compact']).isRequired,
  onLayoutModeChange: PropTypes.func.isRequired,
};

export default MainView;

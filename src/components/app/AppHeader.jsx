import React from 'react';
import PropTypes from 'prop-types';
import '../styles/AppHeader.css';

const AppHeader = ({
  currentView,
  statusText,
  startTime,
  advancedMode,
  onCustomizeClick,
  onHelpClick,
  onHistoryClick,
  onAdvancedClick,
  onCloseClick,
  onBackClick,
  onHideToggleClick,
  isClickThrough,
}) => {
  // Format the elapsed time
  const formatElapsedTime = () => {
    if (!startTime) return '00:00';
    
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Determine if we should show the back button
  const showBackButton = ['customize', 'help', 'history', 'advanced'].includes(currentView);
  
  // Determine if we should show the assistant header
  const isAssistantView = currentView === 'assistant';
  const isOnboardingView = currentView === 'onboarding';
  const isMainView = currentView === 'main';

  return (
    <header className={`app-header ${isAssistantView ? 'assistant' : ''} ${isOnboardingView ? 'onboarding' : ''}`}>
      <div className="header-left">
        {showBackButton && (
          <button 
            className="header-button back-button"
            onClick={onBackClick}
            title="Go back"
            aria-label="Go back to main view"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        )}
        
        {isAssistantView && (
          <div className="assistant-header">
            <div className="status-indicator">
              <span className={`status-dot ${statusText.toLowerCase().includes('listening') ? 'listening' : 'idle'}`}></span>
              <span className="status-text">{statusText || 'Ready'}</span>
            </div>
            {startTime && (
              <div className="elapsed-time">
                <span className="time-icon">⏱️</span>
                <span className="time-text">{formatElapsedTime()}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="header-center">
        {!isAssistantView && !isOnboardingView && (
          <h1 className="app-title">
            {isMainView ? 'Cheating Daddy' : currentView.charAt(0).toUpperCase() + currentView.slice(1)}
          </h1>
        )}
      </div>

      <div className="header-right">
        {!isOnboardingView && (
          <>
            {isMainView && (
              <>
                <button
                  className={`header-button ${advancedMode ? 'active' : ''}`}
                  onClick={onAdvancedClick}
                  title="Advanced Settings"
                  aria-label="Advanced settings"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </button>
                <button
                  className="header-button"
                  onClick={onCustomizeClick}
                  title="Customize"
                  aria-label="Customize settings"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                  </svg>
                </button>
              </>
            )}
            
            <button
              className="header-button"
              onClick={onHelpClick}
              title="Help"
              aria-label="Help"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
            
            <button
              className="header-button"
              onClick={onHistoryClick}
              title="History"
              aria-label="View history"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </button>
            
            <button
              className="header-button hide-button"
              onClick={onHideToggleClick}
              title={isClickThrough ? 'Show Window' : 'Hide Window'}
              aria-label={isClickThrough ? 'Show window' : 'Hide window'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isClickThrough ? (
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                ) : (
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                )}
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
            
            <button
              className="header-button close-button"
              onClick={onCloseClick}
              title="Close"
              aria-label="Close application"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

AppHeader.propTypes = {
  currentView: PropTypes.string.isRequired,
  statusText: PropTypes.string,
  startTime: PropTypes.number,
  advancedMode: PropTypes.bool,
  onCustomizeClick: PropTypes.func.isRequired,
  onHelpClick: PropTypes.func.isRequired,
  onHistoryClick: PropTypes.func.isRequired,
  onAdvancedClick: PropTypes.func.isRequired,
  onCloseClick: PropTypes.func.isRequired,
  onBackClick: PropTypes.func.isRequired,
  onHideToggleClick: PropTypes.func.isRequired,
  isClickThrough: PropTypes.bool,
};

export default AppHeader;

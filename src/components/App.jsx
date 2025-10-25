import React, { useState, useEffect, useCallback } from 'react';
import { AppHeader } from './app/AppHeader';
import MainView from './views/MainView';
import CustomizeView from './views/CustomizeView';
import HelpView from './views/HelpView';
import HistoryView from './views/HistoryView';
import AssistantView from './views/AssistantView';
import OnboardingView from './views/OnboardingView';
import AdvancedView from './views/AdvancedView';
import '../styles/global.css';

const App = () => {
  const [currentView, setCurrentView] = useState(
    localStorage.getItem('onboardingCompleted') ? 'main' : 'onboarding'
  );
  const [statusText, setStatusText] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(
    localStorage.getItem('selectedProfile') || 'interview'
  );
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem('selectedLanguage') || 'en-US'
  );
  const [selectedScreenshotInterval, setSelectedScreenshotInterval] = useState(
    localStorage.getItem('selectedScreenshotInterval') || '5'
  );
  const [selectedImageQuality, setSelectedImageQuality] = useState(
    localStorage.getItem('selectedImageQuality') || 'medium'
  );
  const [layoutMode, setLayoutMode] = useState(
    localStorage.getItem('layoutMode') || 'normal'
  );
  const [advancedMode, setAdvancedMode] = useState(
    localStorage.getItem('advancedMode') === 'true'
  );
  const [responses, setResponses] = useState([]);
  const [currentResponseIndex, setCurrentResponseIndex] = useState(-1);
  const [isClickThrough, setIsClickThrough] = useState(false);
  const [awaitingNewResponse, setAwaitingNewResponse] = useState(false);
  const [currentResponseIsComplete, setCurrentResponseIsComplete] = useState(true);
  const [shouldAnimateResponse, setShouldAnimateResponse] = useState(false);

  // Apply layout mode on component mount and when layoutMode changes
  useEffect(() => {
    updateLayoutMode();
  }, [layoutMode]);

  // Set up IPC listeners on component mount
  useEffect(() => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      
      const updateResponseListener = (_, response) => {
        setResponse(response);
      };
      
      const updateStatusListener = (_, status) => {
        setStatus(status);
      };
      
      const clickThroughToggledListener = (_, isEnabled) => {
        setIsClickThrough(isEnabled);
      };

      ipcRenderer.on('update-response', updateResponseListener);
      ipcRenderer.on('update-status', updateStatusListener);
      ipcRenderer.on('click-through-toggled', clickThroughToggledListener);

      // Cleanup function to remove listeners
      return () => {
        ipcRenderer.removeListener('update-response', updateResponseListener);
        ipcRenderer.removeListener('update-status', updateStatusListener);
        ipcRenderer.removeListener('click-through-toggled', clickThroughToggledListener);
      };
    }
  }, []);

  const updateLayoutMode = useCallback(() => {
    if (layoutMode === 'compact') {
      document.documentElement.classList.add('compact-layout');
    } else {
      document.documentElement.classList.remove('compact-layout');
    }
  }, [layoutMode]);

  const setStatus = (text) => {
    setStatusText(text);
    
    // Mark response as complete when we get certain status messages
    if (text.includes('Ready') || text.includes('Listening') || text.includes('Error')) {
      setCurrentResponseIsComplete(true);
      console.log('[setStatus] Marked current response as complete');
    }
  };

  const setResponse = (response) => {
    // Check if this looks like a filler response
    const isFillerResponse =
      response.length < 30 &&
      (response.toLowerCase().includes('hmm') ||
        response.toLowerCase().includes('okay') ||
        response.toLowerCase().includes('next') ||
        response.toLowerCase().includes('go on') ||
        response.toLowerCase().includes('continue'));

    setResponses(prevResponses => {
      let newResponses;
      
      if (awaitingNewResponse || prevResponses.length === 0) {
        // Add as new response when explicitly waiting for one
        newResponses = [...prevResponses, response];
        setCurrentResponseIndex(newResponses.length - 1);
        setAwaitingNewResponse(false);
        setCurrentResponseIsComplete(false);
        console.log('[setResponse] Pushed new response:', response);
      } else if (!currentResponseIsComplete && !isFillerResponse && prevResponses.length > 0) {
        // For substantial responses, update the last one (streaming behavior)
        newResponses = [...prevResponses.slice(0, -1), response];
        console.log('[setResponse] Updated last response:', response);
      } else {
        // For filler responses or when current response is complete, add as new
        newResponses = [...prevResponses, response];
        setCurrentResponseIndex(newResponses.length - 1);
        setCurrentResponseIsComplete(false);
        console.log('[setResponse] Added response as new:', response);
      }
      
      setShouldAnimateResponse(true);
      return newResponses;
    });
  };

  // View navigation handlers
  const navigateToView = (view) => {
    setCurrentView(view);
    
    // Notify main process of view change
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.send('view-changed', view);
    }
  };

  const handleBackClick = () => {
    navigateToView('main');
  };

  // Header event handlers
  const handleCustomizeClick = () => navigateToView('customize');
  const handleHelpClick = () => navigateToView('help');
  const handleHistoryClick = () => navigateToView('history');
  const handleAdvancedClick = () => navigateToView('advanced');

  const handleClose = async () => {
    if (['customize', 'help', 'history', 'advanced'].includes(currentView)) {
      navigateToView('main');
    } else if (currentView === 'assistant') {
      if (window.cheddar) {
        window.cheddar.stopCapture();
      }

      // Close the session
      if (window.require) {
        const { ipcRenderer } = window.require('electron');
        await ipcRenderer.invoke('close-session');
      }
      setSessionActive(false);
      navigateToView('main');
      console.log('Session closed');
    } else {
      // Quit the entire application
      if (window.require) {
        const { ipcRenderer } = window.require('electron');
        await ipcRenderer.invoke('quit-application');
      }
    }
  };

  const handleHideToggle = async () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      await ipcRenderer.invoke('toggle-window-visibility');
    }
  };

  // Main view event handlers
  const handleStart = async () => {
    const apiKey = localStorage.getItem('apiKey')?.trim();
    if (!apiKey || apiKey === '') {
      // TODO: Show error in the UI
      console.error('API key is required');
      return;
    }

    try {
      await window.cheddar.initializeGemini(selectedProfile, selectedLanguage);
      window.cheddar.startCapture(selectedScreenshotInterval, selectedImageQuality);
      setResponses([]);
      setCurrentResponseIndex(-1);
      setStartTime(Date.now());
      navigateToView('assistant');
      setSessionActive(true);
    } catch (error) {
      console.error('Failed to start session:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const handleAPIKeyHelp = async () => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      await ipcRenderer.invoke('open-external', 'https://cheatingdaddy.com/help/api-key');
    }
  };

  // Customize view event handlers
  const handleProfileChange = (profile) => {
    setSelectedProfile(profile);
    localStorage.setItem('selectedProfile', profile);
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    localStorage.setItem('selectedLanguage', language);
  };

  const handleScreenshotIntervalChange = (interval) => {
    setSelectedScreenshotInterval(interval);
    localStorage.setItem('selectedScreenshotInterval', interval);
  };

  const handleImageQualityChange = (quality) => {
    setSelectedImageQuality(quality);
    localStorage.setItem('selectedImageQuality', quality);
  };

  const handleAdvancedModeChange = (isAdvanced) => {
    setAdvancedMode(isAdvanced);
    localStorage.setItem('advancedMode', isAdvanced.toString());
  };

  const handleLayoutModeChange = async (newLayoutMode) => {
    setLayoutMode(newLayoutMode);
    localStorage.setItem('layoutMode', newLayoutMode);
    updateLayoutMode();

    // Notify main process about layout change for window resizing
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        await ipcRenderer.invoke('update-sizes');
      } catch (error) {
        console.error('Failed to update sizes in main process:', error);
      }
    }
  };

  // Help view event handlers
  const handleExternalLinkClick = async (url) => {
    if (window.require) {
      const { ipcRenderer } = window.require('electron');
      await ipcRenderer.invoke('open-external', url);
    }
  };

  // Assistant view event handlers
  const handleSendText = async (message) => {
    try {
      const result = await window.cheddar.sendTextMessage(message);

      if (!result.success) {
        console.error('Failed to send message:', result.error);
        setStatus('Error sending message: ' + result.error);
      } else {
        setStatus('Message sent...');
        setAwaitingNewResponse(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus('Error: ' + error.message);
    }
  };

  const handleResponseIndexChanged = (index) => {
    setCurrentResponseIndex(index);
    setShouldAnimateResponse(false);
  };

  const handleResponseAnimationComplete = () => {
    setShouldAnimateResponse(false);
    setCurrentResponseIsComplete(true);
    console.log('[response-animation-complete] Marked current response as complete');
  };

  // Onboarding event handlers
  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    navigateToView('main');
  };

  // Render the current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'onboarding':
        return (
          <OnboardingView
            onComplete={handleOnboardingComplete}
            onClose={handleClose}
          />
        );

      case 'main':
        return (
          <MainView
            onStart={handleStart}
            onAPIKeyHelp={handleAPIKeyHelp}
            layoutMode={layoutMode}
            onLayoutModeChange={handleLayoutModeChange}
          />
        );

      case 'customize':
        return (
          <CustomizeView
            selectedProfile={selectedProfile}
            selectedLanguage={selectedLanguage}
            selectedScreenshotInterval={selectedScreenshotInterval}
            selectedImageQuality={selectedImageQuality}
            layoutMode={layoutMode}
            advancedMode={advancedMode}
            onProfileChange={handleProfileChange}
            onLanguageChange={handleLanguageChange}
            onScreenshotIntervalChange={handleScreenshotIntervalChange}
            onImageQualityChange={handleImageQualityChange}
            onLayoutModeChange={handleLayoutModeChange}
            onAdvancedModeChange={handleAdvancedModeChange}
            onBack={handleBackClick}
          />
        );

      case 'help':
        return (
          <HelpView
            onExternalLinkClick={handleExternalLinkClick}
            onBack={handleBackClick}
          />
        );

      case 'history':
        return <HistoryView onBack={handleBackClick} />;

      case 'advanced':
        return <AdvancedView onBack={handleBackClick} />;

      case 'assistant':
        return (
          <AssistantView
            responses={responses}
            currentResponseIndex={currentResponseIndex}
            selectedProfile={selectedProfile}
            onSendText={handleSendText}
            shouldAnimateResponse={shouldAnimateResponse}
            onResponseIndexChanged={handleResponseIndexChanged}
            onResponseAnimationComplete={handleResponseAnimationComplete}
          />
        );

      default:
        return <div>Unknown view: {currentView}</div>;
    }
  };

  const mainContentClass = `main-content ${
    currentView === 'assistant' ? 'assistant-view' : 
    currentView === 'onboarding' ? 'onboarding-view' : 'with-border'
  }`;

  return (
    <div className="window-container">
      <div className="container">
        <AppHeader
          currentView={currentView}
          statusText={statusText}
          startTime={startTime}
          advancedMode={advancedMode}
          onCustomizeClick={handleCustomizeClick}
          onHelpClick={handleHelpClick}
          onHistoryClick={handleHistoryClick}
          onAdvancedClick={handleAdvancedClick}
          onCloseClick={handleClose}
          onBackClick={handleBackClick}
          onHideToggleClick={handleHideToggle}
          isClickThrough={isClickThrough}
        />
        <div className={mainContentClass}>
          <div className="view-container">
            {renderCurrentView()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

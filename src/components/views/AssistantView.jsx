import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import '../../styles/views/AssistantView.css';

const PROFILE_NAMES = {
  interview: 'Job Interview',
  sales: 'Sales Call',
  meeting: 'Business Meeting',
  presentation: 'Presentation',
  negotiation: 'Negotiation',
  exam: 'Exam Assistant',
};

const AssistantView = ({
  responses = [],
  currentResponseIndex = -1,
  selectedProfile = 'interview',
  onSendText = () => {},
  shouldAnimateResponse = false,
  onResponseIndexChanged = () => {},
  onResponseAnimationComplete = () => {}
}) => {
  const [input, setInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [savedResponses, setSavedResponses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('savedResponses') || '[]');
    } catch (error) {
      console.error('Failed to load saved responses:', error);
      return [];
    }
  });
  
  const responseContainerRef = useRef(null);
  const inputRef = useRef(null);
  const animationRef = useRef(null);
  const responseTextRef = useRef('');
  const charIndexRef = useRef(0);

  // Get the display name for the current profile
  const getProfileName = useCallback((profile) => {
    return PROFILE_NAMES[profile] || 'AI Assistant';
  }, []);

  // Get the current response text with typewriter effect if needed
  const getCurrentResponse = useCallback(() => {
    const response = responses.length > 0 && currentResponseIndex >= 0
      ? responses[currentResponseIndex]
      : `I'm your ${getProfileName(selectedProfile)} assistant. How can I help you today?`;
    
    return response;
  }, [responses, currentResponseIndex, selectedProfile, getProfileName]);

  // Handle sending a message
  const handleSend = useCallback(async () => {
    const message = input.trim();
    if (message) {
      setIsTyping(true);
      setInput('');
      
      try {
        await onSendText(message);
      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        setIsTyping(false);
      }
    }
  }, [input, onSendText]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Navigation between responses
  const navigateResponse = useCallback((direction) => {
    if (direction === 'prev' && currentResponseIndex > 0) {
      onResponseIndexChanged(currentResponseIndex - 1);
    } else if (direction === 'next' && currentResponseIndex < responses.length - 1) {
      onResponseIndexChanged(currentResponseIndex + 1);
    }
  }, [currentResponseIndex, responses.length, onResponseIndexChanged]);

  // Save the current response
  const saveCurrentResponse = useCallback(() => {
    const currentResponse = getCurrentResponse();
    if (!currentResponse) return;

    const isAlreadySaved = savedResponses.some(
      saved => saved.response === currentResponse && saved.profile === selectedProfile
    );

    if (!isAlreadySaved) {
      const newSavedResponse = {
        response: currentResponse,
        timestamp: new Date().toISOString(),
        profile: selectedProfile,
        profileName: getProfileName(selectedProfile)
      };

      const updatedResponses = [...savedResponses, newSavedResponse];
      
      try {
        localStorage.setItem('savedResponses', JSON.stringify(updatedResponses));
        setSavedResponses(updatedResponses);
      } catch (error) {
        console.error('Failed to save response:', error);
      }
    }
  }, [getCurrentResponse, savedResponses, selectedProfile, getProfileName]);

  // Typewriter effect for responses
  useEffect(() => {
    if (!shouldAnimateResponse) {
      responseTextRef.current = getCurrentResponse();
      return;
    }

    const response = getCurrentResponse();
    const responseLength = response.length;
    let currentText = '';
    
    const typeNextChar = () => {
      if (charIndexRef.current < responseLength) {
        currentText += response[charIndexRef.current];
        responseTextRef.current = currentText;
        charIndexRef.current++;
        
        if (responseContainerRef.current) {
          responseContainerRef.current.scrollTop = responseContainerRef.current.scrollHeight;
        }
        
        const speed = responseLength > 100 ? 10 : 20; // Faster for longer responses
        animationRef.current = setTimeout(typeNextChar, speed);
      } else {
        onResponseAnimationComplete();
      }
    };

    // Reset animation state
    charIndexRef.current = 0;
    responseTextRef.current = '';
    
    // Start typing effect
    const delay = responseLength > 50 ? 300 : 100; // Longer delay for longer responses
    const timeoutId = setTimeout(typeNextChar, delay);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(animationRef.current);
    };
  }, [getCurrentResponse, shouldAnimateResponse, onResponseAnimationComplete]);

  // Auto-focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Scroll to bottom when responses change
  useEffect(() => {
    if (responseContainerRef.current) {
      responseContainerRef.current.scrollTop = responseContainerRef.current.scrollHeight;
    }
  }, [responses, currentResponseIndex]);

  // Check if current response is saved
  const isCurrentResponseSaved = useCallback(() => {
    const currentResponse = getCurrentResponse();
    return savedResponses.some(
      saved => saved.response === currentResponse && saved.profile === selectedProfile
    );
  }, [getCurrentResponse, savedResponses, selectedProfile]);

  const responseCounter = responses.length > 0 
    ? `${currentResponseIndex + 1}/${responses.length}` 
    : '';

  const currentResponse = shouldAnimateResponse 
    ? responseTextRef.current 
    : getCurrentResponse();

  const isSaveDisabled = !currentResponse || 
    currentResponse === `I'm your ${getProfileName(selectedProfile)} assistant. How can I help you today?`;

  return (
    <div className="assistant-view">
      <div 
        ref={responseContainerRef} 
        className={`response-container ${isTyping ? 'typing' : ''}`}
      >
        {currentResponse || '\u00A0'}
        {isTyping && <span className="typing-indicator">...</span>}
      </div>
      
      <div className="assistant-controls">
        <div className="navigation-controls">
          <button 
            className={`nav-button prev ${currentResponseIndex <= 0 ? 'disabled' : ''}`}
            onClick={() => navigateResponse('prev')}
            disabled={currentResponseIndex <= 0}
            aria-label="Previous response"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          
          {responses.length > 0 && (
            <div className="response-counter">
              {responseCounter}
            </div>
          )}
          
          <button 
            className={`nav-button next ${currentResponseIndex >= responses.length - 1 ? 'disabled' : ''}`}
            onClick={() => navigateResponse('next')}
            disabled={currentResponseIndex >= responses.length - 1}
            aria-label="Next response"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
        
        <div className="input-container">
          <div className={`input-wrapper ${isInputFocused ? 'focused' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              placeholder="Type a message..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              disabled={isTyping}
              aria-label="Type your message"
            />
            
            <button
              className={`send-button ${!input.trim() ? 'disabled' : ''}`}
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          
          <button
            className={`save-response-button ${isCurrentResponseSaved() ? 'saved' : ''} ${isSaveDisabled ? 'disabled' : ''}`}
            onClick={saveCurrentResponse}
            disabled={isSaveDisabled}
            title={
              isSaveDisabled 
                ? 'Nothing to save' 
                : isCurrentResponseSaved() 
                  ? 'Response saved' 
                  : 'Save this response'
            }
            aria-label={
              isCurrentResponseSaved() 
                ? 'Response saved' 
                : 'Save this response'
            }
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isCurrentResponseSaved() ? (
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              ) : (
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

AssistantView.propTypes = {
  responses: PropTypes.arrayOf(PropTypes.string),
  currentResponseIndex: PropTypes.number,
  selectedProfile: PropTypes.string,
  onSendText: PropTypes.func,
  shouldAnimateResponse: PropTypes.bool,
  onResponseIndexChanged: PropTypes.func,
  onResponseAnimationComplete: PropTypes.func,
};

export default AssistantView;

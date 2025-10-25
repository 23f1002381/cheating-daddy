import React, { useState, useEffect } from 'react';

const getProfileNames = () => ({
  interview: 'Job Interview',
  sales: 'Sales Call',
  meeting: 'Business Meeting',
  presentation: 'Presentation',
  negotiation: 'Negotiation',
  exam: 'Exam Assistant',
});

const HistoryView = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sessions');
  const [savedResponses, setSavedResponses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('savedResponses') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    setLoading(true);
    (async () => {
      if (window.cheddar && window.cheddar.getAllConversationSessions) {
        try {
          const data = await window.cheddar.getAllConversationSessions();
          setSessions(data || []);
        } catch {
          setSessions([]);
        }
      } else {
        setSessions([]);
      }
      setLoading(false);
    })();
  }, []);

  const formatDate = ts => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = ts => new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formatTimestamp = ts => new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const getSessionPreview = session => {
    if (!session.conversationHistory || session.conversationHistory.length === 0) return 'No conversation yet';
    const firstTurn = session.conversationHistory[0];
    const preview = firstTurn.transcription || firstTurn.ai_response || 'Empty conversation';
    return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
  };
  const deleteSavedResponse = idx => {
    const next = savedResponses.filter((_, i) => i !== idx);
    setSavedResponses(next);
    localStorage.setItem('savedResponses', JSON.stringify(next));
  };

  const renderSessionsList = () => {
    if (loading) return <div className="loading">Loading conversation history...</div>;
    if (sessions.length === 0) return (
      <div className="empty-state">
        <div className="empty-state-title">No conversations yet</div>
        <div>Start a session to see your conversation history here</div>
      </div>
    );
    return (
      <div className="sessions-list">
        {sessions.map(session => (
          <div className="session-item" key={session.timestamp} onClick={() => setSelectedSession(session)}>
            <div className="session-header">
              <div className="session-date">{formatDate(session.timestamp)}</div>
              <div className="session-time">{formatTime(session.timestamp)}</div>
            </div>
            <div className="session-preview">{getSessionPreview(session)}</div>
          </div>
        ))}
      </div>
    );
  };
  const renderSavedResponses = () => {
    if (savedResponses.length === 0) return (
      <div className="empty-state">
        <div className="empty-state-title">No saved responses</div>
        <div>Use the save button during conversations to save important responses</div>
      </div>
    );
    const profileNames = getProfileNames();
    return (
      <div className="sessions-list">
        {savedResponses.map((saved, idx) => (
          <div className="saved-response-item" key={saved.timestamp + idx}>
            <div className="saved-response-header">
              <div>
                <div className="saved-response-profile">{profileNames[saved.profile] || saved.profile}</div>
                <div className="saved-response-date">{formatTimestamp(saved.timestamp)}</div>
              </div>
              <button className="delete-button" title="Delete saved response" onClick={() => deleteSavedResponse(idx)}>
                <svg width="16px" height="16px" strokeWidth="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
            </div>
            <div className="saved-response-content">{saved.response}</div>
          </div>
        ))}
      </div>
    );
  };
  const renderConversationView = () => {
    if (!selectedSession) return null;
    const { conversationHistory } = selectedSession;
    const messages = [];
    if (conversationHistory) {
      conversationHistory.forEach(turn => {
        if (turn.transcription) messages.push({ type: 'user', content: turn.transcription, timestamp: turn.timestamp });
        if (turn.ai_response) messages.push({ type: 'ai', content: turn.ai_response, timestamp: turn.timestamp });
      });
    }
    return (
      <div className="history-container">
        <div className="back-header">
          <button className="back-button" onClick={() => setSelectedSession(null)}>
            <svg width="16px" height="16px" strokeWidth="1.7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor">
              <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            Back to Sessions
          </button>
          <div className="legend">
            <div className="legend-item"><div className="legend-dot user"></div><span>Them</span></div>
            <div className="legend-item"><div className="legend-dot ai"></div><span>Suggestion</span></div>
          </div>
        </div>
        <div className="conversation-view">
          {messages.length > 0 ? messages.map((msg, i) => <div className={`message ${msg.type}`} key={msg.timestamp + i}>{msg.content}</div>) : <div className="empty-state">No conversation data available</div>}
        </div>
      </div>
    );
  };

  if (selectedSession) return renderConversationView();
  return (
    <div className="history-container">
      <div className="tabs-container">
        <button className={`tab ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>Conversation History</button>
        <button className={`tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>Saved Responses ({savedResponses.length})</button>
      </div>
      {activeTab === 'sessions' ? renderSessionsList() : renderSavedResponses()}
    </div>
  );
};

export default HistoryView;

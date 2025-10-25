import React, { useState } from 'react';

const AdvancedView = () => {
  const [contentProtection, setContentProtection] = useState(localStorage.getItem('contentProtection') !== 'false');
  const [throttleTokens, setThrottleTokens] = useState(localStorage.getItem('throttleTokens') !== 'false');
  const [maxTokensPerMin, setMaxTokensPerMin] = useState(parseInt(localStorage.getItem('maxTokensPerMin'), 10) || 1000000);
  const [throttleAtPercent, setThrottleAtPercent] = useState(parseInt(localStorage.getItem('throttleAtPercent'), 10) || 75);
  const [isClearing, setIsClearing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');

  const handleContentProtection = async e => {
    setContentProtection(e.target.checked);
    localStorage.setItem('contentProtection', e.target.checked.toString());
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        await ipcRenderer.invoke('update-content-protection', e.target.checked);
      } catch {}
    }
  };
  const handleThrottleTokens = e => {
    setThrottleTokens(e.target.checked);
    localStorage.setItem('throttleTokens', e.target.checked.toString());
  };
  const handleMaxTokens = e => {
    const v = parseInt(e.target.value, 10);
    setMaxTokensPerMin(v);
    localStorage.setItem('maxTokensPerMin', v.toString());
  };
  const handleThrottlePercent = e => {
    const v = parseInt(e.target.value, 10);
    setThrottleAtPercent(v);
    localStorage.setItem('throttleAtPercent', v.toString());
  };
  const resetRateLimit = () => {
    setThrottleTokens(true);
    setMaxTokensPerMin(1000000);
    setThrottleAtPercent(75);
    localStorage.removeItem('throttleTokens');
    localStorage.removeItem('maxTokensPerMin');
    localStorage.removeItem('throttleAtPercent');
  };
  const clearLocalData = async () => {
    if (isClearing) return;
    setIsClearing(true);
    setStatusMessage('');
    setStatusType('');
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      setStatusMessage('✅ Successfully cleared all local data');
      setStatusType('success');
      setTimeout(() => {
        setStatusMessage('🔄 Closing application...');
        setTimeout(async () => {
          if (window.require) {
            const { ipcRenderer } = window.require('electron');
            await ipcRenderer.invoke('quit-application');
          }
        }, 1000);
      }, 2000);
    } catch (error) {
      setStatusMessage(`❌ Error clearing data: ${error.message}`);
      setStatusType('error');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="advanced-container">
      <div className="advanced-section">
        <div className="section-title"><span>🔒 Content Protection</span></div>
        <div className="advanced-description">
          Content protection makes the application window invisible to screen sharing and recording software. This is useful for privacy when sharing your screen, but may interfere with certain display setups like DisplayLink.
        </div>
        <div className="form-grid">
          <div className="checkbox-group">
            <input type="checkbox" className="checkbox-input" id="content-protection" checked={contentProtection} onChange={handleContentProtection} />
            <label htmlFor="content-protection" className="checkbox-label">Enable content protection (stealth mode)</label>
          </div>
          <div className="form-description" style={{marginLeft:22}}>
            {contentProtection ? 'The application is currently invisible to screen sharing and recording software.' : 'The application is currently visible to screen sharing and recording software.'}
          </div>
        </div>
      </div>
      <div className="advanced-section">
        <div className="section-title"><span>⏱️ Rate Limiting</span></div>
        <div className="rate-limit-warning"><span className="rate-limit-warning-icon">⚠️</span><span><strong>Warning:</strong> Don\'t mess with these settings if you don\'t know what this is about. Incorrect rate limiting settings may cause the application to stop working properly or hit API limits unexpectedly.</span></div>
        <div className="form-grid">
          <div className="checkbox-group">
            <input type="checkbox" className="checkbox-input" id="throttle-tokens" checked={throttleTokens} onChange={handleThrottleTokens} />
            <label htmlFor="throttle-tokens" className="checkbox-label">Throttle tokens when close to rate limit</label>
          </div>
          <div className={`rate-limit-controls ${throttleTokens ? 'enabled' : ''}`}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Max Allowed Tokens Per Minute</label>
                <input type="number" className="form-control" value={maxTokensPerMin} min={1000} max={10000000} step={1000} onChange={handleMaxTokens} disabled={!throttleTokens} />
                <div className="form-description">Maximum number of tokens allowed per minute before throttling kicks in</div>
              </div>
              <div className="form-group">
                <label className="form-label">Throttle At Percent</label>
                <input type="number" className="form-control" value={throttleAtPercent} min={1} max={99} step={1} onChange={handleThrottlePercent} disabled={!throttleTokens} />
                <div className="form-description">Start throttling when this percentage of the limit is reached ({throttleAtPercent}% = {Math.floor((maxTokensPerMin * throttleAtPercent) / 100)} tokens)</div>
              </div>
            </div>
            <div className="rate-limit-reset">
              <button className="action-button" onClick={resetRateLimit} disabled={!throttleTokens}>Reset to Defaults</button>
              <div className="form-description" style={{marginTop:8}}>Reset rate limiting settings to default values</div>
            </div>
          </div>
        </div>
      </div>
      <div className="advanced-section danger-section">
        <div className="section-title danger"><span>🗑️ Data Management</span></div>
        <div className="danger-box"><span className="danger-icon">⚠️</span><span><strong>Important:</strong> This action will permanently delete all local data and cannot be undone.</span></div>
        <div>
          <button className="action-button danger-button" onClick={clearLocalData} disabled={isClearing}>{isClearing ? '🔄 Clearing...' : '🗑️ Clear All Local Data'}</button>
          {statusMessage && (
            <div className={`status-message ${statusType === 'success' ? 'status-success' : 'status-error'}`}>{statusMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedView;

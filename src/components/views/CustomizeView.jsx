import React, { useState, useMemo } from 'react';

const getProfiles = () => [
  { value: 'interview', name: 'Job Interview', description: 'Get help with answering interview questions' },
  { value: 'sales', name: 'Sales Call', description: 'Assist with sales conversations and objection handling' },
  { value: 'meeting', name: 'Business Meeting', description: 'Support for professional meetings and discussions' },
  { value: 'presentation', name: 'Presentation', description: 'Help with presentations and public speaking' },
  { value: 'negotiation', name: 'Negotiation', description: 'Guidance for business negotiations and deals' },
  { value: 'exam', name: 'Exam Assistant', description: 'Academic assistance for test-taking and exam questions' },
];

const getLanguages = () => [
  { value: 'en-US', name: 'English (US)' },
  { value: 'en-GB', name: 'English (UK)' },
  { value: 'en-AU', name: 'English (Australia)' },
  { value: 'en-IN', name: 'English (India)' },
  { value: 'de-DE', name: 'German (Germany)' },
  { value: 'es-US', name: 'Spanish (United States)' },
  { value: 'es-ES', name: 'Spanish (Spain)' },
  { value: 'fr-FR', name: 'French (France)' },
  { value: 'fr-CA', name: 'French (Canada)' },
  { value: 'hi-IN', name: 'Hindi (India)' },
  { value: 'pt-BR', name: 'Portuguese (Brazil)' },
  { value: 'ar-XA', name: 'Arabic (Generic)' },
  { value: 'id-ID', name: 'Indonesian (Indonesia)' },
  { value: 'it-IT', name: 'Italian (Italy)' },
  { value: 'ja-JP', name: 'Japanese (Japan)' },
  { value: 'tr-TR', name: 'Turkish (Turkey)' },
  { value: 'vi-VN', name: 'Vietnamese (Vietnam)' },
  { value: 'bn-IN', name: 'Bengali (India)' },
  { value: 'gu-IN', name: 'Gujarati (India)' },
  { value: 'kn-IN', name: 'Kannada (India)' },
  { value: 'ml-IN', name: 'Malayalam (India)' },
  { value: 'mr-IN', name: 'Marathi (India)' },
  { value: 'ta-IN', name: 'Tamil (India)' },
  { value: 'te-IN', name: 'Telugu (India)' },
  { value: 'nl-NL', name: 'Dutch (Netherlands)' },
  { value: 'ko-KR', name: 'Korean (South Korea)' },
  { value: 'cmn-CN', name: 'Mandarin Chinese (China)' },
  { value: 'pl-PL', name: 'Polish (Poland)' },
  { value: 'ru-RU', name: 'Russian (Russia)' },
  { value: 'th-TH', name: 'Thai (Thailand)' },
];

const CustomizeView = ({
  onProfileChange = () => {},
  onLanguageChange = () => {},
  onScreenshotIntervalChange = () => {},
  onImageQualityChange = () => {},
  onLayoutModeChange = () => {},
  onAdvancedModeChange = () => {},
}) => {
  const [selectedProfile, setSelectedProfile] = useState(localStorage.getItem('selectedProfile') || 'interview');
  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('selectedLanguage') || 'en-US');
  const [selectedScreenshotInterval, setSelectedScreenshotInterval] = useState(localStorage.getItem('selectedScreenshotInterval') || '5');
  const [selectedImageQuality, setSelectedImageQuality] = useState('medium');
  const [layoutMode, setLayoutMode] = useState(localStorage.getItem('layoutMode') || 'normal');
  const [advancedMode, setAdvancedMode] = useState(localStorage.getItem('advancedMode') === 'true');
  const [backgroundTransparency, setBackgroundTransparency] = useState(parseFloat(localStorage.getItem('backgroundTransparency')) || 0.8);
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('fontSize'), 10) || 20);
  const profiles = useMemo(getProfiles, []);
  const languages = useMemo(getLanguages, []);

  const handleProfile = e => {
    setSelectedProfile(e.target.value);
    localStorage.setItem('selectedProfile', e.target.value);
    onProfileChange(e.target.value);
  };
  const handleLanguage = e => {
    setSelectedLanguage(e.target.value);
    localStorage.setItem('selectedLanguage', e.target.value);
    onLanguageChange(e.target.value);
  };
  const handleScreenshotInterval = e => {
    setSelectedScreenshotInterval(e.target.value);
    localStorage.setItem('selectedScreenshotInterval', e.target.value);
    onScreenshotIntervalChange(e.target.value);
  };
  const handleImageQuality = e => {
    setSelectedImageQuality(e.target.value);
    onImageQualityChange(e.target.value);
  };
  const handleLayoutMode = e => {
    setLayoutMode(e.target.value);
    localStorage.setItem('layoutMode', e.target.value);
    onLayoutModeChange(e.target.value);
  };
  const handleAdvancedMode = e => {
    setAdvancedMode(e.target.checked);
    localStorage.setItem('advancedMode', e.target.checked.toString());
    onAdvancedModeChange(e.target.checked);
  };
  const handleBackgroundTransparency = e => {
    const val = parseFloat(e.target.value);
    setBackgroundTransparency(val);
    localStorage.setItem('backgroundTransparency', val.toString());
    document.documentElement.style.setProperty('--main-content-background', `rgba(0,0,0,${val})`);
  };
  const handleFontSize = e => {
    const val = parseInt(e.target.value, 10);
    setFontSize(val);
    localStorage.setItem('fontSize', val.toString());
    document.documentElement.style.setProperty('--response-font-size', `${val}px`);
  };

  return (
    <div className="settings-container">
      <div className="settings-section">
        <div className="section-title"><span>AI Profile & Behavior</span></div>
        <div className="form-grid">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Profile Type</label>
              <select className="form-control" value={selectedProfile} onChange={handleProfile}>
                {profiles.map(profile => (
                  <option key={profile.value} value={profile.value}>{profile.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group full-width">
            <label className="form-label">Custom AI Instructions</label>
            <textarea
              className="form-control"
              placeholder={`Add specific instructions for how you want the AI to behave during ${profiles.find(p => p.value === selectedProfile)?.name || 'this interaction'}...`}
              defaultValue={localStorage.getItem('customPrompt') || ''}
              rows={4}
              onInput={e => localStorage.setItem('customPrompt', e.target.value)}
            />
            <div className="form-description">
              Personalize the AI's behavior with specific instructions that will be added to the {profiles.find(p => p.value === selectedProfile)?.name || 'selected profile'} base prompts
            </div>
          </div>
        </div>
      </div>
      <div className="settings-section">
        <div className="section-title"><span>Language & Audio</span></div>
        <div className="form-grid">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Speech Language</label>
              <select className="form-control" value={selectedLanguage} onChange={handleLanguage}>
                {languages.map(language => (
                  <option key={language.value} value={language.value}>{language.name}</option>
                ))}
              </select>
              <div className="form-description">Language for speech recognition and AI responses</div>
            </div>
          </div>
        </div>
      </div>
      <div className="settings-section">
        <div className="section-title"><span>Interface Layout</span></div>
        <div className="form-grid">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Layout Mode</label>
              <select className="form-control" value={layoutMode} onChange={handleLayoutMode}>
                <option value="normal">Normal</option>
                <option value="compact">Compact</option>
              </select>
              <div className="form-description">
                {layoutMode === 'compact' ? 'Smaller window size with reduced padding and font sizes for minimal screen footprint' : 'Standard layout with comfortable spacing and font sizes'}
              </div>
            </div>
          </div>
          <div className="form-group full-width">
            <div className="slider-container">
              <div className="slider-header">
                <label className="form-label">Background Transparency</label>
                <span className="slider-value">{Math.round(backgroundTransparency * 100)}%</span>
              </div>
              <input
                type="range"
                className="slider-input"
                min="0"
                max="1"
                step="0.01"
                value={backgroundTransparency}
                onChange={handleBackgroundTransparency}
              />
              <div className="slider-labels"><span>Transparent</span><span>Opaque</span></div>
              <div className="form-description">Adjust the transparency of the interface background elements</div>
            </div>
          </div>
          <div className="form-group full-width">
            <div className="slider-container">
              <div className="slider-header">
                <label className="form-label">Response Font Size</label>
                <span className="slider-value">{fontSize}px</span>
              </div>
              <input
                type="range"
                className="slider-input"
                min="12"
                max="32"
                step="1"
                value={fontSize}
                onChange={handleFontSize}
              />
              <div className="slider-labels"><span>12px</span><span>32px</span></div>
              <div className="form-description">Adjust the font size of AI response text in the assistant view</div>
            </div>
          </div>
        </div>
      </div>
      <div className="settings-section">
        <div className="section-title"><span>Screen Capture Settings</span></div>
        <div className="form-grid">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Capture Interval</label>
              <select className="form-control" value={selectedScreenshotInterval} onChange={handleScreenshotInterval}>
                <option value="manual">Manual (On demand)</option>
                <option value="1">Every 1 second</option>
                <option value="2">Every 2 seconds</option>
                <option value="5">Every 5 seconds</option>
                <option value="10">Every 10 seconds</option>
              </select>
              <div className="form-description">
                {selectedScreenshotInterval === 'manual' ? 'Screenshots will only be taken when you use the "Ask Next Step" shortcut' : 'Automatic screenshots will be taken at the specified interval'}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Image Quality</label>
              <select className="form-control" value={selectedImageQuality} onChange={handleImageQuality}>
                <option value="high">High Quality</option>
                <option value="medium">Medium Quality</option>
                <option value="low">Low Quality</option>
              </select>
              <div className="form-description">
                {selectedImageQuality === 'high' ? 'Best quality, uses more tokens' : selectedImageQuality === 'medium' ? 'Balanced quality and token usage' : 'Lower quality, uses fewer tokens'}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="settings-note">💡 Settings are automatically saved as you change them. Changes will take effect immediately or on the next session start.</div>
      <div className="settings-section" style={{borderColor:'var(--danger-border, rgba(239, 68, 68, 0.3))', background:'var(--danger-background, rgba(239, 68, 68, 0.05))'}}>
        <div className="section-title" style={{color:'var(--danger-color, #ef4444)'}}><span>⚠️ Advanced Mode</span></div>
        <div className="form-grid">
          <div className="checkbox-group">
            <input
              type="checkbox"
              className="checkbox-input"
              id="advanced-mode"
              checked={advancedMode}
              onChange={handleAdvancedMode}
            />
            <label htmlFor="advanced-mode" className="checkbox-label"> Enable Advanced Mode </label>
          </div>
          <div className="form-description" style={{marginLeft:24, marginTop:-8}}>
            Unlock experimental features, developer tools, and advanced configuration options
            <br /><strong>Note:</strong> Advanced mode adds a new icon to the main navigation bar
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeView;

import React, { useState } from 'react';

const slides = [
  {
    icon: 'assets/onboarding/welcome.svg',
    title: 'Welcome to Cheating Daddy',
    content: 'Your AI assistant that listens and watches, then provides intelligent suggestions automatically during interviews and meetings.',
  },
  {
    icon: 'assets/onboarding/security.svg',
    title: 'Completely Private',
    content: 'Invisible to screen sharing apps and recording software. Your secret advantage stays completely hidden from others.',
  },
  {
    icon: 'assets/onboarding/context.svg',
    title: 'Add Your Context',
    content: 'Share relevant information to help the AI provide better, more personalized assistance.',
    showTextarea: true,
  },
  {
    icon: 'assets/onboarding/customize.svg',
    title: 'Additional Features',
    content: '',
    showFeatures: true,
  },
  {
    icon: 'assets/onboarding/ready.svg',
    title: 'Ready to Go',
    content: 'Add your Gemini API key in settings and start getting AI-powered assistance in real-time.',
  },
];

const OnboardingView = ({ onComplete = () => {}, onClose = () => {} }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [contextText, setContextText] = useState('');

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
    else completeOnboarding();
  };
  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };
  const goToSlide = idx => {
    if (idx !== currentSlide) setCurrentSlide(idx);
  };
  const completeOnboarding = () => {
    if (contextText.trim()) localStorage.setItem('customPrompt', contextText.trim());
    localStorage.setItem('onboardingCompleted', 'true');
    onComplete();
  };

  const slide = slides[currentSlide];

  return (
    <div className="onboarding-container">
      {/* Gradient background and canvas animation omitted for brevity */}
      <div className="content-wrapper">
        <img className="slide-icon" src={slide.icon} alt={slide.title + ' icon'} />
        <div className="slide-title">{slide.title}</div>
        <div className="slide-content">{slide.content}</div>
        {slide.showTextarea && (
          <textarea
            className="context-textarea"
            placeholder="Paste your resume, job description, or any relevant context here..."
            value={contextText}
            onChange={e => setContextText(e.target.value)}
          />
        )}
        {slide.showFeatures && (
          <div className="feature-list">
            <div className="feature-item"><span className="feature-icon">🎨</span>Customize AI behavior and responses</div>
            <div className="feature-item"><span className="feature-icon">📚</span>Review conversation history</div>
            <div className="feature-item"><span className="feature-icon">🔧</span>Adjust capture settings and intervals</div>
          </div>
        )}
      </div>
      <div className="navigation">
        <button className="nav-button" onClick={prevSlide} disabled={currentSlide === 0}>
          <svg width="16px" height="16px" strokeWidth="2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 6L9 12L15 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </button>
        <div className="progress-dots">
          {[0, 1, 2, 3, 4].map(idx => (
            <div key={idx} className={`dot${idx === currentSlide ? ' active' : ''}`} onClick={() => goToSlide(idx)} />
          ))}
        </div>
        <button className="nav-button" onClick={nextSlide}>
          {currentSlide === 4 ? 'Get Started' : (
            <svg width="16px" height="16px" strokeWidth="2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default OnboardingView;

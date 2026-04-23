import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const helpRef = useRef(null);
  const [isDark, setIsDark] = useState(true);

  const helpImages = [
    '/src/assets/help_images/Gemini_Generated_Image_kf9ivgkf9ivgkf9i.png',
    '/src/assets/help_images/Gemini_Generated_Image_m0r3jtm0r3jtm0r3.png',
    '/src/assets/help_images/Gemini_Generated_Image_p3ic53p3ic53p3ic.png',
    '/src/assets/help_images/Gemini_Generated_Image_se2egsse2egsse2e.png'
  ];

  const helpItems = helpImages.map((image, index) => ({
    id: index + 1,
    title: `Img ${index + 1}`,
    description: `//Desc of img${index + 1}`,
    image
  }));

  // Removed global theme effect to prevent Hero section from changing when Help section is toggled

  const scrollToHelp = useCallback(() => {
    helpRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="homepage-scope dark-theme">
      <div className="main-wrapper">
        <div className="app-container dark-theme">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="background-video"
          >
            <source src="/background.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="overlay">
            <div className="hero-content">
              <div className="hero-badge animate-fade-up">
                <span className="badge-new">New</span>
                <span className="badge-text">Click "Try Now" to translate</span>
              </div>

              <h1 className="hero-title animate-fade-up delay-1">
                <span className="line-break">Giving Every Hand</span>
                <span className="line-break">a Voice.</span>
              </h1>

              <p className="hero-subtitle animate-fade-up delay-2">
                Breaking communication barriers for 63 lakh+ individuals with real-time Indian Sign Language translation. No apps, no hardware—just your browser.
              </p>

              <div className="hero-buttons animate-fade-up delay-3">
                <Link to="/app" className="btn-glass">Try Now <span className="arrow">↗</span></Link>
                <button className="btn-text" onClick={scrollToHelp}>Help <span className="play-icon">▷</span></button>
              </div>
            </div>
          </div>
        </div>

        <div className={`help-section ${isDark ? 'dark-theme' : 'light-theme'}`} ref={helpRef}>
          <div className="help-wireframe">
            {/* Theme Toggle for Help Section */}
            <div className='flex justify-end mb-8'>
              <button
                onClick={() => setIsDark(!isDark)}
                className="h-12 w-12 flex items-center justify-center rounded-full backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
                style={{
                  background: isDark ? "rgba(255,255,255,0.08)" : "rgba(14, 19, 52, 0.05)",
                  color: isDark ? "#fff" : "#0E1334",
                  border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(14, 19, 52, 0.2)"
                }}
              >
                {isDark ? <i className="ri-sun-line text-xl"></i> : <i className="ri-moon-line text-xl"></i>}
              </button>
            </div>

            <div className="help-header">
              <p className="help-eyebrow">How it works</p>
              <h2 className="help-main-title">Sign, and be <em>understood.</em></h2>
            </div>

            {[
              {
                num: "01",
                title: "Open the app in your browser",
                desc: `Click "Try Now" on the home screen. The translator runs entirely in your browser — no installation needed, no account required.`,
                tag: "Chrome · Firefox · Edge",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="help-svg">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                )
              },
              {
                num: "02",
                title: "Allow camera access",
                desc: "Grant the one-time camera permission when prompted. Your video never leaves your device — all processing happens locally in your browser.",
                tag: "Privacy-first — no data sent",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="help-svg">
                    <path d="M23 7l-7 5 7 5V7z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" />
                  </svg>
                )
              },
              {
                num: "03",
                title: "Sign in front of the camera",
                desc: "Position your hands within the frame and begin signing. The model recognises Indian Sign Language gestures in real time as you go.",
                tag: "ISL — 63 lakh+ users supported",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="help-svg">
                    <path d="M18 11V6a2 2 0 0 0-4 0v0" />
                    <path d="M14 10V4a2 2 0 0 0-4 0v2" />
                    <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
                    <path d="M18 8a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                  </svg>
                )
              },
              {
                num: "04",
                title: "See the translation instantly",
                desc: "Your sign is translated to text in milliseconds and displayed on screen. Share it, read it aloud, or copy it — the voice is yours.",
                tag: "Real-time · No delay",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="help-svg">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                )
              }
            ].map((step) => (
              <div key={step.num} className="help-step">
                <div className="help-icon-col">
                  <div className="help-icon">{step.icon}</div>
                </div>
                <div className="help-step-body">
                  <p className="help-step-num">Step {step.num}</p>
                  <h3 className="help-step-title">{step.title}</h3>
                  <p className="help-step-desc">{step.desc}</p>
                  <span className="help-step-tag">{step.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

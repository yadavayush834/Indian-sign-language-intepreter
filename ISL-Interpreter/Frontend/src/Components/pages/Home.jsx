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

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [isDark]);

  const scrollToHelp = useCallback(() => {
    helpRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className={`homepage-scope ${isDark ? 'dark-theme' : 'light-theme'}`}>
      <div className='fixed top-6 right-6 z-50 animate-fade-up delay-1'>
        <button
        onClick={() => setIsDark(!isDark)}
        className="
            h-14 w-14 flex items-center justify-center
            rounded-full
            backdrop-blur-xl
            border border-white/20
            shadow-xl
            transition-all duration-300
            hover:scale-110
            active:scale-95
  "
        style={{
          background: isDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(255,255,255,0.45)",

          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.5)"
            : "0 8px 32px rgba(31,38,135,0.15)",

          color: isDark ? "#fff" : "#1a1a1a"
        }}
      >
        {isDark
          ? <i className="ri-sun-line text-2xl"></i>
          : <i className="ri-moon-line text-2xl"></i>}
      </button>
      </div>
      <div className="main-wrapper">
        <div className="app-container">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="background-video"
            style={{ display: 'none' }}
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

        <div className="help-section" ref={helpRef}>
          <div className="help-wireframe">
            <div className="help-center-line"></div>

            {helpItems.map((item, index) => {
              const imageOnRight = index % 2 === 0;

              return (
                <div
                  key={item.id}
                  className={`help-row ${imageOnRight ? 'image-right' : 'image-left'}`}
                >
                  {imageOnRight ? (
                    <>
                      <div className="help-desc">
                        <p>{item.description}</p>
                      </div>
                      <div className="help-image-wrap">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="help-image" />
                        ) : (
                          <div className="help-placeholder">{item.title}</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="help-image-wrap">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="help-image" />
                        ) : (
                          <div className="help-placeholder">{item.title}</div>
                        )}
                      </div>
                      <div className="help-desc">
                        <p>{item.description}</p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

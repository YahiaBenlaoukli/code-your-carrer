import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Find Your Dream Job with
            <span className="gradient-text"> AI-Powered Analysis</span>
          </h1>
          <p className="hero-subtitle">
            Upload your CV and get personalized job recommendations, skills analysis, 
            and career insights powered by advanced AI technology.
          </p>
          <div className="hero-buttons">
            <button onClick={handleGetStarted} className="btn-primary">
              Get Started Free
            </button>
            <button className="btn-secondary">
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-card">
            <div className="card-icon">📊</div>
            <h3>AI Analysis</h3>
            <p>Advanced CV parsing and skills extraction</p>
          </div>
          <div className="floating-card">
            <div className="card-icon">🎯</div>
            <h3>Smart Matching</h3>
            <p>Perfect job recommendations</p>
          </div>
          <div className="floating-card">
            <div className="card-icon">📈</div>
            <h3>Career Growth</h3>
            <p>Personalized career insights</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose AI Job Finder?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Analysis</h3>
              <p>Our advanced AI analyzes your CV to extract skills, experience, and career patterns.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Smart Job Matching</h3>
              <p>Get personalized job recommendations based on your skills and career goals.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Detailed Insights</h3>
              <p>Receive comprehensive analysis of your strengths and areas for improvement.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Results</h3>
              <p>Get your analysis and job recommendations in seconds, not hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload Your CV</h3>
              <p>Simply upload your CV in PDF, DOC, or DOCX format.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI Analysis</h3>
              <p>Our AI analyzes your skills, experience, and career patterns.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Results</h3>
              <p>Receive detailed analysis and personalized job recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Find Your Dream Job?</h2>
          <p>Join thousands of professionals who have already discovered their perfect career match.</p>
          <button onClick={handleGetStarted} className="btn-primary">
            Start Your Journey
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>AI Job Finder</h3>
              <p>Empowering careers with AI-powered job matching and analysis.</p>
            </div>
            <div className="footer-section">
              <h4>Features</h4>
              <ul>
                <li>CV Analysis</li>
                <li>Job Matching</li>
                <li>Career Insights</li>
                <li>Skills Assessment</li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 AI Job Finder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 
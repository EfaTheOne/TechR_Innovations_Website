import React from 'react';
import { ArrowRight, ShoppingBag, Shield, Zap, Terminal, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content animate-fade-in">
                        <h1 className="hero-title">
                            Innovating at the Edge of <span className="gradient-text">Possibility</span>
                        </h1>
                        <p className="hero-subtitle">
                            TechR Innovations bridges the gap between cybersecurity, education, potential, and human recovery. We build the future you assume is years away.
                        </p>
                        <div className="hero-actions">
                            <Link to="/techack" className="btn-primary">
                                Explore Techack <Terminal size={18} />
                            </Link>
                            <Link to="/techbox" className="btn-secondary">
                                View TechBoxes <Zap size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="hero-bg-glow"></div>
            </section>

            {/* Business Units Grid */}
            <section className="container section-grid">
                <BusinessCard
                    title="Techack"
                    desc="Professional grade penetration testing and cybersecurity hardware."
                    link="/techack"
                    color="var(--color-techack)"
                    icon={<Shield size={32} />}
                />
                <BusinessCard
                    title="TechBox"
                    desc="STEM education kits designed to ignite the next generation of engineers."
                    link="/techbox"
                    color="var(--color-techbox)"
                    icon={<Zap size={32} />}
                />
                <BusinessCard
                    title="Rithim"
                    desc="Advanced recovery wear blending comfort with therapeutic science."
                    link="/rithim"
                    color="var(--color-rithim)"
                    icon={<Heart size={32} />}
                />
                <BusinessCard
                    title="StudyTech"
                    desc="Offline AI assistants for focused, distraction-free learning."
                    link="/studytech"
                    color="var(--color-studytech)"
                    icon={<Terminal size={32} />}
                />
            </section>

            <style jsx>{`
        .hero {
          position: relative;
          padding: 8rem 0 6rem;
          overflow: hidden;
        }
        
        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 10;
        }

        .hero-title {
          font-size: 4rem;
          line-height: 1.1;
          margin-bottom: 2rem;
          font-family: var(--font-mono);
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--color-text-secondary);
          margin-bottom: 3rem;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .hero-bg-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0,0,0,0) 70%);
          pointer-events: none;
          z-index: 0;
        }

        .section-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          padding-bottom: 6rem;
        }

        @media (max-width: 768px) {
          .hero-title { font-size: 2.5rem; }
        }
      `}</style>
        </div>
    );
};

const BusinessCard = ({ title, desc, link, color, icon }) => (
    <Link to={link} className="business-card glass-panel">
        <div className="card-icon" style={{ color: color }}>
            {icon}
        </div>
        <h3>{title}</h3>
        <p>{desc}</p>
        <div className="card-arrow">
            <ArrowRight size={20} />
        </div>

        <style jsx>{`
      .business-card {
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        transition: transform 0.3s ease, border-color 0.3s ease;
      }

      .business-card:hover {
        transform: translateY(-5px);
        border-color: ${color};
      }

      .card-icon {
        margin-bottom: 0.5rem;
      }

      h3 {
        font-size: 1.5rem;
        color: white;
      }

      p {
        color: var(--color-text-secondary);
        flex-grow: 1;
      }

      .card-arrow {
        align-self: flex-end;
        color: white;
        opacity: 0;
        transform: translateX(-10px);
        transition: all 0.3s ease;
      }

      .business-card:hover .card-arrow {
        opacity: 1;
        transform: translateX(0);
      }
    `}</style>
    </Link>
);

export default Home;

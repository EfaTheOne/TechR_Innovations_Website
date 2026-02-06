import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Terminal, Cpu, Heart, BookOpen, Shield } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Layout = ({ children }) => {
    const { cart } = useStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { name: 'Techack', path: '/techack', icon: <Terminal size={18} /> },
        { name: 'TechBox', path: '/techbox', icon: <Cpu size={18} /> },
        { name: 'Rithim', path: '/rithim', icon: <Heart size={18} /> },
        { name: 'StudyTech', path: '/studytech', icon: <BookOpen size={18} /> },
    ];

    return (
        <div className="layout">
            {/* Header */}
            <header className="header glass-panel">
                <div className="container header-content">
                    <Link to="/" className="logo">
                        <Shield className="logo-icon" size={28} />
                        <span className="logo-text">TechR <span style={{ color: 'var(--color-text-accent)' }}>Innovations</span></span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="desktop-nav">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="header-actions">
                        <Link to="/admin" className="admin-link">Admin</Link>
                        <Link to="/checkout" className="cart-btn">
                            <ShoppingCart size={24} />
                            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
                        </Link>
                        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMenuOpen && (
                    <div className="mobile-nav glass-panel animate-fade-in">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="mobile-nav-link"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="main-content">
                {children}
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="container footer-content">
                    <div className="footer-section">
                        <h3 className="footer-title">TechR Innovations</h3>
                        <p className="footer-desc">Pioneering the future of technology, recovery, and education.</p>
                    </div>
                    <div className="footer-section">
                        <h4>Businesses</h4>
                        <ul>
                            <li><Link to="/techack">Techack Security</Link></li>
                            <li><Link to="/techbox">TechBox Education</Link></li>
                            <li><Link to="/rithim">Rithim Recovery</Link></li>
                            <li><Link to="/studytech">StudyTech AI</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Company</h4>
                        <ul>
                            <li><Link to="/admin">Employee Portal</Link></li>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Contact</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} TechR Innovations. All rights reserved.</p>
                </div>
            </footer>

            <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          border-bottom: 1px solid var(--color-border);
          background: rgba(10, 10, 11, 0.8);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 80px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 1.5rem;
          color: white;
        }
        
        .logo-icon {
          color: var(--color-primary);
        }

        .desktop-nav {
          display: none;
        }

        @media (min-width: 768px) {
          .desktop-nav {
            display: flex;
            gap: 2rem;
          }
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .nav-link:hover, .nav-link.active {
          color: white;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .admin-link {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }

        .cart-btn {
          position: relative;
          color: white;
        }

        .cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--color-text-accent);
          color: black;
          font-size: 0.7rem;
          font-weight: bold;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-menu-btn {
          color: white;
          display: block;
        }
        @media (min-width: 768px) {
          .mobile-menu-btn {
            display: none;
          }
        }

        .mobile-nav {
          position: absolute;
          top: 80px;
          left: 0;
          right: 0;
          padding: 1rem;
          margin: 0 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          color: white;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .main-content {
          padding-top: 100px; /* Header height + spacing */
          min-height: calc(100vh - 300px);
        }

        .footer {
          background: var(--color-bg-secondary);
          padding: 4rem 0 2rem;
          margin-top: 4rem;
          border-top: 1px solid var(--color-border);
        }

        .footer-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
        }

        @media (min-width: 768px) {
          .footer-content {
            grid-template-columns: 2fr 1fr 1fr;
          }
        }

        .footer-title {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          font-family: var(--font-mono);
          color: white;
        }

        .footer-desc {
          color: var(--color-text-secondary);
          max-width: 300px;
        }

        .footer-section h4 {
          color: white;
          margin-bottom: 1.5rem;
        }

        .footer-section ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-section a {
          color: var(--color-text-secondary);
        }

        .footer-section a:hover {
          color: var(--color-text-accent);
        }

        .footer-bottom {
          text-align: center;
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--color-text-secondary);
          font-size: 0.9rem;
        }
      `}</style>
        </div>
    );
};

export default Layout;

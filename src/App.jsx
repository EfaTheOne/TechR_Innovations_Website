import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Techack from './pages/Techack';
import TechBox from './pages/TechBox';
import Rithim from './pages/Rithim';
import StudyTech from './pages/StudyTech';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import { StoreProvider } from './context/StoreContext';

// Placeholder components until real ones are built
const Placeholder = ({ title }) => (
  <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
    <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>{title}</h1>
    <p style={{ color: 'var(--color-text-secondary)' }}>Coming Soon - Under Construction</p>
  </div>
);

function App() {
  return (
    <Router>
      <StoreProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/techack" element={<Techack />} />
            <Route path="/techbox" element={<TechBox />} />
            <Route path="/rithim" element={<Rithim />} />
            <Route path="/studytech" element={<StudyTech />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </Layout>
      </StoreProvider>
    </Router>
  );
}

export default App;

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Brain, Download, Cpu, Code } from 'lucide-react';

const StudyTech = () => {
    const { products, addToCart } = useStore();
    const categoryProducts = products.filter(p => p.category === 'studytech');
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'generator'

    return (
        <div className="page-studytech container">
            <header className="page-header">
                <h1 style={{ color: 'var(--color-studytech)' }}>StudyTech</h1>
                <p>AI-Powered. Offline First. Distraction Free.</p>
                <div className="tab-buttons">
                    <button
                        className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <ShoppingBag size={18} /> Devices
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
                        onClick={() => setActiveTab('generator')}
                    >
                        <Brain size={18} /> AI Content Generator
                    </button>
                </div>
            </header>

            {activeTab === 'products' ? (
                <div className="product-grid animate-fade-in">
                    {categoryProducts.length > 0 ? (
                        categoryProducts.map(product => (
                            <div key={product.id} className="product-card glass-panel">
                                <img src={product.image} alt={product.name} className="product-img" />
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p className="product-desc">{product.description}</p>
                                    <div className="product-footer">
                                        <span className="price">${product.price}</span>
                                        <button onClick={() => addToCart(product)} className="add-btn">
                                            Add <ShoppingBag size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No products available yet.</p>
                    )}
                </div>
            ) : (
                <AIGenerator />
            )}

            <style jsx>{`
                .page-header {
                    margin-bottom: 3rem;
                    border-bottom: 2px solid var(--color-studytech);
                    padding-bottom: 1rem;
                }
                .page-header h1 { font-family: var(--font-mono); font-size: 3rem; }
                
                .tab-buttons { display: flex; gap: 1rem; margin-top: 2rem; }
                .tab-btn {
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    border: 1px solid var(--color-border);
                    color: var(--color-text-secondary);
                    font-weight: 600;
                    display: flex; align-items: center; gap: 0.5rem;
                    transition: all 0.2s;
                }
                .tab-btn.active {
                    background: var(--color-studytech);
                    color: black;
                    border-color: var(--color-studytech);
                }

                .product-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 2rem;
                    padding-bottom: 4rem;
                }
                .product-card { overflow: hidden; }
                .product-img { width: 100%; height: 200px; object-fit: cover; }
                .product-info { padding: 1.5rem; }
                .product-desc { color: var(--color-text-secondary); font-size: 0.9rem; margin: 0.5rem 0 1.5rem; }
                .product-footer { display: flex; justify-content: space-between; align-items: center; }
                .price { font-size: 1.25rem; font-weight: bold; color: white; }
                .add-btn { background: var(--color-studytech); color: black; padding: 0.5rem 1rem; border-radius: 6px; font-weight: bold; display: flex; align-items: center; gap: 0.5rem; }
                .add-btn:hover { opacity: 0.9; }
            `}</style>
        </div>
    );
};

const AIGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [generated, setGenerated] = useState(false);

    const handleGenerate = (e) => {
        e.preventDefault();
        setGenerating(true);
        setGenerated(false);
        setProgress(0);

        // Simulation of AI generation
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 10;
            if (p > 100) {
                p = 100;
                clearInterval(interval);
                setGenerating(false);
                setGenerated(true);
            }
            setProgress(p);
        }, 200);
    };

    return (
        <div className="ai-generator glass-panel animate-fade-in">
            <div className="gen-header">
                <Cpu size={32} color="var(--color-studytech)" />
                <div>
                    <h2>Offline Content Generator</h2>
                    <p>Create custom flashcards and games for your StudyTech device.</p>
                </div>
            </div>

            {!generated ? (
                <form onSubmit={handleGenerate} className="gen-form">
                    <div className="form-group">
                        <label>What do you want to learn?</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Japanese Vocabulary for beginners, Python List Comprehensions, Periodic Table..."
                            rows="4"
                            required
                        />
                    </div>

                    {generating ? (
                        <div className="progress-container">
                            <div className="progress-bar-bg">
                                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                            <span className="p-text">Generating code... {Math.round(progress)}%</span>
                        </div>
                    ) : (
                        <button type="submit" className="btn-generate">
                            <Brain size={18} /> Generate Pack
                        </button>
                    )}
                </form>
            ) : (
                <div className="success-view animate-fade-in">
                    <div className="code-preview">
                        <pre>
                            {`{
  "pack_id": "gen_${Date.now()}",
  "topic": "${prompt}",
  "cards": [
    { "q": "Concept 1", "a": "Definition..." },
    { "q": "Concept 2", "a": "Definition..." }
  ],
  "game_mode": "enabled"
}`}
                        </pre>
                    </div>
                    <button className="btn-download">
                        <Download size={18} /> Download to SD Card
                    </button>
                    <button onClick={() => setGenerated(false)} className="btn-reset">
                        Create Another
                    </button>
                </div>
            )}

            <style jsx>{`
                .ai-generator { max-width: 800px; margin: 0 auto; padding: 2rem; }
                .gen-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
                .gen-header h2 { margin-bottom: 0.25rem; }
                .gen-header p { color: var(--color-text-secondary); }

                .gen-form { display: flex; flex-direction: column; gap: 1.5rem; }
                textarea { 
                    width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--color-border); 
                    padding: 1rem; border-radius: 8px; color: white; font-family: var(--font-sans);
                }
                
                .btn-generate {
                    background: var(--color-studytech); color: black; padding: 1rem; border-radius: 8px;
                    font-weight: bold; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                }
                .btn-generate:hover { opacity: 0.9; }

                .progress-container { text-align: center; }
                .progress-bar-bg { width: 100%; height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden; margin-bottom: 0.5rem; }
                .progress-fill { height: 100%; background: var(--color-studytech); transition: width 0.2s; }
                .p-text { color: var(--color-studytech); font-family: var(--font-mono); }

                .code-preview {
                    background: #111; padding: 1rem; border-radius: 8px; font-family: var(--font-mono); font-size: 0.8rem;
                    color: #a1a1aa; margin-bottom: 1.5rem; border: 1px solid var(--color-border);
                }
                .btn-download {
                    width: 100%; background: white; color: black; padding: 1rem; border-radius: 8px; font-weight: bold;
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem;
                }
                .btn-reset { width: 100%; color: var(--color-text-secondary); text-decoration: underline; }
            `}</style>
        </div>
    );
};

export default StudyTech;

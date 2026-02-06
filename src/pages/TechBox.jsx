import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag } from 'lucide-react';

const TechBox = () => {
    const { products, addToCart } = useStore();
    const categoryProducts = products.filter(p => p.category === 'techbox');

    return (
        <div className="page-techbox container">
            <header className="page-header">
                <h1 style={{ color: 'var(--color-techbox)' }}>TechBox</h1>
                <p>Curiosity Unboxed. STEM Learning for Future Shapers.</p>
            </header>

            <div className="product-grid">
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

            <style jsx>{`
                .page-header {
                    margin-bottom: 3rem;
                    border-bottom: 2px solid var(--color-techbox);
                    padding-bottom: 1rem;
                }
                .page-header h1 { font-family: var(--font-mono); font-size: 3rem; }
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
                .add-btn { background: var(--color-techbox); color: black; padding: 0.5rem 1rem; border-radius: 6px; font-weight: bold; display: flex; align-items: center; gap: 0.5rem; }
                .add-btn:hover { opacity: 0.9; }
            `}</style>
        </div>
    );
};
export default TechBox;

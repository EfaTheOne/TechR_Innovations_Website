import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus } from 'lucide-react';

const Admin = () => {
    const { addProduct, products } = useStore();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'techack',
        description: '',
        image: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addProduct(formData);
        alert('Product added successfully!');
        setFormData({ name: '', price: '', category: 'techack', description: '', image: '' });
    };

    return (
        <div className="admin-page container">
            <h1 className="page-title">Employee Portal - Product Management</h1>

            <div className="admin-grid">
                <div className="glass-panel form-panel">
                    <h2>Add New Product</h2>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-group">
                            <label>Product Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Price ($)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option value="techack">Techack</option>
                                <option value="techbox">TechBox</option>
                                <option value="rithim">Rithim</option>
                                <option value="studytech">StudyTech</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Image URL</label>
                            <input type="url" name="image" value={formData.image} onChange={handleChange} required placeholder="https://..." />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"></textarea>
                        </div>
                        <button type="submit" className="btn-primary">
                            <Plus size={18} /> Add Product
                        </button>
                    </form>
                </div>

                <div className="glass-panel list-panel">
                    <h2>Current Inventory ({products.length})</h2>
                    <ul className="product-list">
                        {products.map(p => (
                            <li key={p.id} className="product-item">
                                <span className={`category-badge ${p.category}`}>{p.category}</span>
                                <span className="p-name">{p.name}</span>
                                <span className="p-price">${p.price}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <style jsx>{`
                .page-title { margin-bottom: 2rem; font-family: var(--font-mono); }
                .admin-grid { display: grid; gap: 2rem; grid-template-columns: 1fr; }
                @media (min-width: 768px) { .admin-grid { grid-template-columns: 1fr 1fr; } }
                
                .glass-panel { padding: 2rem; }
                h2 { margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; }

                .admin-form { display: flex; flex-direction: column; gap: 1rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                label { font-size: 0.9rem; color: var(--color-text-secondary); }
                input, select, textarea {
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid var(--color-border);
                    padding: 0.75rem;
                    border-radius: 6px;
                    color: white;
                    font-family: var(--font-sans);
                }
                input:focus, select:focus, textarea:focus {
                    outline: none;
                    border-color: var(--color-primary);
                }

                .product-list { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; max-height: 500px; overflow-y: auto; }
                .product-item { 
                    display: flex; align-items: center; gap: 1rem; 
                    padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 6px; 
                }
                .p-name { flex-grow: 1; font-weight: 500; }
                .p-price { font-family: var(--font-mono); color: var(--color-text-accent); }
                
                .category-badge {
                    font-size: 0.7rem; text-transform: uppercase; padding: 0.25rem 0.5rem; border-radius: 4px; color: black; font-weight: bold;
                }
                .category-badge.techack { background: var(--color-techack); }
                .category-badge.techbox { background: var(--color-techbox); }
                .category-badge.rithim { background: var(--color-rithim); color: white; }
                .category-badge.studytech { background: var(--color-studytech); }
            `}</style>
        </div>
    );
};

export default Admin;

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CreditCard, CheckCircle, Lock } from 'lucide-react';

const Checkout = () => {
    const { cart, cartTotal, removeFromCart, clearCart } = useStore();
    const [step, setStep] = useState('summary'); // summary, payment, success

    const handlePayment = (e) => {
        e.preventDefault();
        setStep('success');
        setTimeout(() => clearCart(), 1000);
    };

    if (step === 'success') {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div className="animate-fade-in">
                    <CheckCircle size={80} color="var(--color-techack)" style={{ margin: '0 auto 2rem' }} />
                    <h1>Payment Successful</h1>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                        Thank you for your purchase. A receipt has been sent to your email.
                    </p>
                    <button onClick={() => window.location.href = '/'} className="btn-primary">
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page container">
            <h1 className="page-title">Secure Checkout</h1>

            {cart.length === 0 ? (
                <div className="empty-cart glass-panel">
                    <p>Your cart is empty.</p>
                </div>
            ) : (
                <div className="checkout-grid">
                    <div className="cart-summary glass-panel">
                        <h2>Order Summary</h2>
                        <ul className="cart-list">
                            {cart.map((item) => (
                                <li key={item.id} className="cart-item">
                                    <div className="item-details">
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-cat">{item.category}</span>
                                    </div>
                                    <span className="item-price">${item.price}</span>
                                    <button onClick={() => removeFromCart(item.id)} className="remove-btn">Remove</button>
                                </li>
                            ))}
                        </ul>
                        <div className="total-row">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="payment-form glass-panel">
                        <div className="secure-badge">
                            <Lock size={16} /> 256-bit SSL Encrypted
                        </div>
                        <h2>Payment Details</h2>
                        <form onSubmit={handlePayment}>
                            <div className="form-group">
                                <label>Cardholder Name</label>
                                <input type="text" required placeholder="John Doe" />
                            </div>
                            <div className="form-group">
                                <label>Card Number</label>
                                <div className="card-input-wrapper">
                                    <CreditCard size={20} className="card-icon" />
                                    <input type="text" required placeholder="0000 0000 0000 0000" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Expiry</label>
                                    <input type="text" required placeholder="MM/YY" />
                                </div>
                                <div className="form-group">
                                    <label>CVC</label>
                                    <input type="text" required placeholder="123" />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary pay-btn">
                                Pay ${cartTotal.toFixed(2)}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .page-title { margin-bottom: 2rem; font-family: var(--font-mono); }
                .checkout-grid { display: grid; gap: 2rem; grid-template-columns: 1fr; }
                @media (min-width: 768px) { .checkout-grid { grid-template-columns: 1.5fr 1fr; } }
                
                .glass-panel { padding: 2rem; }
                h2 { margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; }

                .cart-list { list-style: none; display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
                .cart-item { display: flex; align-items: center; justify-content: space-between; }
                .item-details { display: flex; flex-direction: column; }
                .item-name { font-weight: 500; }
                .item-cat { font-size: 0.8rem; color: var(--color-text-secondary); text-transform: uppercase; }
                .item-price { font-family: var(--font-mono); }
                .remove-btn { color: #ef4444; font-size: 0.8rem; text-decoration: underline; }

                .total-row { display: flex; justify-content: space-between; font-size: 1.5rem; font-weight: bold; padding-top: 1rem; border-top: 1px solid var(--color-border); }

                .payment-form { position: relative; }
                .secure-badge { position: absolute; top: 1rem; right: 1rem; font-size: 0.7rem; display: flex; align-items: center; gap: 0.25rem; color: var(--color-techack); }
                
                .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                
                input { 
                    width: 100%;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid var(--color-border);
                    padding: 0.75rem;
                    border-radius: 6px;
                    color: white;
                }
                .card-input-wrapper { position: relative; }
                .card-input-wrapper input { padding-left: 2.5rem; }
                .card-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--color-text-secondary); }

                .pay-btn { width: 100%; justify-content: center; margin-top: 1rem; }
            `}</style>
        </div>
    );
};

export default Checkout;

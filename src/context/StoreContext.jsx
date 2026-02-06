import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
    // Mock Initial Products
    const initialProducts = [
        {
            id: 1,
            name: "Techack Pro Penetrator",
            price: 299.99,
            category: "techack",
            description: "Advanced portable penetration testing device.",
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 2,
            name: "TechBox Starter Kit",
            price: 49.99,
            category: "techbox",
            description: "Learn electronics and coding with this beginner-friendly kit.",
            image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 3,
            name: "Rithim Recovery Hoodie",
            price: 89.00,
            category: "rithim",
            description: "Ultra-soft, sustainable fabric designed for comfort and recovery.",
            image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80"
        },
        {
            id: 4,
            name: "StudyTech AI Assistant",
            price: 199.50,
            category: "studytech",
            description: "Offline AI device for generating personalized study materials.",
            image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"
        }
    ];

    // Load products from localStorage or use initial
    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('techr_products');
        return saved ? JSON.parse(saved) : initialProducts;
    });

    const [cart, setCart] = useState([]);

    useEffect(() => {
        localStorage.setItem('techr_products', JSON.stringify(products));
    }, [products]);

    const addProduct = (product) => {
        const newProduct = { ...product, id: Date.now() };
        setProducts([...products, newProduct]);
    };

    const addToCart = (product) => {
        setCart([...cart, product]);
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);

    return (
        <StoreContext.Provider value={{
            products,
            cart,
            addProduct,
            addToCart,
            removeFromCart,
            clearCart,
            cartTotal
        }}>
            {children}
        </StoreContext.Provider>
    );
};

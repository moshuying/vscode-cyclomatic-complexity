import React, { useState, useEffect } from 'react';

// 简单按钮组件 - 低复杂度 (复杂度: 3)
export const SimpleButton = ({ children, onClick, disabled }) => {
    return (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={disabled ? 'btn-disabled' : 'btn-enabled'}
        >
            {children}
        </button>
    );
};

// 智能表单组件 - 中等复杂度 (复杂度: 8)
export const SmartForm = ({ onSubmit, initialData }) => {
    const [formData, setFormData] = useState(initialData || {});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateField = (name, value) => {
        let error = '';
        
        if (name === 'email') {
            if (!value) {
                error = 'Email is required';
            } else if (!value.includes('@')) {
                error = 'Invalid email format';
            }
        } else if (name === 'password') {
            if (!value) {
                error = 'Password is required';
            } else if (value.length < 6) {
                error = 'Password must be at least 6 characters';
            }
        }
        
        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const isValid = Object.keys(formData).every(key => 
                validateField(key, formData[key])
            );
            
            if (isValid && onSubmit) {
                await onSubmit(formData);
            }
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
            />
            {errors.email && <span className="error">{errors.email}</span>}
            
            <input
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
            />
            {errors.password && <span className="error">{errors.password}</span>}
            
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
        </form>
    );
};


import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check auth status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.get('/api/react/user');
            if (response.data.authenticated) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password, remember = false) => {
        try {
            const response = await api.post('/api/react/login', {
                email,
                password,
                remember,
            });

            if (response.data.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return { success: true, message: response.data.message };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول',
            };
        }
    };

    const register = async (name, email, password, passwordConfirmation) => {
        try {
            const response = await api.post('/api/react/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            if (response.data.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return { success: true, message: response.data.message };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            const errors = error.response?.data?.errors;
            let message = 'حدث خطأ أثناء إنشاء الحساب';
            if (errors) {
                message = Object.values(errors).flat().join(', ');
            }
            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            await api.post('/api/react/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

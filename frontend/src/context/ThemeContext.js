import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme, View } from 'react-native'; // View unused
import { lightTheme, darkTheme } from '../utils/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // const sysScheme = useColorScheme();
    // defaulting to light for now, maybe change later
    const [mode, setMode] = useState('light');

    useEffect(() => {
        // console.log('Theme provider mounted');
        // TODO: check system preference
    }, []);

    const switchTheme = () => {
        setMode(prev => (prev === 'light' ? 'dark' : 'light'));
        // console.log('Theme switched to', mode === 'light' ? 'dark' : 'light');
    };

    const theme = mode === 'dark' ? darkTheme : lightTheme
    return (
        <ThemeContext.Provider value={{ theme, isDark: mode === 'dark', toggleTheme: switchTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// custom hook
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

import React from 'react';
import { Moon, Sun, GraduationCap } from 'lucide-react';

const Header = ({ darkMode, toggleDarkMode, totalCredits, completedCredits }) => {
    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Title */}
                    <div className="flex items-center space-x-3">
                        <GraduationCap className="text-primary-600" size={32} />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                BITS Pathway
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Prerequisite Finder
                            </p>
                        </div>
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center space-x-3">
                        {/* Removed credits display */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 
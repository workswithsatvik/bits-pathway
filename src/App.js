import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import PrerequisiteFinder from './components/PrerequisiteFinder';
import DataLoader from './components/DataLoader';

function App() {
    const [darkMode, setDarkMode] = useState(false);
    const [courses, setCourses] = useState({});
    const [availableSubjects, setAvailableSubjects] = useState([]);

    // Load dark mode preference
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('bitsplan_dark_mode') === 'true';
        setDarkMode(savedDarkMode);
        if (savedDarkMode) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('bitsplan_dark_mode', newDarkMode.toString());
        if (newDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Handle data loaded from DataLoader
    const handleDataLoaded = ({ courses: fullCourses, subjects }) => {
        setCourses(fullCourses);
        setAvailableSubjects(subjects);
        // Removed toast.success popup
    };

    return (
        <DataLoader onDataLoaded={handleDataLoaded}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Header
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                    totalCredits={0}
                    completedCredits={0}
                />

                <PrerequisiteFinder courses={courses} availableSubjects={availableSubjects} />

                <Toaster position="top-right" />
            </div>
        </DataLoader>
    );
}

export default App; 
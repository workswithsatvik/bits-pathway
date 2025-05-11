import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase';

const DataLoader = ({ onDataLoaded, children }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                console.log('Loading full course data from Supabase...');

                const { courses, subjects } = await supabase.loadData();

                console.log(`Loaded ${Object.keys(courses).length} courses and ${subjects.length} subjects`);

                // Update the global data
                if (onDataLoaded) {
                    onDataLoaded({ courses, subjects });
                }

                setDataLoaded(true);
                setLoading(false);
            } catch (err) {
                console.error('Error loading course data:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        loadData();
    }, [onDataLoaded]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-600 mb-4" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Loading Course Data
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Loading all 709+ courses from database...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-8 w-8 text-red-600 mb-4" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Error Loading Data
                    </h2>
                    <p className="text-red-600 dark:text-red-400 mb-4">
                        {error}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please check your internet connection and try again.
                    </p>
                </div>
            </div>
        );
    }

    if (dataLoaded) {
        return (
            <>
                {children}
                {/* Removed success notification */}
            </>
        );
    }

    return children;
};

export default DataLoader; 
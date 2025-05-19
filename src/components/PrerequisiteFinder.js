import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, BookOpen, AlertCircle, CheckCircle, Layers } from 'lucide-react';
import { supabase } from '../utils/supabase';

const PrerequisiteFinder = ({ courses, availableSubjects }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showPrerequisiteChain, setShowPrerequisiteChain] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    // Filter courses based on search term
    const filteredCourses = useMemo(() => {
        if (!courses || !searchTerm.trim()) return [];

        const searchLower = searchTerm.toLowerCase();
        return Object.entries(courses)
            .filter(([code, course]) =>
                code.toLowerCase().includes(searchLower) ||
                course.name.toLowerCase().includes(searchLower) ||
                course.description.toLowerCase().includes(searchLower)
            )
            .slice(0, 10); // Limit to 10 results for better UX
    }, [searchTerm, courses]);

    // Get prerequisite chain using proper topological sort concept
    const getPrerequisiteChain = (courseCode) => {
        if (!courseCode || !courses) return [];

        const visited = new Set();
        const chain = [];
        const courseSet = new Set(); // Track all courses in the chain

        // First, collect all courses that are part of the prerequisite chain
        const collectCourses = (code) => {
            if (visited.has(code)) return;
            visited.add(code);

            const course = courses[code];
            if (course && course.prerequisites) {
                course.prerequisites.forEach(prereq => {
                    collectCourses(prereq);
                });
            }
            courseSet.add(code);
        };

        collectCourses(courseCode);

        // Now do a proper topological sort
        const inDegree = {};
        const graph = {};

        // Initialize in-degree and graph
        courseSet.forEach(code => {
            inDegree[code] = 0;
            graph[code] = [];
        });

        // Build the graph and calculate in-degrees
        courseSet.forEach(code => {
            const course = courses[code];
            if (course && course.prerequisites) {
                course.prerequisites.forEach(prereq => {
                    if (courseSet.has(prereq)) {
                        graph[prereq].push(code);
                        inDegree[code]++;
                    }
                });
            }
        });

        // Kahn's algorithm for topological sort
        const queue = [];

        // Add all courses with no prerequisites to the queue
        courseSet.forEach(code => {
            if (inDegree[code] === 0) {
                queue.push(code);
            }
        });

        // Process the queue
        while (queue.length > 0) {
            // Sort courses at the same level by course code for consistent ordering
            queue.sort();

            const current = queue.shift();
            chain.push(current);

            // Reduce in-degree of all dependent courses
            graph[current].forEach(dependent => {
                inDegree[dependent]--;
                if (inDegree[dependent] === 0) {
                    queue.push(dependent);
                }
            });
        }

        return chain;
    };



    // Get courses that depend on the selected course
    const getDependentCourses = (courseCode) => {
        if (!courseCode || !courses) return [];

        return Object.entries(courses)
            .filter(([code, course]) =>
                course.prerequisites && course.prerequisites.includes(courseCode)
            )
            .map(([code]) => code);
    };

    const handleCourseSelect = (courseCode) => {
        setSelectedCourse(courseCode);
        setShowPrerequisiteChain(true);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            setIsSearching(true);
            try {
                await supabase.searchCourses(searchTerm);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsSearching(false);
            }
        }
    };

    if (!courses || !availableSubjects) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-center">
                    <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Loading Course Data
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please wait while we load the course information...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative max-w-4xl mx-auto p-6 overflow-hidden">
            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <Layers className="text-primary-600" size={32} />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Prerequisite Finder
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Search for any course and discover its complete prerequisite chain.
                        Inspired by topological sorting, we show you the exact order courses must be taken.
                    </p>
                </div>

                {/* Search Section */}
                <div className="mb-8">
                    <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search for a course (e.g., 'CS F111' or 'Computer Programming')..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Search Results */}
                    {searchTerm.trim() && (
                        <div className="mt-4 max-w-2xl mx-auto">
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg">
                                {filteredCourses.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                        No courses found matching "{searchTerm}"
                                    </div>
                                ) : (
                                    <div className="max-h-64 overflow-y-auto">
                                        {filteredCourses.map(([code, course]) => (
                                            <button
                                                key={code}
                                                onClick={() => handleCourseSelect(code)}
                                                className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-semibold text-gray-900 dark:text-white">
                                                            {code}
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {course.name}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                                                            {course.subject}
                                                        </span>
                                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                            {course.credits} credits
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Course Details */}
                {selectedCourse && (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg p-6">
                            {/* Course Header */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedCourse}
                                    </h2>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                                            {courses[selectedCourse].subject}
                                        </span>
                                        <span className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                                            {courses[selectedCourse].credits} credits
                                        </span>
                                    </div>
                                </div>
                                <h3 className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                                    {courses[selectedCourse].name}
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Prerequisites */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Prerequisites
                                        </h3>
                                        <button
                                            onClick={() => setShowPrerequisiteChain(!showPrerequisiteChain)}
                                            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                                        >
                                            {showPrerequisiteChain ? 'Hide' : 'Show'} Chain
                                        </button>
                                    </div>

                                    {courses[selectedCourse].prerequisites.length === 0 ? (
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className="text-green-600" size={20} />
                                                <span className="text-green-800 dark:text-green-200 font-medium">
                                                    No prerequisites required
                                                </span>
                                            </div>
                                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                                This course can be taken in any semester
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {courses[selectedCourse].prerequisites.map((prereq, index) => (
                                                <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                                                    <div className="flex items-center space-x-2">
                                                        <AlertCircle className="text-yellow-600" size={16} />
                                                        <span className="font-medium text-yellow-800 dark:text-yellow-200">
                                                            {prereq}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                                        {courses[prereq]?.name || 'Course not found'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Prerequisite Chain */}
                                    {showPrerequisiteChain && courses[selectedCourse].prerequisites.length > 0 && (
                                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                                            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">
                                                Complete Prerequisite Chain (Topological Order)
                                            </h4>
                                            <div className="space-y-2">
                                                {(() => {
                                                    const chain = getPrerequisiteChain(selectedCourse);
                                                    const levels = [];
                                                    let currentLevel = [];
                                                    let currentPrereqs = new Set();

                                                    chain.forEach((courseCode, index) => {
                                                        const course = courses[courseCode];
                                                        const prereqSet = new Set(course?.prerequisites || []);

                                                        // Check if this course has the same prerequisites as the previous one
                                                        if (prereqSet.size === currentPrereqs.size &&
                                                            [...prereqSet].every(prereq => currentPrereqs.has(prereq))) {
                                                            currentLevel.push(courseCode);
                                                        } else {
                                                            if (currentLevel.length > 0) {
                                                                levels.push([...currentLevel]);
                                                            }
                                                            currentLevel = [courseCode];
                                                            currentPrereqs = prereqSet;
                                                        }

                                                        // Add the last level
                                                        if (index === chain.length - 1 && currentLevel.length > 0) {
                                                            levels.push([...currentLevel]);
                                                        }
                                                    });

                                                    return levels.map((level, levelIndex) => (
                                                        <div key={levelIndex} className="flex flex-wrap items-center gap-2">
                                                            <div className="text-xs text-blue-600 font-medium">
                                                                Level {levelIndex + 1}:
                                                            </div>
                                                            {level.map((courseCode, courseIndex) => (
                                                                <div key={courseCode} className="flex items-center">
                                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${courseCode === selectedCourse
                                                                        ? 'bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-blue-100 border-2 border-blue-400'
                                                                        : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                                                        }`}>
                                                                        {courseCode}
                                                                    </span>
                                                                    {courseIndex < level.length - 1 && (
                                                                        <span className="text-blue-400 mx-1">|</span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {levelIndex < levels.length - 1 && (
                                                                <ArrowRight size={12} className="text-blue-600 ml-2" />
                                                            )}
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                                                Courses in the same level can be taken in parallel. Arrows show dependencies.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Dependent Courses */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Courses That Require This
                                    </h3>
                                    {(() => {
                                        const dependentCourses = getDependentCourses(selectedCourse);
                                        return dependentCourses.length === 0 ? (
                                            <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                    No courses currently require {selectedCourse} as a prerequisite
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {dependentCourses.slice(0, 5).map(courseCode => (
                                                    <div key={courseCode} className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {courseCode}
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {courses[courseCode]?.name}
                                                        </div>
                                                    </div>
                                                ))}
                                                {dependentCourses.length > 5 && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                                        +{dependentCourses.length - 5} more courses
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                {!selectedCourse && (
                    <div className="mt-12 text-center">
                        <div className="max-w-2xl mx-auto">
                            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                How to Use Prerequisite Finder
                            </h3>
                            <div className="text-left space-y-2 text-gray-600 dark:text-gray-400">
                                <p>• <strong>Search:</strong> Type a course code (e.g., "CS F111") or course name</p>
                                <p>• <strong>Select:</strong> Choose from the search results</p>
                                <p>• <strong>Explore:</strong> View prerequisites, dependent courses, and the complete chain</p>
                                <p>• <strong>Topological Order:</strong> See the exact sequence courses must be taken</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrerequisiteFinder; 
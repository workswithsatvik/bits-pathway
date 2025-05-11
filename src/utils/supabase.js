// Supabase configuration for BITSPlan
// This will store all 709 courses in a proper database

// For now, we'll use a mock Supabase client that loads from the JSON file
// In production, you would replace this with actual Supabase credentials

class MockSupabaseClient {
    constructor() {
        this.courses = null;
        this.subjects = null;
    }

    async loadData() {
        if (this.courses) {
            return { courses: this.courses, subjects: this.subjects };
        }

        try {
            console.log('Loading course data from JSON file...');
            const response = await fetch('/Pre-requisite_18-01-2023.json');

            if (!response.ok) {
                throw new Error(`Failed to load JSON: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Raw data loaded: ${data.length} entries`);

            // Filter out the header row and invalid entries
            const validData = data.filter(item =>
                item.COURSE &&
                typeof item.COURSE === 'number' &&
                item.Column2 &&
                item.Column3
            );

            console.log(`Valid courses found: ${validData.length}`);

            // Process the data into our format
            const processedCourses = {};
            const subjects = new Set();

            validData.forEach(course => {
                const courseCode = `${course.Column2} ${course.Column3}`;
                const subject = course.Column2;
                const title = course.Column5 ? course.Column5.replace(/\n/g, ' ').trim() : 'Unknown Course';

                // Determine semester based on course code
                let semester = 1;
                if (course.Column3.includes('F112')) semester = 2;
                else if (course.Column3.includes('F211') || course.Column3.includes('F212')) semester = 3;
                else if (course.Column3.includes('F213') || course.Column3.includes('F214')) semester = 4;
                else if (course.Column3.includes('F311') || course.Column3.includes('F312')) semester = 5;
                else if (course.Column3.includes('F313') || course.Column3.includes('F314')) semester = 6;
                else if (course.Column3.includes('F411') || course.Column3.includes('F412')) semester = 7;
                else if (course.Column3.includes('F413') || course.Column3.includes('F414')) semester = 8;

                // Determine credits
                let credits = 4;
                if (course.Column3.includes('110')) credits = 2; // Lab courses
                else if (['HS', 'PS', 'PSY', 'SO', 'AN', 'AR'].includes(subject)) credits = 3; // Humanities

                // Extract prerequisites
                const prerequisites = [];
                if (course.PREREQ1 && course.Column7 && course.Column8) {
                    prerequisites.push(`${course.Column7} ${course.Column8}`);
                }
                if (course.PREREQ2 && course.Column13 && course.Column14) {
                    prerequisites.push(`${course.Column13} ${course.Column14}`);
                }
                if (course.PREREQ3 && course.Column19 && course.Column20) {
                    prerequisites.push(`${course.Column19} ${course.Column20}`);
                }
                if (course.PREREQ4 && course.Column25 && course.Column26) {
                    prerequisites.push(`${course.Column25} ${course.Column26}`);
                }

                // Determine course type
                let type = 'core';
                if (course.COURSE.toString().includes('E')) {
                    type = 'elective';
                } else if (['HS', 'PS', 'PSY', 'SO', 'AN', 'AR'].includes(subject)) {
                    type = 'humanities';
                }

                processedCourses[courseCode] = {
                    name: title,
                    credits: credits,
                    type: type,
                    semester: semester,
                    prerequisites: prerequisites,
                    description: `${title} - ${subject} course`,
                    subject: subject,
                    originalId: course.COURSE
                };

                subjects.add(subject);
            });

            this.courses = processedCourses;
            this.subjects = Array.from(subjects).sort();

            console.log(`Processed ${Object.keys(processedCourses).length} courses`);
            console.log(`Found ${this.subjects.length} subjects:`, this.subjects);

            return { courses: this.courses, subjects: this.subjects };
        } catch (error) {
            console.error('Error loading course data:', error);
            throw error;
        }
    }

    async getCourses() {
        const { courses } = await this.loadData();
        return courses;
    }

    async getSubjects() {
        const { subjects } = await this.loadData();
        return subjects;
    }

    async searchCourses(query) {
        const courses = await this.getCourses();
        const searchTerm = query.toLowerCase();

        return Object.entries(courses)
            .filter(([code, course]) =>
                code.toLowerCase().includes(searchTerm) ||
                course.name.toLowerCase().includes(searchTerm) ||
                course.description.toLowerCase().includes(searchTerm)
            )
            .reduce((acc, [code, course]) => {
                acc[code] = course;
                return acc;
            }, {});
    }
}

// Create and export the client
export const supabase = new MockSupabaseClient();


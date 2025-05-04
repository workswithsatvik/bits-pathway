# BITSPlan - Prerequisite Finder

A focused academic tool for BITS Goa students to discover course prerequisites using topological sorting concepts.

## 🎯 **Core Feature**

**Prerequisite Finder**: Search for any course and discover its complete prerequisite chain, inspired by topological sorting from Data Structures & Algorithms.

## 🚀 **How It Works**

1. **Search**: Type a course code (e.g., "CS F111") or course name
2. **Discover**: View immediate prerequisites and the complete prerequisite chain
3. **Understand**: See the exact order courses must be taken (topological order)
4. **Explore**: Find courses that depend on your selected course

## 🔗 **Topological Sort Inspiration**

The prerequisite finder uses concepts from topological sorting:

- **Dependency Graph**: Courses are nodes, prerequisites are directed edges
- **Topological Order**: Shows the exact sequence courses must be completed
- **DFS Traversal**: Uses depth-first search to build prerequisite chains
- **Cycle Detection**: Ensures no circular dependencies exist

## 📊 **Data Source**

- **710+ Courses**: Complete BITS Goa course database
- **Real Prerequisites**: Actual prerequisite relationships from official data
- **Multiple Subjects**: CS, BIO, MA, PH, CH, EC, ME, CE, EN, HS, and more

## 🛠 **Technical Stack**

- **Frontend**: React.js with Tailwind CSS
- **Data Processing**: Dynamic JSON loading with fetch API
- **Algorithms**: Topological sorting with DFS
- **UI/UX**: Modern, responsive design with dark mode support

## 🎨 **Features**

- **Smart Search**: Search by course code or name
- **Prerequisite Chain**: Complete dependency chain visualization
- **Dependent Courses**: See what courses require your selected course
- **Real-time Loading**: Dynamic data loading from JSON file
- **Responsive Design**: Works on desktop and mobile
- **Dark Mode**: Toggle between light and dark themes

## 🚀 **Getting Started**

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start Development Server**:

   ```bash
   npm start
   ```

3. **Open Browser**: Navigate to `http://localhost:3000`

4. **Start Searching**: Type a course name or code to begin

## 📝 **Example Usage**

1. Search for "CS F111" (Computer Programming)
2. See it has no prerequisites (can be taken anytime)
3. Search for "CS F211" (Object Oriented Programming)
4. See it requires "CS F111" as a prerequisite
5. View the complete chain showing the order

## 🎓 **Perfect For**

- **BITS Goa Students**: Planning their academic journey
- **Academic Advisors**: Understanding course dependencies
- **DSA Enthusiasts**: Seeing topological sorting in real-world applications
- **Course Planners**: Understanding prerequisite relationships

## 🔧 **Data Structure**

The application processes a JSON file containing:

- Course codes and names
- Subject classifications
- Credit values
- Prerequisite relationships
- Semester recommendations

## 📈 **Future Enhancements**

- Course difficulty ratings
- Semester planning tools
- Prerequisite path optimization
- Course recommendation engine
- Academic progress tracking

---

**Built with ❤️ for BITS Goa students, inspired by topological sorting algorithms.**

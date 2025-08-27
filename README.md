# WeekSync

A Progressive Web App for tracking weekly and daily tasks with a native iOS-like design. This application helps you organize your tasks, track your progress, and stay productive throughout the week.

## Features

- **Daily and Weekly Views**: Easily switch between a view of your tasks for the selected day or the entire week.
- **Task Management**: Create, complete, delete, and mark tasks as important.
- **Categorization**: Assign categories to your tasks for better organization.
- **Task Migration**: Move incomplete tasks from the previous day to the current day.
- **Responsive Design**: A clean, mobile-first design that works on all screen sizes.
- **Dark/Light Mode**: The theme automatically adapts to your system's settings.

## Getting Started

To get the application running locally, you'll need to set up a MongoDB database and configure your environment.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- A MongoDB database instance (you can get one for free from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of your project and add your MongoDB connection string:
    ```
    MONGODB_URI="your_mongodb_connection_string_here"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)

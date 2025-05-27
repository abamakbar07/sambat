# Melodic Whispers

## Introduction
Melodic Whispers is a web application where users can share their thoughts or messages accompanied by a song that matches their mood. It's a space for expressive, music-paired sharing. Users can post with their name or anonymously.

## Features
*   **Create Posts:** Share a message (up to 280 characters).
*   **Song Association:** Search for and attach a song from Spotify to each post.
*   **Optional Author Name:** Users can choose to add their name to a post or remain anonymous.
*   **Post Feed:** View a paginated list of all active posts.
*   **Search Posts:** Search for posts by keywords in the message, song title, artist name, or author name.
*   **Report Posts:** Functionality to report posts (details not covered in this task but exists).
*   **Responsive Design:** The application is designed to work on various screen sizes.

## Tech Stack
*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui
*   **API:** Spotify API (for song search)
*   **Linting/Formatting:** (Assumed ESLint/Prettier, or add if known)

## Getting Started

### Prerequisites
*   Node.js (version 20.x or later)
*   npm, pnpm, or yarn
*   PostgreSQL server running
*   A Spotify Developer account and API credentials (for song search functionality)

### Setup and Installation
1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install # or npm install / yarn install
    ```
3.  **Set up environment variables:**
    *   Create a `.env` file in the root of the project by copying the example if one exists (e.g., `.env.example`).
    *   Add the following environment variables:
        ```env
        DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
        SPOTIFY_CLIENT_ID="YOUR_SPOTIFY_CLIENT_ID"
        SPOTIFY_CLIENT_SECRET="YOUR_SPOTIFY_CLIENT_SECRET"
        NEXT_PUBLIC_BASE_URL="http://localhost:3000" # Or your deployment URL
        ```
    *   Replace placeholder values with your actual credentials and database connection string.

4.  **Database Migration:**
    *   Apply Prisma migrations to set up the database schema:
        ```bash
        npx prisma migrate dev
        ```
    *   *(Note: If you encountered issues with migrations during development, ensure your `DATABASE_URL` is correctly configured and accessible.)*

5.  **Run the development server:**
    ```bash
    pnpm dev # or npm run dev / yarn dev
    ```
    The application should now be running at `http://localhost:3000`.

## Future Improvements (Optional)
*   User accounts and authentication.
*   Commenting on posts.
*   Liking posts.
*   Admin panel for content moderation.

---

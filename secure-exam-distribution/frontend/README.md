Secure Exam Paper Distribution System
A full-stack web application for securely distributing exam papers using AES encryption. Built with Flask (backend) and React with Vite + TailwindCSS (frontend).
Prerequisites

Python 3.8+
Node.js 18+
npm or yarn

Setup Instructions
Backend

Navigate to the backend directory:cd backend


Create a virtual environment and activate it:python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate


Install dependencies:pip install -r ../requirements.txt


Run the Flask server:python app.py



Frontend

Navigate to the frontend directory:cd frontend


Install dependencies:npm install


Run the development server:npm run dev



Usage

Access the frontend at http://localhost:5173.
Upload PDF files with a password on the home page.
View and download encrypted files on the /download page by providing the correct password.

Directory Structure

backend/: Flask backend with AES encryption logic.
frontend/: React frontend with Vite and TailwindCSS.
storage/: Stores encrypted files.
decrypted/: Temporary storage for decrypted files during download.

Notes

Ensure the backend is running before accessing the frontend.
Only PDF files are supported for upload.
Encrypted files have a .enc extension.


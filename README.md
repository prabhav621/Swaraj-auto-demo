# Swaraj-Auto Demo

Welcome to the **Swaraj-Auto** project! This repository contains a full-stack prototype of a government service platform built to automate data processing and provide a modern, bilingual dashboard.

## Overview
This project consists of two main parts:
- **Frontend**: A Next.js 14 dashboard with Shadcn UI components.
- **Backend**: A Python API service handling logic like RapidFuzz string matching for eligibility verification.

---

## Getting Started

To run this project on your local machine, you will need to set up both the backend server and the frontend dashboard. Follow the steps below!

### Prerequisites
Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (Version 18 or higher)
- [Python 3](https://www.python.org/downloads/) (Version 3.8 or higher)
- [Git](https://git-scm.com/)

---

### 1. Setting Up the Backend (Python)
The backend provides the API endpoints required by the dashboard.

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. (Optional but recommended) Create and activate a virtual environment:
   - **Windows:**
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install the dependencies (like RapidFuzz, Flask/FastAPI, etc.) if a requirements file is present, or manually if needed:
   *(If `requirements.txt` exists)*
   ```bash
   pip install -r requirements.txt
   ```
   *(If not, install the libraries used in `main.py` directly, e.g., `pip install rapidfuzz flask`)*

4. Start the backend server:
   ```bash
   python main.py
   ```
   *The backend should now be running (usually on `http://localhost:5000` or `http://localhost:8000`). Leave this terminal window open.*

---

### 2. Setting Up the Frontend (Next.js)
The frontend is the interactive dashboard where users see the processed government data.

1. Open a **new** terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install the Node.js dependencies:
   ```bash
   npm install
   ```
   *(Note: This might take a minute or two to download the required packages into a `node_modules` folder.)*

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open your web browser and navigate to:
   **[http://localhost:3000](http://localhost:3000)**

---

## Enjoy!
You should now be able to see the bilingual dashboard and interact with the triage tables and features. If you experience any memory issues on smaller machines during the Next.js build, note that the `npm run dev` script is configured with `--max-old-space-size=1024` to help keep things stable!

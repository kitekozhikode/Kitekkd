# Supabase Setup Guide

To make your "Add Teacher" feature work with a real database, follow these steps:

## Step 1: Create a Project
1.  Go to [supabase.com](https://supabase.com/) and Sign Up (it's free).
2.  Click **"New Project"**.
3.  Give it a name (e.g., `Kite Replica`) and a database password.
4.  Wait for it to setup (takes ~1 minute).

## Step 2: Create the Database Table
1.  Go to the **Table Editor** (icon on the left).
2.  Click **"New Table"**.
3.  Name it: `users`.
4.  **Uncheck** "Enable Row Level Security (RLS)" (for this simple demo, we will disable it to make things easy).
5.  Add the following columns:
    *   `username` (Type: `text`)
    *   `password` (Type: `text`)
    *   `name` (Type: `text`)
    *   `role` (Type: `text`)
6.  Click **Save**.

## Step 3: Add Initial Admin
1.  In the Table Editor, click **"Insert Row"**.
2.  Fill in:
    *   `username`: `admin`
    *   `password`: `admin123`
    *   `name`: `System Admin`
    *   `role`: `admin`
3.  Click **Save**.

## Step 4: Get Your Credentials
1.  Go to **Project Settings** (gear icon).
2.  Click **API**.
3.  Copy the **Project URL**.
4.  Copy the **anon public** key.

## Step 5: Connect Your Website
1.  Open `auth.js` on your computer.
2.  Find the lines at the top:
    ```javascript
    const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
    const SUPABASE_KEY = 'YOUR_SUPABASE_KEY_HERE';
    ```
3.  Paste your copied values there.
4.  Done! Your website now uses a real cloud database.

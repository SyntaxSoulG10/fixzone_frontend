# Fix Zone Architecture Guide

## Directory Structure
Fix Zone follows the **"Separation of Concerns"** pattern for Next.js App Router applications.

### 1. `app/` Directory (Routing)
This folder is strictly for **Routes** and **Pages**.
- **Role**: Defines the URL structure of the application.
- **Why**: Keeping this clean makes it easy to see the application's map at a glance.
- **Content**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`.

### 2. `components/` Directory (UI Logic)
This folder is for **Reusable UI Elements**.
- **Role**: Holds the building blocks of the interface.
- **Why**: Components here are accessible by any part of the application.
    - `UI/`: Small, atomic components (Buttons, Inputs).
    - `layout/`: Structural components (Navbar, Sidebar).
    - `landing/`: Components specific to the marketing page.

### 3. `data/` & `types/` (Data Layer)
- **Role**: Defines the shape of data (`types`) and provides mock content (`data`).
- **Why**: Decouples the UI from the backend logic.

## Why not put components inside `app/`?
While Next.js allows components inside `app/`, we avoid it for **Global Components** because:
1.  **Clutter**: Mixing `Button.tsx` with `page.tsx` makes the file tree hard to read.
2.  **Routing Confusion**: Next.js treats folders in `app` as routes. Putting components there can sometimes lead to accidental routes or requires using special `_folder` naming conventions.
3.  **Reusability**: Components in `app/dashboard/components` are harder to import from `app/auth/`. Root `components/` makes them universally available.

**Conclusion**: The current structure is the industry standard for scalable Enterprise Next.js applications.

# BuildMyHome Frontend

React frontend for the BuildMyHome MERN stack application.

## Features

- Modern, responsive UI with Tailwind CSS
- Smooth animations with Framer Motion
- Popular House Designs section with hover effects
- Top Engineers section with profile cards
- How It Works timeline section
- Testimonials carousel
- Complete Footer with navigation

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Axios

## Getting Started

### Install Dependencies

```bash
cd frontend
npm install
```

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── context/       # React context
│   ├── hooks/         # Custom hooks
│   ├── utils/         # Utility functions
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # Entry point
│   └── index.css      # Global styles
├── public/            # Static assets
├── index.html         # HTML template
├── package.json       # Dependencies
├── vite.config.js     # Vite configuration
└── tailwind.config.js # Tailwind configuration
```

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api/v1`. 

To change the API URL, create a `.env` file:

```
VITE_API_URL=http://localhost:5000/api/v1
```

## Available Sections

1. **Hero Section** - Search bar and statistics
2. **Features Section** - Key features cards
3. **Popular Designs** - House design gallery with hover effects
4. **Top Engineers** - Engineer profile cards
5. **How It Works** - 4-step timeline
6. **Testimonials** - Customer reviews carousel
7. **Footer** - Navigation and contact info


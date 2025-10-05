# Project Structure

```
.
├── README.md                    # Main project documentation
├── backend/
│   ├── package.json            # Backend dependencies
│   ├── server.js               # Main server file
│   ├── .env                    # Environment variables
│   ├── README.md               # Backend documentation
│   ├── test-api.js             # API testing script
│   └── src/
│       ├── controllers/        # Request handlers
│       │   └── weatherController.js
│       ├── routes/             # API routes
│       │   └── weather.js
│       └── utils/              # Utility functions
│           └── rainLogic.js
└── frontend/
    ├── package.json            # Frontend dependencies
    ├── vite.config.js          # Vite configuration
    ├── index.html              # Main HTML file
    ├── postcss.config.cjs      # PostCSS configuration
    ├── tailwind.config.js      # Tailwind CSS configuration
    ├── README.md               # Frontend documentation
    ├── src/
    │   ├── index.css           # Global CSS
    │   ├── main.jsx            # React entry point
    │   ├── App.jsx             # Main React component
    │   └── components/         # React components
    │       ├── DateInput.jsx
    │       ├── LocationInput.jsx
    │       ├── RainPredictionCard.jsx
    │       └── VisualizationPanel.jsx
```
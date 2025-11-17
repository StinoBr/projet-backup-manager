import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // <-- AJOUT
import App from './App.jsx'
// './index.css' // Si vous avez un index.css
import './App.css' // Notre App.css

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* On enveloppe l'App dans le routeur */}
    <BrowserRouter> {/* <-- AJOUT */}
      <App />
    </BrowserRouter> {/* <-- AJOUT */}
  </React.StrictMode>,
)
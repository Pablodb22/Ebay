import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Register from './componentes/ZonaCliente/Registro/Register';
import Login from './componentes/ZonaCliente/Login/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import Header from './componentes/ZonaTienda/layoutComponent/headerComponent/Header';
import App from './App';
// Renderizado principal de la aplicación
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  /*
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  </React.StrictMode>*/
  
  <React.StrictMode>
    <App/>
  </React.StrictMode>

);


reportWebVitals();
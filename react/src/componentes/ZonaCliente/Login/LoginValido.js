import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import './Login.css';
import { Link } from "react-router-dom";
import useGlobalStore from "../../../hooks_personalizados/storeGlobal";

function LoginValido({ emailUser,setPassUser,handletClickButtonsPass }){

    const links = [{ name: "Cambiar de cuenta", href: "/", }];
    
    return (
        <div className="Login d-flex flex-column align-items-center justify-content-center vh-75">
          <div className="contenedor text-center">
            <p className="fs-2 fw-bold mb-3">Hola de nuevo!</p>
            <p className="text-muted mb-4">
            {emailUser} 
            {links.map((x) => (
            <Link to={x.href}>{x.name}</Link>
          ))}
          </p>
    
            <div className="login d-flex flex-column align-items-center mb-3 w-100">
              <input
                className="Contraseña form-control mb-3"
                placeholder="Contraseña"
                onChange={(ev) => setPassUser(ev.target.value)}                
              />
    
              <button
                name="Identificate"
                className="Identificate btn btn-primary w-100 rounded-pill"
                onClick={handletClickButtonsPass}
                
              >
                Identifícate
              </button>
            </div>
          </div>
        </div>
      );
    }

export default LoginValido;
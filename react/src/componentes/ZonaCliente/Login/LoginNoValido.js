import React from "react";
import { Link } from "react-router-dom";
import face from "../../../imagenes/facebook.png";
import appl from "../../../imagenes/apple.png";
import goo from "../../../imagenes/google.jpeg";
import "bootstrap/dist/css/bootstrap.min.css";
import './Login.css';

function LoginNoValido({setEmailUser, handletClickButtons }){   
    
    const links = [{ name: "Crea una cuenta", href: "/Cliente/Registro" }];
    const providers = [
      { name: "Facebook", imgSrc: face },
      { name: "Google", imgSrc: goo },
      { name: "Apple", imgSrc: appl },
    ];
  
    return (
      <div className="Login d-flex flex-column align-items-center justify-content-center vh-100">
        <div className="contenedor text-center">
          <p className="fs-2 fw-bold mb-3">Hola</p>
          <p className="text-muted mb-4">
            Identifícate en Ebay o{" "}
            {links.map((x) => (
              <Link to={x.href} className="text-decoration-none" key={x.name}>{x.name}</Link>
            ))}
          </p>
  
          <div className="login d-flex flex-column align-items-center mb-3 w-100">
            <input
              className="Correo form-control mb-3"
              placeholder="Correo Electrónico o seudónimo"
              onChange={(ev) => setEmailUser(ev.target.value)}
            />
  
            <button
              name="Continuar"
              className="Continuar btn btn-primary w-100 rounded-pill"
              onClick={handletClickButtons}
            >
              Continuar
            </button>
          </div>
  
          <div className="w-100 my-3">
            <hr className="w-100" />
          </div>
  
          <div className="login_aplicaciones d-flex flex-column align-items-center w-100 gap-3">
            {providers.map((provider) => (
              <button
                name={provider.name}
                key={provider.name}
                onClick={handletClickButtons}
                className={`boton_apps btn w-100 d-flex align-items-center justify-content-center gap-2 rounded-pill ${provider.name === "Facebook" ? "bg-primary text-white" : "bg-white border"}`}
              >
                <img src={provider.imgSrc} alt={provider.name} className="imagen_apps" />
                Continuar con {provider.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

export default LoginNoValido;
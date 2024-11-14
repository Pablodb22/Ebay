import "bootstrap/dist/css/bootstrap.min.css";
import "./Registro.css";
import face from "../../../imagenes/facebook.png";
import appl from "../../../imagenes/apple.png";
import goo from "../../../imagenes/google.jpeg";
import React, { useEffect, useState } from "react";

function RegistroCliente({ state, setState, validaciones, datos }) {
    
    return(    
        <form className={`formulario-personal ${state.activeButton === false ? "" : "d-none"}`}> 
        <div className="formulario_reg_1 mb-2">
          <input
            className="nombre_reg form-control me-2"
            placeholder="Nombre"
            onBlur={validaciones}
            onChange={(e) => {
              setState({
                  ...state,
                  valores: {
                      ...state.valores,
                      nombre: e.target.value
                  }
              });
          }}
          />
          {state.mensajeError.mensajeErrorNombre && <span className="text-danger">{state.mensajeError.mensajeErrorNombre}</span>}
          <input
            className="apellidos_reg form-control"
            placeholder="Apellidos"
            onBlur={validaciones}
            onChange={(e) => {
              setState({
                  ...state,
                  valores: {
                      ...state.valores,
                      apellidos: e.target.value
                  }
              });
          }}
          
          />
          {state.mensajeError.mensajeErrorApellido && <span className="text-danger">{state.mensajeError.mensajeErrorApellido}</span>}
        </div>
        <div className="mb-3">
          <input
            className="correo_reg form-control mb-2"
            placeholder="Correo Electrónico"
            type="email"
            onBlur={validaciones}
            onChange={(e) => {
              setState({
                  ...state,
                  valores: {
                      ...state.valores,
                      correo: e.target.value
                  }
              });
          }}
          
          />
          {state.mensajeError.mensajeErrorCorreo && <span className="text-danger">{state.mensajeError.mensajeErrorCorreo}</span>}
          <input
            className="contra_reg form-control"
            placeholder="Contraseña"
            type="password"
            onBlur={validaciones}
            onChange={(e) => {
              setState({
                  ...state,
                  valores: {
                      ...state.valores,
                      contraseña: e.target.value
                  }
              });
          }}
          
          />
          {state.mensajeError.mensajeErrorContraseña && <span className="text-danger">{state.mensajeError.mensajeErrorContraseña}</span>}
        </div>

        <p className="text-center mt-3">
          Te enviaremos correos electrónicos sobre ofertas relacionadas con nuestros servicios periódicamente.
          Puedes cancelar la suscripción en cualquier momento.
        </p>
        <p className="text-center">
          Al seleccionar Crear cuenta personal, aceptas nuestras Condiciones de uso y reconoces haber leído
          nuestro Aviso de privacidad.
        </p>
        <button
          className="enviar_reg btn btn-primary mb-3"
          onClick={datos}                
          disabled={state.isButtonEnabled}
        >
          Crear cuenta personal
        </button>

        <div className="text-center">
          <hr />
        </div>

        <div className="botones_apps mt-3">
          <button className="boton_facebook btn btn-outline-secondary">
            <img className="me-2" src={face} alt="Facebook" width="20" height="20" />
            Facebook
          </button>
          <button className="boton_google btn btn-outline-secondary">
            <img className="me-2" src={goo} alt="Google" width="20" height="20" />
            Google
          </button>
          <button className="boton_apple btn btn-outline-secondary">
            <img className="me-2" src={appl} alt="Apple" width="20" height="20" />
            Apple
          </button>
        </div>
        </form> 
    );
  }           
    export default RegistroCliente;
import "bootstrap/dist/css/bootstrap.min.css";
import "./Registro.css";
import React, { useEffect, useState } from "react";

function RegistroEmpresa({ state, setState, validaciones_empresa, datos_empresa }) {
return(

    <form className={`formulario-empresa ${state.activeButton === true ? "" : "d-none"}`}>
    <p> Continúa para registrarte como <strong>empresa u organización sin ánimo de lucro</strong>, o si tienes intención de vender un número elevado de artículos.</p>
    <div className="formulario_reg_1 mb-2">              
        <input
          className="nombre_reg form-control me-2"
          placeholder="Nombre Empresa"
          onBlur={validaciones_empresa}
          onChange={(e) => {
            setState({
                ...state,
                valores: {
                    ...state.valores,
                    nombre_empresa: e.target.value
                }
            });
        }}
        />
        {state.mensajeError.mensajeErrorNombre_Empresa && <span className="text-danger">{state.mensajeError.mensajeErrorNombre_Empresa}</span>}                                
      </div>
      <div className="mb-3">
        <input
          className="correo_reg form-control mb-2"
          placeholder="Correo Electrónico de la Empresa"
          type="email"
          onBlur={validaciones_empresa}
          onChange={(e) => {
            setState({
                ...state,
                valores: {
                    ...state.valores,
                    correo_empresa: e.target.value
                }
            });
        }}
        
        />
        {state.mensajeError.mensajeErrorCorreo_Empresa && <span className="text-danger">{state.mensajeError.mensajeErrorCorreo_Empresa}</span>}
        <input
          className="contra_reg form-control mb-2"
          placeholder="Contraseña"
          type="password"
          onBlur={validaciones_empresa}
          onChange={(e) => {
            setState({
                ...state,
                valores: {
                    ...state.valores,
                    contraseña_empresa: e.target.value
                }
            });
        }}
        
        />
        {state.mensajeError.mensajeErrorContraseña_Empresa && <span className="text-danger">{state.mensajeError.mensajeErrorContraseña_Empresa}</span>}              

              
       <select  className="despliegue_reg form-control mb-2" > 
        <option value="" hidden selected>¿Donde esta registrada tu empresa?</option>
        {state.ciudades.map((country) => (<option value={country.name.common}>{country.name.common}</option>))}
       </select>      
    
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
        onClick={datos_empresa}
        disabled={state.isButtonEnabled}
      >
        Crear cuenta de empresa
      </button>                           
      </form>
);

}

export default RegistroEmpresa;
import React, { useEffect, useState } from "react";
import logo from "../../../imagenes/logo_ebay.png";
import face from "../../../imagenes/facebook.png";
import appl from "../../../imagenes/apple.png";
import goo from "../../../imagenes/google.jpeg";
import personal from "../../../imagenes/personal.jpg";
import empresa from "../../../imagenes/empresa.jpg";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Registro.css";
import restService from '../../../servicios/restServiceCliente';
import RegistroCliente from "./RegistroCliente";
import RegistroEmpresa from "./RegisterEmpresa";

//MOVERME ENTRE PAGINAS
function Registro() {
  const links = [
    {
      name: "Identifícate",
      href: "/Cliente/Login",
    },
  ];
  
//TODOS LOS ESTADOS EN UNO
  const [state, setState] = useState({
    activeButton: false,
    isButtonEnabled: true,
    ciudades:[],
    valores: {
      nombre: "",
      apellidos: "",
      correo: "",
      contraseña: "",
      nombre_empresa:"",
      correo_empresa:"",
      contraseña_empresa:"",
    },
    validar: {
      nombreValido: false,
      apellidosValidos: false,
      correoValido: false,
      contraseñaValida: false,
      nombreValido_Empresa: false,
      correoValido_Empresa: false,
      contraseñaValido_Empresa: false,
    },
    mensajeError: {
      mensajeErrorNombre: "",
      mensajeErrorApellido: "",
      mensajeErrorCorreo: "",
      mensajeErrorContraseña: "",
      mensajeErrorNombre_Empresa:"",
      mensajeErrorCorreo_Empresa:"",
      mensajeErrorContraseña_Empresa:"",
    },
  });

  //ENVIAR DATOS DEL FORMULARIO PERSONAL AL restService
  /* 1º FORMA ANTIGUA
  const datos = (e) => {
    e.preventDefault();

  restService.RegistrarCliente({
   nombre: state.valores.nombre,
   apellidos: state.valores.apellidos,
   correo: state.valores.correo,
   contraseña: state.valores.contraseña,
  });

  restService.addCallBackEvent('peticionCompletadaRegistro',(ev)=>{
    console.log('datos recibidos del server de nodejs ante el registro',ev.detail);
  });

  };
*/

//2º FORMA PROMESAS
/*const datos = (e) => {
  e.preventDefault();

  restService.RegistrarCliente({
    nombre: state.valores.nombre,
    apellidos: state.valores.apellidos,
    correo: state.valores.correo,
    contraseña: state.valores.contraseña
  })
  .then(respuestaServer => console.log("Respuesta de nodejs OK en registro:", respuestaServer))
  .catch(errorServer => console.error("Error en Node.js en registro:", errorServer));
};*/

//  3º FORMA ASYNC AWAIT
const datos = async (e) => {
  e.preventDefault();

  try {
    // Llamamos al servicio de registro de cliente usando await
    const respuestaServer = await restService.RegistrarCliente({
      nombre: state.valores.nombre,
      apellidos: state.valores.apellidos,
      correo: state.valores.correo,
      contraseña: state.valores.contraseña
    });
    
    console.log("Respuesta de nodejs OK en registro personal:", respuestaServer);

  } catch (errorServer) {
    console.error("Error en Node.js en registro personal:", errorServer);
  }
};


  //ENVIAR DATOS DEL FORMULARIO EMPRESA AL restService
  const datos_empresa = async (e) => {
    e.preventDefault();
    try {
      // Llamamos al servicio de registro de cliente usando await
      const respuestaServeEmpresa = await restService.RegistrarCliente({
        nombre: state.valores.nombre_empresa,        
        correo: state.valores.correo_empresa,
        contraseña: state.valores.contraseña_empresa
      });
      
      console.log("Respuesta de nodejs OK en registro personal:", respuestaServeEmpresa);
  
    } catch (errorServer) {
      console.error("Error en Node.js en registro personal:", errorServer);
    }
  };

  //CAMBIAR BOTON PERSONAL / EMPRESA
  const cambiar = (buttonType) => {
    setState ({...state,
      activeButton: buttonType,
    });
  };
  
  //COMPROBAR VALIDACIONES Y MENSAJES DE ERROR PERONAL
  function validaciones (ev) {
    const boton=ev.target.className;
    //Nombre
    if(boton ==="nombre_reg form-control me-2"){
      const patron = /^[A-Za-z\s]+$/;
      const { nombre } = state.valores;
      let mensajeErrorNombre = "";
    let nombreValido = true;
    if (nombre.trim() === "") {
      mensajeErrorNombre = "Error el nombre está vacío";
      nombreValido = false;
    } else if (nombre.length > 150) {
      mensajeErrorNombre = "Error el nombre tiene más de 150 caracteres";
      nombreValido = false;
    } else if (!patron.test(nombre)) {
      mensajeErrorNombre = "Error el nombre no tiene el patrón correcto";
      nombreValido = false;
    }

    setState((prevState) => ({
      ...prevState,
      validar: { ...prevState.validar, nombreValido },
      mensajeError: { ...prevState.mensajeError, mensajeErrorNombre },
    }));

    verificarValidaciones();
    }

    //Apellido
    if(boton==="apellidos_reg form-control"){
      const patron = /^[A-Za-z\s]+$/;
      const { apellidos } = state.valores;
  
      let mensajeErrorApellido = "";
      let apellidosValidos = true;
  
      if (apellidos.trim() === "") {
        mensajeErrorApellido = "Error el apellido está vacío";
        apellidosValidos = false;
      } else if (apellidos.length > 250) {
        mensajeErrorApellido = "Error el apellido tiene más de 250 caracteres";
        apellidosValidos = false;
      } else if (!patron.test(apellidos)) {
        mensajeErrorApellido = "Error el apellido no tiene el patrón correcto";
        apellidosValidos = false;
      }
  
      setState((prevState) => ({
        ...prevState,
        validar: { ...prevState.validar, apellidosValidos },
        mensajeError: { ...prevState.mensajeError, mensajeErrorApellido },
      }));
  
      verificarValidaciones();
    }

    //Correo
    if(boton==="correo_reg form-control mb-2"){
      const patron = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|msn|yahoo)\.[a-z]{2,3}$/;
      const { correo } = state.valores;
  
      let mensajeErrorCorreo = "";
      let correoValido = true;
  
      if (correo.trim() === "") {
        mensajeErrorCorreo = "Error el correo está vacío";
        correoValido = false;      
      } else if (!patron.test(correo)) {
        mensajeErrorCorreo = "Error el correo no cumple con el patrón, ej: mio@hotmail.es";
        correoValido = false;
      }
  
      setState((prevState) => ({
        ...prevState,
        validar: { ...prevState.validar, correoValido },
        mensajeError: { ...prevState.mensajeError, mensajeErrorCorreo },
      }));
  
      verificarValidaciones();
    }

    //Contraseña
    if(boton === "contra_reg form-control"){
      const patron4 = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      const { contraseña } = state.valores;
  
      let mensajeErrorContraseña = "";
      let contraseñaValida = true;
  
      if (contraseña.trim() === "") {
        mensajeErrorContraseña = "Error la contraseña está vacía";
        contraseñaValida = false;
      } else if (contraseña.length < 8) {
        mensajeErrorContraseña = "Error la contraseña es inferior a 8 caracteres";
        contraseñaValida = false;
      } else if (!patron4.test(contraseña)) {
        mensajeErrorContraseña = "Error la contraseña no tiene el patrón correcto";
        contraseñaValida = false;
      }
  
      setState((prevState) => ({
        ...prevState,
        validar: { ...prevState.validar, contraseñaValida },
        mensajeError: { ...prevState.mensajeError, mensajeErrorContraseña },
      }));
  
      verificarValidaciones();
    }
  }

  //COMPROBAR VALIDACIONES Y MENSAJES DE ERROR EMPRESA
  function validaciones_empresa (ev) {
    const boton=ev.target.className;
    //Nombre
    if(boton ==="nombre_reg form-control me-2"){
      const patron = /^[A-Za-z\s]+$/;
      const { nombre_empresa } = state.valores;
      let mensajeErrorNombre_Empresa = "";
    let nombreValido_Empresa = true;
    if (nombre_empresa.trim() === "") {
      mensajeErrorNombre_Empresa = "Error el nombre está vacío";
      nombreValido_Empresa = false;
    } else if (nombre_empresa.length > 150) {
      mensajeErrorNombre_Empresa = "Error el nombre tiene más de 150 caracteres";
      nombreValido_Empresa = false;
    } else if (!patron.test(nombre_empresa)) {
      mensajeErrorNombre_Empresa = "Error el nombre no tiene el patrón correcto";
      nombreValido_Empresa = false;
    }

    setState((prevState) => ({
      ...prevState,
      validar: { ...prevState.validar, nombreValido_Empresa },
      mensajeError: { ...prevState.mensajeError, mensajeErrorNombre_Empresa },
    }));

    verificarValidaciones_Empresa();
    }
    
    //Correo
    if(boton==="correo_reg form-control mb-2"){
      const patron = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|msn|yahoo)\.[a-z]{2,3}$/;
      const { correo_empresa } = state.valores;
  
      let mensajeErrorCorreo_Empresa = "";
      let correoValido_Empresa = true;
  
      if (correo_empresa.trim() === "") {
        mensajeErrorCorreo_Empresa = "Error el correo está vacío";
        correoValido_Empresa = false;      
      } else if (!patron.test(correo_empresa)) {
        mensajeErrorCorreo_Empresa = "Error el correo no cumple con el patrón, ej: mio@hotmail.es";
        correoValido_Empresa = false;
      }
  
      setState((prevState) => ({
        ...prevState,
        validar: { ...prevState.validar, correoValido_Empresa },
        mensajeError: { ...prevState.mensajeError, mensajeErrorCorreo_Empresa },
      }));
  
      verificarValidaciones_Empresa();
    }

    //Contraseña
    if(boton === "contra_reg form-control mb-2"){
      const patron = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      const { contraseña_empresa } = state.valores;
  
      let mensajeErrorContraseña_Empresa = "";
      let contraseñaValido_Empresa = true;
  
      if (contraseña_empresa.trim() === "") {
        mensajeErrorContraseña_Empresa = "Error la contraseña está vacía";
        contraseñaValido_Empresa= false;
      } else if (contraseña_empresa.length < 8) {
        mensajeErrorContraseña_Empresa = "Error la contraseña es inferior a 8 caracteres";
        contraseñaValido_Empresa = false;
      } else if (!patron.test(contraseña_empresa)) {
        mensajeErrorContraseña_Empresa = "Error la contraseña no tiene el patrón correcto";
        contraseñaValido_Empresa = false;
      }
  
      setState((prevState) => ({
        ...prevState,
        validar: { ...prevState.validar, contraseñaValido_Empresa },
        mensajeError: { ...prevState.mensajeError, mensajeErrorContraseña_Empresa },
      }));
  
      verificarValidaciones_Empresa();
    }
  }

 //BOTON ENVIAR PERSONAL
  const verificarValidaciones = () => {      
    if (state.validar.nombreValido && state.validar.apellidosValidos && state.validar.correoValido && state.validar.contraseñaValida) {
            setState((prevState) => ({
      ...prevState,isButtonEnabled:false
      }));
    } else {
       setState((prevState) => ({
      ...prevState,isButtonEnabled:true
      }));
    }
  };
  
  //BOTON ENVIAR EMPRESA
  const verificarValidaciones_Empresa = () => {      
    if (state.validar.nombreValido_Empresa  && state.validar.correoValido_Empresa && state.validar.contraseñaValido_Empresa) {
            setState((prevState) => ({
      ...prevState,isButtonEnabled:false
      }));
    } else {
       setState((prevState) => ({
      ...prevState,isButtonEnabled:true
      }));
    }
  };

  //useEffect PARA GUARDAR DE UNA API TODOS LOS PAISES
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((response) => response.json()) //PASAR A JSON LA INFORMACION DE LA API
      .then((articulos) => {setState((prevState) => ({...prevState,ciudades: articulos}));}) //ESE JSON GUARDARLO EN EL ARRAY DE CIUDADES
      .catch((error) => console.error("Error " + error)); //CONTROLAR ERROR
  }, []);
  


  return (

    
    <div className="container mt-1">
      <header className="registro-header mb-4">
        <img src={logo} className="logo m-2" alt="logo" />
        <p className="m-3">
          ¿Ya tienes una cuenta?{" "}
          {links.map((x) => (
            <Link to={x.href}>{x.name}</Link>
          ))}
        </p>
      </header>

      <div className="row registro-body">
        <div className="imagen_personal col-md-6">
          <img
            src={state.activeButton === false ? personal : empresa}
            className="img-fluid rounded"
            alt={state.activeButton === false ? "personal" : "empresa"}
            width="570"
          />
        </div>

        <div className="col-md-6">
          <div className="p-4">
            <h2 className="text-center mb-4">Crear una cuenta</h2>

            <div className="boton_eleccion_reg mb-3">
              <button
                className={`btn-personal btn btn-light ${state.activeButton === false ? "active" : ""}`}
                onClick={() => cambiar(false)}
              >
                Cuenta personal
              </button>
              <button
                className={`btn-negocio btn btn-light ${state.activeButton === true ? "active" : ""}`}
                onClick={() => cambiar(true)}
              >
                Cuenta de negocio
              </button>
            </div>


          {
             /*FORMULARIO PERSONAL*/
            ! state.activeButton ? (
              <>
              <RegistroCliente 
              state={state} 
              setState={setState} 
              validaciones={validaciones} 
              datos={datos} 
              /> 
              </>
              )
              /*FORMULARIO EMPRESA*/ 
              : (
              <>
              <RegistroEmpresa
              state={state} 
              setState={setState} 
              validaciones_empresa={validaciones_empresa} 
              datos_empresa={datos_empresa} 
              />
              </>
              )                      
          }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro;

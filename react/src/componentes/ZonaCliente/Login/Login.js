import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../../../imagenes/logo_ebay.png";
import "bootstrap/dist/css/bootstrap.min.css";
import './Login.css';
import restService from '../../../servicios/restServiceCliente';
import LoginValido from "./LoginValido";
import LoginNoValido from "./LoginNoValido";
import useGlobalStore from "../../../hooks_personalizados/storeGlobal";

function Login() {

  //----------------variables globales---------------------
  const accesToken = useGlobalStore(state => state.accesToken); //esto devolverá el accestoken
  const setAccessToken = useGlobalStore(state => state.setAccessToken); //metodo para modificar accestoken
  const setRefreshToken = useGlobalStore(state => state.setRefreshToken); //metodo para modificar refreshtoken
  const setCliente = useGlobalStore(state => state.setCliente); //metodo para modificar cuentacliente

  //-----------------variables locales----------------------
  const [emailUser, setEmailUser] = useState('');
  const [passUser, setPassUser] = useState('');
  const [emailValido, setEmailValido] = useState(false);

  // Lee los datos del localStorage si están disponibles
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setAccessToken(userData.accessToken);
      setRefreshToken(userData.refreshToken);
      setCliente(userData.cliente);
    }
  }, [setAccessToken, setRefreshToken, setCliente]);

  // MANDAR CORREO
  async function handletClickButtons(ev) {
    let nombreBoton = ev.target.name;
    console.log(nombreBoton);

    switch (nombreBoton) {
      case 'Continuar':
        try {
          let respuestaServer = await restService.ComprobarEmail(emailUser);
          let bodyRespuesta = await respuestaServer.json();
          console.log(bodyRespuesta);

          if (bodyRespuesta.codigo === 0) {
            setEmailValido(true);
          } else {
            setEmailValido(false);
          }
        } catch (error) {
          console.log("ERROR EN RESPUESTA SERVICIO DE NODE JS CORREO: ", error);
        }
        break;

      case 'Google':
      case 'Facebook':
      default:
        break;
    }
  };

  // MANDAR CONTRASEÑA
  async function handletClickButtonsPass(ev) {
    let nombreBoton = ev.target.name;
    console.log(nombreBoton);

    try {
      let respuestaServer = await restService.ComprobarPassword(passUser, emailUser);
      let bodyRespuesta = await respuestaServer.json();
      console.log(bodyRespuesta);

      const userData = {
        accessToken: bodyRespuesta.datos.accessToken,
        refreshToken: bodyRespuesta.datos.refreshToken,
        cliente: bodyRespuesta.datos.cliente.resultado
      };

      // Guardar la información en el localStorage
      localStorage.setItem('usuario', JSON.stringify(userData.cliente));

      // Actualizar el store global
      setAccessToken(bodyRespuesta.datos.accessToken);
      setRefreshToken(bodyRespuesta.datos.refreshToken);
      setCliente(bodyRespuesta.datos.cliente.resultado);

      // Verificar el token y manejar la renovación si es necesario
      try {
        let respuestaServer2 = await restService.verificarToken(bodyRespuesta.datos.accessToken);
        let bodyRespuesta2 = await respuestaServer2.json();
        console.log(bodyRespuesta2);

        if (bodyRespuesta2.codigo === 2) {
          let respuestaServer3 = await restService.crearAccestoken(bodyRespuesta.datos.refreshToken);
          let bodyRespuesta3 = await respuestaServer3.json();
          console.log(bodyRespuesta3);

          setAccessToken(bodyRespuesta3.datos.accessToken);
          setRefreshToken(bodyRespuesta3.datos.refreshToken);
        }
      } catch (error) {
        console.log("ERROR EN RESPUESTA de verificiar o crear nuevo tk", error);
      }

    } catch (error) {
      console.log("ERROR EN RESPUESTA SERVICIO DE NODE JS CONTRASEÑA: ", error);
    }
  }

  return (
    <>
      <Link to="/">
        <img src={logo} className="logo_ebay position-absolute top-0 start-0 m-3" alt="eBay logo" />
      </Link>

      {!emailValido ? (
        <LoginNoValido emailUser={emailUser} setEmailUser={setEmailUser} handletClickButtons={handletClickButtons} />
      ) : (
        <LoginValido emailUser={emailUser} setPassUser={setPassUser} handletClickButtonsPass={handletClickButtonsPass} />
      )}

    </>
  );
}

export default Login;

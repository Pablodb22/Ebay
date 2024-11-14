// DOS FORMAS DE PROGRAMAR SERVICIO PARA HACER PETICIONES AJAX AL BACKEND
    // FORMA 1º MEDIANTE  FUNCIONES INDIVIDUALES QUE EXPORTAS UNA POR PETICION QUE QUIERAS HACER
    // SON FUNCIONES GLOBALES
/*
export function RegistrarCliente(datoscuenta){
    //CODIGO AJAX PARA MANDAR LOS DATOS DE LA CUENTA AL SERVIDOR DE NODE JS
}

export function LoginCliente(email,password){
    //CODIGO AJAX PARA HACER LOGIN DEL CLIENTE AL SERVIDOR DE NODE JS
}
*/

    // FORMA 2º  CREAR UN OBJETO JAVASCRIPT CON METODOS DENTRO DEL OBJETO PARA HACER CADA PETICION AJAX
    //           Y EXPORTAS TODO EL OBJETO

/* 1º FORMA ANTIGUA
let restService={
    generarEventos:new EventTarget(), // PERMITE AL OBJETO  restService DISPARAR/ESCUCHAR EVENTOS
    RegistrarCliente:function(datoscuenta){ //EN DATOSCUENTA VA EL OBJ JSON QUE MANDA COMPONENTE REGISTRO.JS: {nombre:...,apellidos:...,......} 
    //CODIGO AJAX PARA MANDAR AL SERVER LOS DATOS DE LA CUENTA A REGISTRAR      
    
    let _petAjax=new XMLHttpRequest(); //FUNCIONA DE FORMA ASINCRONA
    _petAjax.open("POST",'http://localhost:3001/api/zonaCliente/Registro'); //ABRE CONEXION CON EL SERVIDOR CON EL METODO POST
    _petAjax.setRequestHeader('Content-Type','application/json'); //ESPECIFICA EL TIPO DE CONTENIDO
    _petAjax.addEventListener('readystatechange',(ev)=>{ //MANEJAR EL EVENTO READYSTATECHANGE (CAMBIA ESTADO DE LA SOLICITUD)
        if(_petAjax.readyState===4){ //SI LA SOLICITUD HA FINALIZADO Y LA RESPUESTA ESTA DISPONIBLE (4)
            if(_petAjax.status===200){ //SI EL ESTADO DE LA SOLICITUD ES 200
                let _respuestaServer=JSON.parse(_petAjax.responseText); //CONVIERTE LA RESPUESTA DEL SERVIDOR QUE ES UN JSON EN UN OBJETO DE JAVASCRIPT               
                this.generarEventos.dispatchEvent(new CustomEvent('peticionCompletadaRegistro',{
                    detail: _respuestaServer
                }))
            }
            
        }
    });
    _petAjax.send(JSON.stringify(datoscuenta)); //ENVIA AL SERVIDOR LOS DATOS JSON SERIALIZADOS A STRING
    },

    addCallBackEvent:function(nombreEvento,callback){ //ESTE METODO DEL OBJETO, PERMITE AÑADIR HANDLERS O FUNCIONES CALLBACK ANTE EVENTOS PERSONALIZADOS 
        //ANTES DE AÑADIR LA FUNCION CALLBACK PARA TRATE EL EVENTO, HABRIA QUE COMPROBAR SI ESTA AÑADIDA DE ANTES 
        //PARA HACERLO, TE PUEDES CREAR UN OBJETO MAP DONDE IDENTIFICAR CADA FUNCION QUE AÑADES A CADA EVENTO,
        this.generarEventos.addEventListener(nombreEvento,callback);


    },

    LoginCliente:function(email,password){
    //CODIGO AJAX PARA HACER LOGIN DATOS DE LA CUENTA

    }
}    


export default restService;
*/

//2º FORMA PROMESAS
/*let restService = {
  RegistrarCliente: function(datoscuenta) {
    let _opAsincronaServer = new Promise((resolve, reject) => {
      let _petAjax = new XMLHttpRequest(); // Crea la solicitud asíncrona
      _petAjax.open("POST", 'http://localhost:3001/api/zonaCliente/Registro'); // Abre la conexión con el servidor
      _petAjax.setRequestHeader('Content-Type', 'application/json'); // Define el tipo de contenido como JSON
      _petAjax.send(JSON.stringify(datoscuenta));  // Envía los datos serializados a JSON al servidor
      _petAjax.addEventListener('readystatechange', (ev) => { // Escucha el cambio de estado de la _petajax
        if (_petAjax.readyState === 4) {                 
          if (_petAjax.status === 200) {
            let _respuestaServer = JSON.parse(_petAjax.responseText); // Convierte la respuesta en JSON
            if (_respuestaServer.codigo === 0) {
              resolve(_respuestaServer);
            } else {
              reject(_respuestaServer); 
            }
          } 
        }
      });

     
     
    });

    return _opAsincronaServer; // Retorna la promesa
  }
};*/

// 3º FORMA ASYNC AWAIT
/*let restService = {
  RegistrarCliente: async function(datoscuenta) {
    let _opAsincronaServer = new Promise((resolve, reject) => {
      let _petAjax = new XMLHttpRequest(); // Crea la solicitud asíncrona
      _petAjax.open("POST", 'http://localhost:3001/api/zonaCliente/Registro'); // Abre la conexión con el servidor
      _petAjax.setRequestHeader('Content-Type', 'application/json'); // Define el tipo de contenido como JSON
      _petAjax.send(JSON.stringify(datoscuenta));  // Envía los datos serializados a JSON al servidor
      _petAjax.addEventListener('readystatechange', (ev) => { // Escucha el cambio de estado de la _petajax
        if (_petAjax.readyState === 4) {                 
          if (_petAjax.status === 200) {
            let _respuestaServer = JSON.parse(_petAjax.responseText); // Convierte la respuesta en JSON
            if (_respuestaServer.codigo === 0) {
              resolve(_respuestaServer);
            } else {
              reject(_respuestaServer); 
            }
          } 
        }
      });

     
     
    });

    return _opAsincronaServer; // Retorna la promesa
  }
};*/


//4º FORMA FETCH con async y await
let restServiceCliente = {
  RegistrarCliente: async function (datoscuenta) {
    try {
      //CONECTANDO CON EL SERVIDOR
      const response = await fetch('http://localhost:3001/api/zonaCliente/Registro', { //FETCH ENVIA AUTOMATICAMENTE LA INFORMACION AL SERVIDOR Y LA RESPUESTA DEL SERVER LA TENDRA response
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datoscuenta) //INFORMACIO QUE SE ENVIA AL SERVIDOR CONVIERTE EN CADENA JSON
      });

      const respuestaServer = await response.json(); //CONVIERTE LA RESPUESTA DEL SERVIDOR A JSON
    
      if (respuestaServer.codigo === 0) { //VERIFICA SI LA RESPUESTA DEL SERVER ESTA CORRECTA
        return respuestaServer;
      } else {
        throw respuestaServer; 
      }
    } catch (error) {
      throw error;
    }
  },

  ComprobarEmail: function(email) {
    return fetch('http://localhost:3001/api/zonaCliente/ComprobarEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Asegúrate de establecer el tipo de contenido
        },
        body: JSON.stringify({ email }) // Usa JSON.stringify con mayúsculas
    });
},
ComprobarPassword: function(passUser, emailUser) {
  return fetch('http://localhost:3001/api/zonaCliente/ComprobarEmailyPassword', {  // Sigue usando la misma ruta
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: emailUser, password: passUser }) // Ahora envía ambos campos
  });
},
verificarToken: async function(accesToken) {
  try {
  
    let _resp = await fetch('http://localhost:3001/api/zonaCliente/VerificarToken', {
      method: 'GET',
      headers: {
       "Authorization":`Bearer ${accesToken}`
      }
    });
    return _resp;
  } catch (error) {
    console.log('error al verificar token...', error.message);
    return null;                        
  }
},

crearAccestoken:async function (refreshToken) {
  try {

    let _resp = await fetch('http://localhost:3001/api/zonaCliente/CrearNuevoToken', {
      method: 'GET',
      headers: {
        'X-RefreshToken':`${refreshToken}`,
      }
    });
    return _resp;
  } catch (error) {
    console.log('error al crear nuevo token...', error.message);
    return null;                        
  }
},


};

export default restServiceCliente;


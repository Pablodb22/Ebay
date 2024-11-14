const gmailSender = require("../../servicios/mailSenders/gmailSender");
const jsonwebtoken = require("jsonwebtoken"); // <-- paquete para crear/verificar/decodificar JWT
const jwt = require("../../servicios/generadorJWT"); 
//CLIENTE DE ACCESO A MONGODB....
const { MongoClient, BSON } = require("mongodb");
const clienteMongoDB = new MongoClient(process.env.URL_MONGODB);
const { ObjectId } = require('mongodb'); // Importa ObjectId
const bcrypt = require("bcrypt"); 


module.exports={

    Registro:async function (req, res) {
        try {
          console.log("Datos recibidos: ", req.body);
          await clienteMongoDB.connect(); // -> conectar la base de datos
          let existeTransaccion = clienteMongoDB.startSession(); // -> empieza la sesion (necesario cuando se necesita transacciones)
      
          try {
            await existeTransaccion.withTransaction(
              // ->sesion con transaccion
              async () => {
      
                let buscarEmail = await clienteMongoDB
                  .db(process.env.DB_MONGODB)
                  .collection("cuentas")
                  .findOne({ email: req.body.email });
      
                if (buscarEmail) {
                  res
                    .status(200)
                    .send({ codigo: 1, mensaje: "ESTE CORREO YA ESTA REGISTRADO" });
                } else {
                  //insertas en cuentas formulario registro
                  let resultadoInsertCuentas = await clienteMongoDB
                    .db(process.env.DB_MONGODB)
                    .collection("cuentas")
                    .insertOne({
                      ...req.body,
                      password: bcrypt.hashSync(req.body.password, 10), // para hashear la password
                      activada: false,
                    });
      
                  console.log("El valor del insert es: ", resultadoInsertCuentas);
                  
                  if (resultadoInsertCuentas.insertedId) {
                    // REALIZAR INSERT EN COLECCION "CLIENTES" DEL OBJETO NUEVO CON PROP INCLUYENDO EL ID DE LA CUENTA INSERTADA
                    // USAR TRANSACCIONES PARA EVITAR INCONSISTENCIA
      
                    //insertas en clientes datos importantes de la sesion del cliente y su id unico
                    let _resInsertClientes = await clienteMongoDB
                      .db(process.env.DB_MONGODB)
                      .collection("clientes")
                      .insertOne({
                        listadoProductosVender: [],
                        listadoProductosComprados: [],
                        listaPujas: [],
                        listadoSubastas: [],
                        direcciones: [],
                        metodosPago: [],
                        idCuenta: resultadoInsertCuentas.insertedId,
                      });
      
                    //mandar email de activacion de cuenta o sms con codigo de activacion
                    //lo suyo seria mandar el logo de ebay en el cuerpo del email en atributo src  codificado en base64
                    //creamos n JWT de un solo USO (tiempo de expiracion muy muy corto)
                    let _jwt = jsonwebtoken.sign(
                      { email: req.body.email, _id: _resInsertClientes.insertedId }, //payload
                      process.env.JWT_SECRETKEY, //firma secreta
                      { expiresIn: "5m", issuer: "http://localhost:3001" } //opciones
                    );
      
                    let _url = `http://localhost:3001/api/zonaCliente/ActivarCuenta?token=${_jwt}`; //ponemos en la url el token
      
                    await gmailSender.EnviarEmail(
                      //enviamos el email
                      {
                        to: req.body.email,
                        subject: "activa tu cuenta de EBAY!!",
                        cuerpoMensaje: `
                                      <div><img src='' alt='logo ebay'/></div>
                                      <div>
                                      <p>Activa tu cuenta de ebay si quieres empezar a COMPRAR o VENDER productos</p>
                                      <p>Tambien puedes hacer seguimiento de los productos que te interesan (se te mandara correo de su evolucion)</p>                      
                                      </div>
                                      <div>
                                      <p>Pulsa <a href='${_url}'>Aqui</a> para activar la cuenta, o copia y pega la siguiente direccion en el navegador: </p>
                                      <p>${_url}</p>
                                      </div>
                                      `,
                      }
                    );
      
      
                    res.status(200).send({
                      codigo: 0,
                      mensaje:
                        "HAS ALCANZADO BIEN EL ENDPOINT COMPROBAR EMAIL CLIENTE",
                    });
      
                    //SI NO SE HA ECHO EL INSERT DE CUENTAS
                  } else {
                    throw new Error(
                      "Error en insert de datos en coleccion cuentas de MONGODB"
                    );
                  }
                }
              }
            );
            //ERROR EN LA TRANSACCION
          } catch (error) {
            console.log(
              "Error en la transaccion de mongodb al insertar cuenta y clientes",
              error
            );
            throw new Error(error.message);
          } finally {
            existeTransaccion.endSession(); //acabar sesion
          }
          //ERROR AL CONECTARSE AL SERVIDOR
        } catch (error) {
          console.log("Error en el registro de cuenta: ", error);
          res.status(200).send({ codigo: 1, mensaje: "Fallo en el registro" });
        } finally {
          await clienteMongoDB.close(); // cierre conexion
        }
      },

    ActivarCuenta:async function (req, res) { //NECESITO VERIFICAR QUE TOKEN QUE LE PASO Y EL TOKEN QUE ME ENVIA ES EL MISMO TOKEN PARA VERIFICAR CUENTA
        const token = req.query.token; 
      
        try {
          // Verificar el token JWT
          const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRETKEY);
      
          // Si el token es válido, conectamos a la base de datos y activamos la cuenta
          await clienteMongoDB.connect();
      
          // Actualizamos el campo "activada" a true en la colección "cuentas"
          const resultadoActivacion = await clienteMongoDB
            .db(process.env.DB_MONGODB)
            .collection("cuentas")
            .updateOne(
              { email: decoded.email }, // Buscar por el ID de la cuenta
              { $set: { activada: true } } // Actualizar a activada
            );
            
          // Si se actualizó correctamente
          if (resultadoActivacion.modifiedCount > 0) {
            res.status(200).send({ mensaje: "¡Cuenta activada con éxito!" });
            //GENERAR TOKENS Y ENVIARLOS
      
          } else {
            res
              .status(400)
              .send({ mensaje: "No se encontró la cuenta o ya estaba activada." });
          }
        } catch (error) {
          console.error("Error en la activación de cuenta:", error);
          res
            .status(400)
            .send({ mensaje: "Enlace de activación inválido o expirado." });
        } finally {
          await clienteMongoDB.close(); // Cerrar conexión con la base de datos
        }
      },
    
    ComprobarEmail:async function (req, res) {
        try {
          await clienteMongoDB.connect();
      
          // VERIFICAR SI EL CORREO EXISTE
          const resultadoCorreo = await clienteMongoDB.db(process.env.DB_MONGODB)
                                                      .collection("cuentas")
                                                      .findOne({ email: req.body.email });
      
          if (resultadoCorreo) {
            if (resultadoCorreo.activada == true) {
              // CORREO ENCONTRADO Y ACTIVADO
              res.status(200).send({ codigo: 0, mensaje: "CORREO ENCONTRADO" });
            } else {
              // CORREO NO ACTIVADO
              res.status(200).send({ codigo: 1, mensaje: "TIENES QUE ACTIVAR TU CUENTA PRIMERO, MIRA TU CORREO Y VERIFICA" });
            }
          } else {
            // CORREO NO ENCONTRADO
            res.status(200).send({ codigo: 1, mensaje: "CORREO NO ENCONTRADO EN LA BASE DE DATOS" });
          }
      
        } catch (error) {
          console.error("Error en la verificación del correo:", error);
          res.status(200).send({ codigo: 1, mensaje: "ERROR EN EL SERVIDOR" });
        }
      },


    ComprobarEmailyPassword:async function (req, res) {
        try {
          await clienteMongoDB.connect();
      
          // VERIFICAR SI EL CORREO EXISTE
          const resultadoCorreo = await clienteMongoDB.db(process.env.DB_MONGODB)
                                                      .collection("cuentas")
                                                      .findOne({ email: req.body.email });
      
          if (resultadoCorreo) {
            if (resultadoCorreo.activada == true) {
              // CORREO ENCONTRADO, AHORA VERIFICAR LA CONTRASEÑA
              if (req.body.password) {
                // Comparar la contraseña proporcionada con el hash almacenado
                const contraseñaValida = await bcrypt.compare(req.body.password, resultadoCorreo.password);
      
                if (contraseñaValida) {
                  // CONTRASEÑA CORRECTA, GENERAR TOKENS          
                  const payload = { email: resultadoCorreo.email, id: resultadoCorreo._id };
                  const expiracion = '1h'; // Ajusta la expiración según tus necesidades
                  const [accessToken, refreshToken] = jwt.generarJWT(payload, expiracion);
                  
                  // Enviar respuesta exitosa con los tokens
                  res.status(200).send({ 
                    codigo: 0, 
                    mensaje: "CORREO Y CONTRASEÑA CORRECTOS",
                    datos:{accessToken, 
                           refreshToken,
                           cliente: { 
                            resultado: {
                              email: resultadoCorreo.email,
                              nombre: resultadoCorreo.nombre || '',
                              apellidos: resultadoCorreo.apellidos || '',
                              activada: resultadoCorreo.activada || false,
                              imagenAvatar: resultadoCorreo.imagenAvatar || '',
                              nick: resultadoCorreo.nick || ''
                                        }
                                     }
                          }     
                    
                    
                  });
                } else {
                  // CONTRASEÑA INCORRECTA
                  res.status(200).send({ codigo: 1, mensaje: "CONTRASEÑA INCORRECTA" });
                }
              } else {
                res.status(200).send({ codigo: 1, mensaje: "CONTRASEÑA NO PROPORCIONADA" });
              }
            } else {
              res.status(200).send({ codigo: 1, mensaje: "TIENES QUE ACTIVAR TU CUENTA PRIMERO, MIRA TU CORREO Y VERIFICA" });
            }
          } else {
            res.status(200).send({ codigo: 1, mensaje: "CORREO NO ENCONTRADO EN LA BASE DE DATOS" });
          }
      
        } catch (error) {
          console.error("Error en la verificación de correo y contraseña:", error);
          res.status(200).send({ codigo: 1, mensaje: "ERROR EN EL SERVIDOR" });
        }
      },


    VerificarToken:async function (req,res,next){
        try{
          const at=req.headers["authorization"]?.split(" ")[1];
          const decodifica=jsonwebtoken.decode(at);
          const ahora=Math.floor(Date.now()/1000);
        
          //SI EL ACCESTOKEN HA CADUCADO MANDAR ERROR CODIGO 2
          if(decodifica.exp<ahora){
            return res.status(200).send( { codigo:2, mensaje:'token caducado'} ); 
          }
        
          //SI EL ACCESTOKEN NO ESTA CADUCADO
         jsonwebtoken.verify(at, process.env.JWT_SECRETKEY,(error,decode)=>{
          if(error){
            console.log('ERROR VERIFICAR ACCESS TOKEN',error.message)
            return res.status(200).send( { codigo:1, mensaje:'error al verificar accesstoken'} ); 
          }else{
            console.log('VERIFICADO TOKEN CORRECTO ',decode)
            return res.status(200).send( { codigo:0, mensaje:'verificado correcto'} ); 
          }
         })
           
        }catch(error){
          console.log('error al intentar verificar token.....', error.message);
          res.status(200).send( { codigo:7, mensaje:'error al verificar token'} );            
        }
       },


    CrearNuevoToken: async function (req, res, next) {
        try {
           
            const rt = req.headers["X-RefreshToken"]?.split(" ")[1];
                          
            const decoded = jsonwebtoken.decode(rt);
    
          
            if (decoded && decoded.exp && Date.now() >= decoded.exp * 1000) {               
                return res.status(200).send({ codigo: 3, mensaje: 'Refresh token expirado, por favor vuelva a autenticarse' });
            }
    
          
            jsonwebtoken.verify(rt, process.env.JWT_SECRETKEY, (error) => {
                if (error) {
                    console.log('Error al verificar refresh token:', error.message);
                    return res.status(403).send({ codigo: 1, mensaje: 'Error al verificar el refresh token' });
                } else {
                    // Generación de nuevo accessToken y refreshToken
                    const [accessToken, newRefreshToken] = jwt.generarJWT(decoded, "1h"); 
                    return res.status(200).send({ 
                        codigo: 0, 
                        mensaje: 'Refresh token verificado correctamente y nuevo token creado',
                        datos: { accessToken, refreshToken: newRefreshToken }
                    });
                }
            });
        } catch (error) {
            console.log('Error al crear un nuevo token:', error.message);
            res.status(500).send({ codigo: 7, mensaje: 'Error al crear el nuevo token' });
        }
       },
       
}
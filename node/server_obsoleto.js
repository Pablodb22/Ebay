//modulo principal de nuestro proyecto back node js
require("dotenv").config(); // lee el ficero .env y crea variables de entorno delicadas o secretas (no visibles)
const express = require("express");
const cors = require("cors"); //añandimos modulos cors para poder usar diferentes puertos y que se enlacen
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt"); // paquete muy usado para hashear contraseñas y comprobar hashes
const nodeMailer = require("nodemailer"); //instalar en clase
//OBJETCO PARA MANDAR EMAIL
const gmailSender = require("./servicios/mailSenders/gmailSender");
const jsonwebtoken = require("jsonwebtoken"); // <-- paquete para crear/verificar/decodificar JWT
const jwt = require("./servicios/generadorJWT"); 
//CLIENTE DE ACCESO A MONGODB....
const { MongoClient, BSON } = require("mongodb");
const clienteMongoDB = new MongoClient(process.env.URL_MONGODB);
const { ObjectId } = require('mongodb'); // Importa ObjectId

const miServidorWeb = express();

miServidorWeb.use(cors()); //añadimos al servidor
miServidorWeb.use(cookieParser()); //añadimos al servidor
miServidorWeb.use(bodyParser.json()); //añadimor al servidor
miServidorWeb.use(bodyParser.urlencoded({ extended: false }));

//{***REGISTRAR CUENTA Y MANDAR CORREO DE VERIFICACION***}//
miServidorWeb.post("/api/ZonaCliente/Registro", async function (req, res) {
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
});

//{***VERIFICAR LA CUENTA***}//
miServidorWeb.get("/api/zonaCliente/ActivarCuenta", async function (req, res) { //NECESITO VERIFICAR QUE TOKEN QUE LE PASO Y EL TOKEN QUE ME ENVIA ES EL MISMO TOKEN PARA VERIFICAR CUENTA
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
});

//{*****VERIFICAR CORREO Y CONTRASEÑA DEL LOGIN**********}//
miServidorWeb.post("/api/ZonaCliente/ComprobarEmail", async function (req, res) {
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
});

miServidorWeb.post("/api/ZonaCliente/ComprobarEmailyPassword", async function (req, res) {
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
});


miServidorWeb.get('/api/zonaTienda/DevolverCategorias', async function(req,res,next){
  try {
      //recuperamos categorias en funcion del parametro en la query: pathCategoria...si vale principales creo un filtro para recup.cat.ppales
      //                                                                            si vale cualquier otra cosa creo un filtro para recup.subcats
      let _filtro=req.query.pathCategoria==='principales' ? { pathCategoria: { $regex: /^[0-9]+$/ } } 
                                                             : 
                                                             { pathCategoria: { $regex: new RegExp("^" + req.query.pathCategoria+"-[0-9]+$") } };
      await clienteMongoDB.connect();
      //OJO!!!! .find() devuelve un CURSOR DE DOCUMENTOS!!!! objeto FindCursor, para obtener el contenido de ese cursos o bien con bucle para ir uno a uno
      //o con metodo .toArray() para recuperar todos los doc.del cursor de golpe
      //https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/cursor/
      let _catsCursor=await clienteMongoDB.db(process.env.DB_MONGODB)
                                      .collection('categorias')
                                      .find( _filtro );
      
      let _cats=await _catsCursor.toArray();

      //console.log('categorias recuperadas....', _cats);
      res.status(200).send( { codigo:0, mensaje:'categorias recuperadas OK!!!', datos:_cats } );


  } catch (error) {
      console.log('error al intentar recuperar categorias.....', error.message);
      res.status(200).send( { codigo:5, mensaje:`error al intentar recuperar categorias: ${error.message}`, datos:[] } );
  }
});

miServidorWeb.get('/api/zonaTienda/RecuperarProductosFromCat', async function(req,res,next){
  try {
      await clienteMongoDB.connect();

      /*SACAR PRIMERO PATH DE SUBCATEGORIA*/
      let categoria = await clienteMongoDB.db(process.env.DB_MONGODB)
                                          .collection('categorias')
                                          .findOne({ _id: new ObjectId(req.query.catId) });
                                                      
      let _prodsCursor=clienteMongoDB.db(process.env.DB_MONGODB)
                                      .collection('productos')
                                      .find({categoría:categoria.pathCategoria});                                            

      let _prods=await _prodsCursor.toArray();

      console.log('numero de productos recuperados...', _prods.length);
      res.status(200).send( { codigo:0, mensaje:'productos recuperados OK!!!', datos:_prods } );

  } catch (error) {
      console.log('error al intentar recuperar productos.....', error.message);
      res.status(200).send( { codigo:6, mensaje:`error al intentar recuperar productos: ${error.message}`, datos:[] } );            
  }
} );

miServidorWeb.get('/api/zonaTienda/RecuperarProducto',async function(req,res,next){
  try {
      await clienteMongoDB.connect();
      const _idprod=new BSON.ObjectId(req.query.idProd);
      let _producto=await clienteMongoDB.db(process.env.DB_MONGODB)
                                      .collection('productos')
                                      .findOne({_id: _idprod });

      if(! _producto) throw new Error(`no existe ningun producto con este _id: ${req.query.idProd}`);
      res.status(200).send( { codigo:0, mensaje:'productos recuperados OK!!!', datos: _producto } );

  } catch (error) {
      console.log('error al intentar recuperar productos.....', error.message);
      res.status(200).send( { codigo:7, mensaje:`error al intentar recuperar producto: ${error.message}`, datos: {} } );            
  }        
});

miServidorWeb.get('/api/zonaTienda/NombreVendedor',async function (req,res,next) {
  try{
      await clienteMongoDB.connect();
      const idProd=new BSON.ObjectId(req.query.idProd);

      let _producto=await clienteMongoDB.db(process.env.DB_MONGODB)
                    .collection('productos')
                    .findOne({_id: idProd });

      let _Clientes=await clienteMongoDB.db(process.env.DB_MONGODB)
                    .collection('clientes')
                    .findOne({_id: _producto.idClienteVendedodr });

      let _Vendedor=await clienteMongoDB.db(process.env.DB_MONGODB)
                    .collection('cuentas')
                    .findOne({_id: _Clientes.idCuenta });

      res.status(200).send( { codigo:0, mensaje:'vendedor recuperado OK!!!', datos: _Vendedor } );
      

  }catch (error) {
    console.log('error al intentar recuperar nombre vendedor.....', error.message);
    res.status(200).send( { codigo:7, mensaje:`error al intentar recuperar nombre vendedor: ${error.message}`, datos: {} } );            
}        
});


miServidorWeb.get('/api/zonaCliente/VerificarToken',async function (req,res,next){
try{
  const at=req.headers["authorization"]?.split(" ")[1];
  const decodifica=jsonwebtoken.decode(at);
  const ahora=Math.floor(Date.now()/1000);

  //SI EL ACCESTOKEN HA CADUCADO MANDAR ERROR CODIGO 2
  if(decodifica.exp<now){
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
});

miServidorWeb.get('/api/zonaCliente/CrearNuevoToken',async function (req,res,next) {
  //VERIFICAR REFRESHTOKEN Y SI ESTA OKEY CREAR NUEVO TOKEN
  try {
    const rt=req.headers["authorization"]?.split(" ")[1];

    jsonwebtoken.verify(rt, process.env.JWT_SECRETKEY,(error,decode)=>{
      if(error){
        console.log('ERROR VERIFICAR REFRESH TOKEN',error.message)
        return res.status(200).send( { codigo:1, mensaje:'error al verificar refresh token'} ); 
      }else{
        console.log('VERIFICADO REFREST TOKEN CORRECTO ',decode)                
        const [accessToken, refreshToken] = jwt.generarJWT(payload, expiracion);
        return res.status(200).send( { codigo:0, mensaje:'verificado correcto Y NUEVO TOKEN CREADO',datos:{accessToken,refreshToken}}); 
      }
     })
    
  } catch (error) {
    console.log('error crear nuevo token.....', error.message);
    res.status(200).send( { codigo:7, mensaje:'error al crear nuevo token'} );            
}

});


miServidorWeb.post('/api/zonaTienda/ComprarProductos',async function (req,res,next) {
  
  try{
    /*
    en el req.body react me debe mandar: {pedido:{items,subtotal,gastosenvio,total,metodoPago},idCliente}
    */
  }catch(error){

  }
});
// Levantar el servidor web
miServidorWeb.listen(3001, () => {
  console.log("Servidor web express escuchando peticiones en puerto 3001");
});
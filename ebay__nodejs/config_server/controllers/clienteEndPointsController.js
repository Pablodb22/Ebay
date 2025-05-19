//modulo de nodejs q exporta un objeto JS con metodos q definen las funciones middleware para los endpoints de acceso
const bcrypt=require('bcrypt');
const generadorJWT=require('../../servicios/generadorJWT');
const gmailSender=require('../../servicios/mailSenders/gmailSender')
const geoApi=require('../../servicios/geoApiService')

//cliente de acceso a MongoDB.....
const { MongoClient,BSON }=require('mongodb');
const geoApiController = require('../../../geoApi_nodejs_microservice/config_server/controllers/geoApiController');
console.log('variables de entorno....', process.env.URL_MONGODB, process.env.DB_MONGODB);
const clienteMongoDB=new MongoClient(process.env.URL_MONGODB);

module.exports={
    LoginCliente: async function(req,res,next){
        try {
            console.log('el cliente de react ha hecho esta solicitud http-request....', req.body); //<--- si no hay mas middlewares previos, req.body es undefined
            const { email, password }=req.body;
    
            //1º paso) comprobar si en mongodb existe en coleccion "cuentas" un doc. con ese email y password
            await clienteMongoDB.connect();
            let _datosCuenta=await clienteMongoDB.db(process.env.DB_MONGODB)
                                                  .collection('cuentas')
                                                  .findOne( { email });
            console.log('datos recuperados de coleccion cuentas...', _datosCuenta);
            if(! _datosCuenta) throw new Error('no existe esa cuenta con ese Email');
    
            //2º paso) comprobamos si cuenta esta activada (confirmada)
            if( ! _datosCuenta.activada ) throw new Error('cuenta no ACTIVADA...mandar de nuevo enlace invitacion para activarla');
    
            //3º paso) comprobar si password esta ok....
            if (! bcrypt.compareSync(password, _datosCuenta.password) ) throw new Error('password invalida....');
    
    
            //4º paso) si existe generar JWT de acceso:  accessJWT en payload metemos _id del cliente y email/tlfno
            let _jwts=generadorJWT.generarJWT(
                {
                    idCliente: _datosCuenta._id,
                    email: _datosCuenta.email,
                    telefono: _datosCuenta.telefono,
                    nombreCompleto: _datosCuenta.apellidos + ', ' + _datosCuenta.nombre 
                 },
                '15m'
            );
           
            //5º paso) recuperar de la coleccion "clientes" los datos del mismo (lista productos a vender, lista productos comprados, lista direcciones, metodos de pago,...)
            let _datosClienteCursor=await clienteMongoDB.db(process.env.DB_MONGODB)
                                                  .collection('clientes')
                                                  //.findOne( { idCuenta: _datosCuenta._id }); <---- asi seria sin expandir idCuenta y tendria el ObjectId del documento cuenta asoicado
                                                  .aggregate(
                                                    [
    
                                                        {
                                                          $lookup: {
                                                            from: "cuentas",
                                                            localField: "idCuenta",
                                                            foreignField: "_id",
                                                            as: "cuenta"
                                                          }
                                                        },
                                                        {
                                                          $unwind: "$cuenta"
                                                        },
                                                        {
                                                            $match: { 
                                                              "cuenta.email": email 
                                                            }
                                                        },
                                                        
                                                        {
                                                          $project: {
                                                            _id: 1,
                                                            listaProductosVender: 1,
                                                            listaProductosComprados: 1,
                                                            listaPujas: 1,
                                                            listaSubastas: 1,
                                                            direcciones: 1,
                                                            fechaUnionEbay: 1,
                                                            listaProductosVendidos: 1,
                                                            numeroIVA: 1,
                                                            tipo: 1,
                                                            valoracionesHechas: 1,
                                                            valoracionesRecibidas: 1,
                                                            "cuenta.nombre": 1,
                                                            "cuenta.apellidos": 1,
                                                            "cuenta.email": 1,
                                                            "cuenta.telefono": 1,
                                                            "cuenta.activada": 1,
                                                            "cuenta.imagenAvatar": 1,
                                                            "cuenta.nick": 1
                                                          }
                                                        }
                                                      ]                                                        
                                                );
            let _datosClientes=await _datosClienteCursor.toArray(); //<--- un cursor siempre devuelve un array de documentos o filas, aunque solo tenga uno
    
            console.log("datos recuperados de coleccion clientes...", _datosClientes[0]);
            
            res.status(200).send( 
                        { 
                            codigo: 0,
                            mensaje: 'inicio de sesion correcto, JWT creado',
                            datos:{
                                accessToken: _jwts[0],
                                refreshToken: _jwts[1],
                                cliente: _datosClientes[0] 
                            }
                        }
            );
                
        } catch (error) {
            console.log('error en login....', error);
            res.status(200).send( {codigoOperacion: 2, mensajeOperacion: error.message } );
        }
    
    },
    Registro: async function(req,res,next){
        try {
            console.log('datos del REGISTRO del cliente de react ....', req.body);
            await clienteMongoDB.connect();
            let _sesionTransaccion=clienteMongoDB.startSession(); //<--- inicio transacion mongodb
            
            try {
                await _sesionTransaccion.withTransaction(
                    async () => {
                        let _resultadoInsert=await clienteMongoDB.db(process.env.DB_MONGODB)
                                                                .collection('cuentas')
                                                                .insertOne(
                                                                    {
                                                                        ...req.body,
                                                                        password: bcrypt.hashSync(req.body.password, 10),
                                                                        activada: false 
                                                                    }
                                                                );    
                        console.log('el valor del INSERT en coleccion cuentas vale...', _resultadoInsert);
                        if (_resultadoInsert.insertedId) {
                            //hacer insert en coleccion "clientes" de objeto nuevo con prop idCuenta el _id de la cuenta insertada
                            //USAR TRANSACCIONES!!!! para evitar inconsistencia
                            //let _idcuentaExtraido=await clienteMongoDB.db(process.env.DB_MONGODB).collection('cuentas').findOne({ email: req.body.email },{ _id:1 });
                            //console.log('_id del documento cuentas recien insertado....', _idcuentaExtraido);
                
                            let _resInsertClientes=await clienteMongoDB.db(process.env.DB_MONGODB)
                                                                       .collection('clientes')
                                                                       .insertOne(
                                                                        {
                                                                            listaProductosVender: [],
                                                                            listaProductosComprados: [],
                                                                            listaPujas: [],
                                                                            listaSubastas: [],
                                                                            direcciones: [],
                                                                            metodosPago:[],
                                                                            idCuenta: _resultadoInsert.insertedId// _idcuentaExtraido._id
                                                                        }
                                                                       );
                            //mandar email de activacion de cuenta o SMS con codigo de activacion
                            //lo suyo seria mandar el logo de ebay en el cuerpo del email en  atributo src codificado en base64...
                            //creamos un JWT de un solo USO (tiempo de expiracion muy muy corto, lo justo para q de tiempo al usuario a ACTIVAR CUENTA leyendo el mail)
                            let _jwt=jsonwebtoken.sign(
                                { email: req.body.email, _id: _resInsertClientes.insertedId },
                                process.env.JWT_SECRETKEY,
                                { expiresIn: '5m', issuer:'http://localhost:3003'}
                            );
                            let _url=`http://localhost:3003/api/zonaCliente/ActivarCuenta?token=${_jwt}`;
                            await gmailSender.EnviarEmail(
                                {
                                    to: req.body.email,
                                    subject: 'activa tu cuenta de EBAY!!!',
                                    cuerpoMensaje:`
                                        <div> <img src='' alt='logo ebay'/> </div>
                                        <div>
                                            <p>Activa tu cuenta de ebay si quieres empezar a COMPRAR o VENDER productos</p>
                                            <p>Tambien pudes hacer seguimiento de los productos que te interesan (se te mandaran correos de su evolucion)</p>
                                        </div>
                                        <div>
                                            <p>Pulsa <a href='${_url}'>AQUI</a> para activar la cuenta, o copia y pega la siguiente direccion en el navegador:</p>
                                            <p>${_url}</p>
                                        </div>
                                    `
                                }
                            )
                            res.status(200).send({ codigo:0, mensaje: 'cuenta registrada, FALTA ACTIVACION CUENTA....'});
                        } else {
                            throw new Error('error en insert de datos en coleccion cuentas de Mongodb');
                        }
                    }
                );
                    
            } catch (error) {
                console.log('error en transaccion contra mongodb al insertar cliente y cuenta...', error);
                throw new Error(error.message);
            } finally {
                _sesionTransaccion.endSession();
            }      
        } catch (error) {
            console.log('error en operacion de registro de cuenta....', error);
            res.status(200).send( { codigo: 1, mensaje: 'fallo en registro, intentalo mas tarde' })        
        } finally {
            await clienteMongoDB.close(); //<------------- cierre conexion
          }
    
    },
    ComprobarEmail: function(req,res,next){
        console.log('datos pasados en la URL del cliente de react...', req.query);
        res.status(200).send({ codigo:0, mensaje: 'HAS ALCANZADO BIEN EL ENDPOINT DEL COMPROBAR EMAIL CLLIENTE...'});
    },
    Direcciones: async function(req,res,next){
        try {
            let cliente = req.body.cliente
            let clienteDirecciones = cliente.direcciones;    
            let clienteId = new BSON.ObjectId(cliente._id);
    
            await clienteMongoDB.connect();
            let _sesionTransaccion = clienteMongoDB.startSession(); 
    
            try {
                await _sesionTransaccion.withTransaction(async () => {
                    let resultadoUpdate = await clienteMongoDB.db(process.env.DB_MONGODB)
                        .collection('cuentas')
                        .updateOne(
                            { _id: clienteId },  // filtro por ID
                            { $set: { direcciones: clienteDirecciones } }  // actualizar array de direcciones
                        );
    
                    if (resultadoUpdate.modifiedCount === 1) {
                        res.status(200).send({
                            codigo: 0,
                            mensaje: 'Direcciones actualizadas correctamente'
                        });
                    } else {
                        res.status(200).send({
                            codigo: 1,
                            mensaje: 'No se encontró la cuenta para actualizar'
                        });
                    }
                });
    
            } catch (error) {
                await _sesionTransaccion.abortTransaction();
                throw error;
            } finally {
                await _sesionTransaccion.endSession();
            }
        
        } catch (error) {
            console.log('error en operacion de modificacion de direcciones de cuenta....', error);
            res.status(200).send({ 
                codigo: 1, 
                mensaje: 'fallo en cambio de direcciones, intentalo mas tarde' 
            })  
        }
    },

    GenerarAtGeoApi:async function (req,res,next) {
        try{
            let respuesta= await geoApi.getAt();
            if (respuesta) {
                return res.status(200).send({ token: respuesta });
            } else {
                throw new Error("No se pudo generar el token");
            }
        }catch(error){
            console.log('error en generacion de at geo api....', error);
            return res.status(200).send({codigo:1,mensaje:"fallo en at de api"});
        }
    },
   
    Provincia: async function (req, res, next) {
        try {
            // Obtenemos el token de acceso de las cabeceras de la solicitud
            const at=req.headers['authorization'].split(' ')[1];//lo coge
           
            // Llamamos a la función getProvincia del cliente pasando el token
            const provincias = await geoApi.getProvincia(at);
            
            return res.status(200).send({
                provincias: provincias
            });
            
        } catch (error) {
            // Manejo de errores en caso de fallo en la solicitud o en el proceso
            console.error('Error en operación de provincia:', error);
            return res.status(200).send({
                codigo: 1,
                mensaje: 'Fallo al obtener las provincias',
                error: error.message
            });
        }
    },
    
    
    Municipio:async function (req,res,next) {
        try {
            const at = req.headers['authorization'].split(' ')[1];
            const codProv = req.query.codProv; // Obtener codProv de los parámetros
            if (!codProv) {
                return res.status(400).send({ mensaje: 'Código de provincia no proporcionado' });
            }
    
            const municipios = await geoApi.getMunicipio(at, codProv);
            return res.status(200).send({
                municipios: municipios || [],
            });
        } catch (error) {
            console.error('Error en operación de municipios:', error);
            return res.status(500).send({
                codigo: 1,
                mensaje: 'Fallo al obtener los municipios',
                error: error.message,
            });
        }
    },
    CambiarPass: async function (req, res, next) {
        try {
            const { antiguapass, nuevapass, cliente } = req.body;
            
            if (!antiguapass || !nuevapass || !cliente) {
                return res.status(400).send({ mensaje: "Datos incompletos para cambiar la contraseña" });
            }
                          
            const clienteId=new BSON.ObjectId(cliente)
            console.log('datos del cliente a modificar....', clienteId);
            await clienteMongoDB.connect();
            const _sesionTransaccion = clienteMongoDB.startSession();
    
            try {
                await _sesionTransaccion.withTransaction(async () => {
                    const db = clienteMongoDB.db(process.env.DB_MONGODB);
    
                    // Buscar la cuenta asociada al cliente
                    const cliente = await db.collection('clientes').findOne({ _id: clienteId });
                   
                    const cuentaId=new BSON.ObjectId(cliente.idCuenta)

                    const cuenta=await db.collection('cuentas').findOne({ _id: cuentaId });
                    
                    if (!cuenta) {
                        throw new Error("Cuenta no encontrada");
                    }
    
                    // Verificar si la contraseña antigua coincide
                    const coincideAntigua = bcrypt.compareSync(antiguapass, cuenta.password);
                    if (!coincideAntigua) {
                        throw new Error("La contraseña antigua no coincide");
                    }
    
                    // Hashear la nueva contraseña
                    const nuevaPasswordHash = bcrypt.hashSync(nuevapass, 10);
                    
                    // Actualizar la contraseña en la base de datos
                    const resultadoUpdate = await db.collection('cuentas').updateOne(
                        { _id: cuentaId },
                        { $set: { password: nuevaPasswordHash } }
                    );
    
                    if (resultadoUpdate.modifiedCount !== 1) {
                        throw new Error("No se pudo actualizar la contraseña");
                    }
    
                    // No es necesario manejar manualmente `commitTransaction` aquí porque withTransaction se encarga.
                });
                res.status(200).send({
                    mensaje: "Contraseña actualizada correctamente"
                });
            } catch (error) {
                console.error('Error al cambiar contraseña:', error.message);
    
                // Solo abortar la transacción si está activa
                if (_sesionTransaccion.inTransaction()) {
                    await _sesionTransaccion.abortTransaction();
                }
    
                res.status(400).send({ mensaje: error.message });
            } finally {
                _sesionTransaccion.endSession();
            }
        } catch (error) {
            console.error('Error en operación de cambiar contraseña servidor:', error);
            res.status(500).send({ mensaje: "Error interno del servidor" });
        } finally {
            await clienteMongoDB.close();
        }
    }
    
    
}
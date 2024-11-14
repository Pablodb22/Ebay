const gmailSender = require("../../servicios/mailSenders/gmailSender");
const jsonwebtoken = require("jsonwebtoken"); // <-- paquete para crear/verificar/decodificar JWT
const jwt = require("../../servicios/generadorJWT"); 
//CLIENTE DE ACCESO A MONGODB....
const { MongoClient, BSON } = require("mongodb");
const clienteMongoDB = new MongoClient(process.env.URL_MONGODB);
const { ObjectId } = require('mongodb'); // Importa ObjectId
const bcrypt = require("bcrypt"); 
const stripeService=require('../../servicios/stripeService');
const paypalService = require("../../servicios/paypalService");


module.exports={

    DevolverCategorias:async function(req,res,next){
        try {
            //recuperamos categorias en funcion del parametro en la query: pathCategoria...si vale principales creo un filtro para recup.cat.ppales
            //                                                                            si vale cualquier otra cosa creo un filtro para recup.subcats
            let _filtro = req.query.pathCategoria === 'principales' 
            ? { pathCategoria: { $regex: /^[0-9]+$/ } } 
            : { pathCategoria: { $regex: new RegExp("^" + req.query.pathCategoria + "-[0-9]+$") } };
        
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
      },


    RecuperarProductosFromCat:async function(req,res,next){
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
      },


    RecuperarProducto:async function(req,res,next){
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
      },


    NombreVendedor:async function (req,res,next) {
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
      },

    DevolverDireccion:async function(req,res,next) {
      try{
        
        await clienteMongoDB.connect();
        const email=req.query.email;
        
        let idCuenta=await clienteMongoDB.db(process.env.DB_MONGODB).collection('cuentas').findOne({email:email});
        
        const idCuentaEmail=new BSON.ObjectId(idCuenta._id);
        
        let direccion=await clienteMongoDB.db(process.env.DB_MONGODB).collection('clientes').findOne({idCuenta:idCuentaEmail});

        if(direccion.direcciones && direccion.direcciones.length>0){
          res.status(200).send( { codigo:0, mensaje:'tiene direccion', datos: direccion.direcciones } );  
        }else{
          res.status(200).send( { codigo:1, mensaje:'no tiene direccion', datos: direccion.direcciones } );  
        }

        

      }catch(error){
        console.log('error al intentar recuperar direccion.....', error.message);
        res.status(200).send( { codigo:7, mensaje:`error al intentar recuperar  direccion: ${error.message}`, datos: {} } );            
     }        
    },

    AnadirDireccion: async function (req, res, next) {
      try {
        await clienteMongoDB.connect();  
        
          const { direccion, telefono, email } = req.body;  // Desestructuramos los datos enviados desde el frontend
      

          console.log(direccion);
          console.log(telefono);
          console.log(email);
          // 1. Actualizamos el teléfono en la colección 'cuentas'
          const resultadoTelefono = await clienteMongoDB.db(process.env.DB_MONGODB).collection('cuentas').updateOne(
              { email: email },  // Buscamos el documento por email
              { $set: { telefono: telefono } }  // Establecemos el teléfono
          );
  
          // Verificamos si el teléfono fue actualizado correctamente
          if (resultadoTelefono.modifiedCount === 0) {
              console.log(`No se pudo actualizar el teléfono para el email: ${email}`);              
          } else {
              console.log(`Teléfono actualizado correctamente para el email: ${email}`);
          }
  
          // 2. Obtenemos la cuenta para obtener su _id
          let cuenta = await clienteMongoDB.db(process.env.DB_MONGODB).collection('cuentas').findOne({ email: email });

          if (!cuenta) {
              console.log('Cuenta no encontrada para el email:', email);             
          }
          const idCuentaEmail = new BSON.ObjectId(cuenta._id);  // Convertir _id a ObjectId
          console.log(`Cuenta encontrada con id: ${idCuentaEmail}`);
  
          // 3. Insertamos la dirección en el array 'direcciones' de la colección 'clientes'
          const resultadoDireccion = await clienteMongoDB.db(process.env.DB_MONGODB).collection('clientes').updateOne(
              { idCuenta: idCuentaEmail },  // Buscamos el documento por idCuenta
              { $push: { direcciones: direccion } }  // Agregamos la dirección al array 'direcciones'
          );
  
          // Verificamos si la dirección fue insertada correctamente
          if (resultadoDireccion.modifiedCount === 0) {
              console.log("Error al insertar la dirección en el array 'direcciones'");            
          } else {
              console.log("Dirección insertada correctamente en el array 'direcciones'");
          }
  
          // 4. Respuesta exitosa
          return res.status(200).send({
              codigo: 0,
              mensaje: 'Teléfono y dirección insertados con éxito',
              datos: {}
          });
  
      } catch (error) {
          console.log('Error al intentar insertar teléfono y dirección en BD...', error.message);
          res.status(500).send({
              codigo: 7,
              mensaje: `Error al intentar insertar teléfono y dirección: ${error.message}`,
              datos: {}
          });
      }
  },
  
    ComprarProductos:async function (req,res,next) {
  
        try{
          /*
          en el req.body react me debe mandar: {pedido:{items,subtotal,gastosenvio,total,metodoPago},idCliente}
          */
             
          const { pedido, cliente }=req.body;
          pedido._id=new BSON.ObjectId();

          switch (pedido.metodosPago.tipo) {
            case 'creditcard':
                        //1º paso pago con stripe, crear customer(cliente) 
                        let _idCustomer=await stripeService.CrearCustomer(
                          {
                              nombre: cliente.nombre,
                              email: cliente.email, //<----- recup. del payload del accessToken
                              telefono: cliente.telefono, //<--- recup. del payload del accessToken
                              direccionEnvio: cliente.direccion //<--- recup. del payload del accessToken (si no esta, con email o _idCliente acceder a BD y recup. direccion principal)
                          }
                      );
                      if(! _idCustomer) throw new Error('error al crear objeto CUSTOMER de STRIPE');
  
                      //2º paso pago con stripe, crear tarjeta de credito y asociarla al customer(cliente)
                      let _idCard=await stripeService.CrearCardFromCustomer(_idCustomer);
                      if(! _idCard) throw new Error('error al crear objeto CARD de STRIPE');
  
                      //3º paso pago con stripe, crear cargo debo pasar: idCustomer,idCard,cantidad,idPedido
                      let _objetoCargo=await stripeService.CrearCharge(_idCustomer, _idCard, pedido.total, pedido._id);
                      console.log('pago realizado ....objeto devuelto es:', _objetoCargo);
  
            break;
            case 'paypal':
                    //pago con paypal....
                    //11 paso crear objeto order:
                    let respOrder=await paypalService.CrearPagoPayPal(cliente._id,pedido);
                    if(!respOrder) throw new Error('fallo en servicio de paypal a la hora de generar objeto ORDER')

                    //si esta ok solo interesa id del ORDER y la url que tengo que enviar a react para que el cliente acceda a pagar
                    //tengo que almacenar en mongodb de forma persistente en coleccion paypalorders: idcliente,idpedido,idobjetoorder
                    let insertarOrder=await clienteMongoDB.db(process.env.DB_MONGODB)
                                                          .collection('paypalOrders')
                                                          .insertOne({idCliente:cliente._id,idPedido:pedido._id,idOrder:respOrder.id});

                    //lo suyo seria anularlo esto es chapuza
                    if(! insertarOrder.insertedId) throw new Error('error al insertar en mongodb en coleccion paypalOrders')

                    //tengo que seleccionar de la propiedad link del objeto ORDER creado aquella cuya prop "rel" sea "approved"
                    //y devolversela al cliente REACT 
                    res.status(200).send({codigo:0,mensaje:'objeto ORDER correctamente, entra en paypal y PAGA!!',datos:{
                                                                                                                        urlPayPal:respOrder.links.filter(link=>link.rel==='approve')[0].href
                                                                                                                     }});

                break;

            case 'google-pay':
                    //pago con google-pay....

                break;
        }
          

          res.status(200).send( { codigo: 0, mensaje:'pago del pedido procesado ok...' } );
        }catch(error){
          console.log('error a la hora de hacer pago....', error.message);
          res.status(200).send( { codigo: 100, mensaje :'error interno al procesar pago, intentelo de nuevo mas tarde'} );
        }
      } ,
    PayPalCallBack:async function(req,res,next){

      }

}
/*
modulo de codigo que exporta fichero js con metodos pata hacer pago paypal
antes de invocar cualquier endpoint de paypal hjay que solicitar at para poder hacer uso de sus api

1º operacion:crear un objeto ORDER:informacion del pedido a cobrar(items,subtotal,gastosenvio,total)
              ademas en el objeto oRDER van las urls para que el cliente acepte/deniege pago por paypal del ORDER

2º una vez que el lciente de ok/cancel a paypal se pone en conttacto con nuestro servicio de nodejs paa que finalicemos el pago (tenemos que pasar el id ORDER) checkout ORDER
*/
const axios=require('axios');


async function getAccesTokenPayPal() {
    try { 
        //Obtener at de PayPal 
        //tenemos que pasar en cabecera Authorization codificado en base64 la combinacion:client_id:client_secret
        //pasar en el body de la peticion en formato x-www-form-urlencoded, estos datos: "grant_type=client_credentials"
        let _base64ClientIdClienteSecret=Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
        let respToken=await axios(
                                {
                                    url:'https://api-m.sandbox.paypal.com/v1/oauth2/token',
                                    method:'POST',
                                    headers:{
                                        'Content-Type':'application/x-www-form-urlencoded',
                                        'Authorization':`Basic ${_base64ClientIdClienteSecret}`
                                    },
                                    data:'grant_type=client_credentials' //<---tambien te puedes crear un objeto URLSearchParams, pero para una variable no merece la pena
                                }
        );
        console.log('respuesta de payapl a la peticion de at para hacer uso de su api ',respToken.data);
        if(!respToken.data.access_token) throw new Error('error al solicitar accestoken a paypal');

        return respToken.data.access_token;
    } catch (error) {
        console.log('error al intentar crear at paypal ',error);
        return null;
    }
}

module.exports={
    CrearPagoPayPal:async function (idCliente,pedido) {
        try {
            
            //1º solicitar at
            let accestoken=await getAccesTokenPayPal();

            if(! accestoken) throw new Error('falta accestoken');


            //2º crare objeto order del paypal con detalles del pedido
            //tengo que comprobar si estoy en el comprarYa o cesta normal, pq los items del pedido cambian
            let itemsPedido=pedido.comprarYa.producto ? [{...pedido.comprarYa}] : pedido.itemsPedido;
            let payloadOrder={
                intent:'CAPTURE', // <---propiedad obligatorio por paypal para poder crear objeto oRDER
                purchase_units:[ 
                    {
                        items:itemsPedido.map(  // <--- array de items del pedido, cada item del pedido paypal:{name:...,quantity:...,unit_amount:{currency_code:...,value:...}}
                                el =>({
                                    name:el.producto.nombre,
                                    quantity:el.cantidad.toString(),
                                    unit_amount:{currency_code:'EUR',value:el.producto.precio.toString()}
                                })
                        ),
                        //subtotal,gastosEnvio,total del pedido
                        amount:{
                            currency_code:'EUR',
                            value:pedido.total.toString(),
                            breakdown:{
                                item_total:{currency_code:'EUR',value:pedido.subtotal.toString()},
                                shipping:{currency_code:'EUR',value:pedido.gastosEnvio.toString()}
                            }
                        }
                    }
                    
                ], //cierre de propiedad purchase_units el objeto ORDER
                application_context:{ //<---propiedad del objeto ORDER no es REQUERIDA pero para un servicio GATEWAY (servicio intermediario) hay que meterla si o si pq dan las urls de callback a las que tiene que acceder payPal
                    return_url:`http://localhost:3001/api/zonaTienda/PayPalCallBack?idCliente=${idCliente}&idPedido=${pedido._id}`,
                    cancel_url:`http://localhost:3001/api/zonaTienda/PayPalCallBack?idCliente=${idCliente}&idPedido=${pedido._id}&Cancel=true`,
                }
            }
            let respOrder=await axios(
             {
                'method':'POST',
                'url':'https://api-m.sandbox.paypal.com/v2/checkout/orders',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':`Bearer ${accestoken}`
                },
                data:JSON.stringify(payloadOrder)
             }
           );

           console.log('respuesta de paypal al objeto ORDER creado...',respOrder.data);
           return respOrder.data; //<--- sobre todo me interesa el id y una url a devolver al cliente para que se conecte a paypal y pueda pagar

            

        } catch(error) {
            console.log('error al crear objeto ORDER ',error);
            return null;
        }
    },
    FinalizarPagoPayPal:async function (orderId) {
        try {
            //1º solicitar at

            //2º checkout ORDER del paypal
        } catch (error) {
            console.log('error a finalizar pago ',error);
        }
    }
}

/*
modulo de nodejs que exporta un objeto JS con metodos para hacer pago con tarjeta...
usando STRIPE (usando la API de strip):
    - 1º Paso para hacer pago: crear un objeto de tipo CUSTOMER con datos del cliente
    - 2º Paso para hacer pago: crear un objeto de tipo CARD asociado a ese CUSTOMER donde se le va a hacer el cargo del pago (tipo tarjeta,nº tarjeta,...)
    - 3º Paso para hacer pago: crear un objetp de tipo CHARGE para hacer ya el cargo (cantidad,moneda,idCard,idCustomer,....)
*/
const axios=require('axios');
const clienteFetchAxios=axios.create({
                                        baseURL:'https://api.stripe.com/v1/',
                                        headers:{
                                                 'Authorization':`Beare ${process.env.STRIPE_API_KEY}`
                                                }
                                    });


//METODOS POR PASO
module.exports={
    CrearCustomer:async function(datosCliente) {
    //metodo que sirve para llamar a la API de stripe para crear un objeto customer
    //tengo que pasar en cabecera Authorization: Bearer __api_key <--hecho en configuracion base de axios
    //y en el body de la peticion, en formario X-WWW-FORM-URLENCODED ojo!!! no jsonm, datos del cliente para el cobro 
    try{

        //en datosCliente solo voy a pasar: nombre y apellidos, email, telefono, direccion principal de envio
        const {nombre,email,telefono,direccionEnvio}=datosCliente;
         let _payLoadStripeCostumer=new URLSearchParams(
                                                            {
                                                                'name': nombre,
                                                                'phone':telefono,
                                                                'email':email,
                                                                'address[city]':direccionEnvio.municipio,
                                                                'address[state]':direccionEnvio.provincia,
                                                                'address[country]':direccionEnvio.pais,
                                                                'address[postal_code]':direccionEnvio.cp,
                                                                'address[line1]':direccionEnvio.calle,
                                                            }

         ).toString();
         //no hace falta añadir cabecera: Content-Type:x-www-form-urlencoded porque al crear objeto URLSearchParams 
         //axio lo detecta y lo añade directamente. Si no usas este objeto y lo haes usando js puro:
         //Object.keys(datosCliente).map((prop,pos)=>{return `${prop}=${datosCliente[prop]}`.join('&')})  si lo hacemos asi si hay que añadirlo 
         let _reqStripeCustomer=await clienteFetchAxios.post('customers',_payLoadStripeCostumer);
         console.log('respuesta de stripe ante la creacion del objeto CUSTOMER... ',_reqStripeCustomer.data);

         if(!_reqStripeCustomer.data.id){
            throw new Error('error al crear el objeto CUSTOMER de stripe, pago invalidado....');

         }else{
            return _reqStripeCustomer.data.id;
         }         

    }catch(error){
        console.log('erro al crear objeto customer ',error);
        return null;
    }
    },
    CrearCardFromCustomer: async function(idCustomeStipe,datosTarjeta) {
        //metodo que sirve para llamar a la api de tripe para crear objeto CARD y asociarlo a un objeto CUSTOMER
        //tengo que pasar en cabecera Authorization: Bearer __api_key <--hecho en configuracion base de axios
        //y en el body de la peticion, en formario X-WWW-FORM-URLENCODED ojo!!! no jsonm, datos de la tarjeta el idCustomer creado

        try{
            let _payloadStripeCard=new URLSearchParams(
                                                        {
                                                            //objeto payload con info de tarjeta a asociar al objeto customer de stripe a la que hacer el cargo                                                        /
                                                            /*'source[object]':'card',
                                                            'source[number]':datosTarjeta.numero,
                                                            'source[cvc]':datosTarjeta.cvc,
                                                            'source[exp_year]':datosTarjeta.fechaExpiracion.anio,
                                                            'source[exp_month]':datosTarjeta.fechaExpiracion.mes,
                                                            'source[name]':datosTarjeta.nombreCompleto*/

                                                            //con fines de desarrollo para probar la api, stripe te genera una tarjeta ficticia: source:'tok_visa'
                                                            'source':'tok_visa'
                                                        }
            ).toString();
            let _reqStripeCard=await clienteFetchAxios.post(`customers/${idCustomeStipe}/sources`,_payloadStripeCard);

            console.log('respuesta de stripe a la hora de crear el objeto CARD... ',_reqStripeCard.data);

            if(! _reqStripeCard.data.id){
                throw new Error('fallo a la hora de crear el objeto CARD de strupe y asociarlo al objeto Customer');
            }else{
                return _reqStripeCard.data.id;
            }
        }catch(error){
            console.log('erro al crear objeto CARD ',error);
        return null;
        }

    },
    CrearCharge:async function (idCustomerStripe,idCard,cantidad,idPedido) {
         //metodo que sirve para llamar a la api de tripe para crear objeto CHARGE y asociarlo a un objeto CUSTOMER y CARD
        //tengo que pasar en cabecera Authorization: Bearer __api_key <--hecho en configuracion base de axios
        //y en el body de la peticion, en formario X-WWW-FORM-URLENCODED ojo!!! no jsonm, datos del pedido a cobrar

        try{            
            let _payloadStripeCharge=new URLSearchParams(
                                                            {
                                                                'amount':cantidad * 100, //<--en la antigua api habia qe convertirlo a string
                                                                'currency':'eur',
                                                                'description':`cobro del pedido Ebay con id ${idPedido}`,
                                                                'customer':idCustomerStripe,
                                                                'source':idCard
                                                            }
            ).toString();
            let _reqStripeCharge=await clienteFetchAxios.post(`charges`,_payloadStripeCharge);   
            
            console.log('respuesta de stripe a la hora de crear el objeto CHARGE',_reqStripeCharge.data)

            if(_reqStripeCharge.data.status != 'succeeded'){
                throw new Error('fallo a la hora de crear el objeto el CHARGE y realizar el cobro en stripe')
            }else{
                return _reqStripeCharge.data.id; //podemos devolver de todo el objeto lo que queramos y almacenarlo en mongo
            }

        }catch(error){
            console.log('erro al crear objeto CHARGE ',error);
            return null;
        }
    }

}
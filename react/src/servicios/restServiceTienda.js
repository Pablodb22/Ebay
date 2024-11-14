//creamos un objeto javascript con metodos dentro del objeto para hacer cada pet.ajax al servicio nodejs
//con metodos para la tienda: recuperar productos de una catetgoria, recuperar detalles de un producto, recup
//productos mas vendidos, recup.productos en oferta,...
//y exportas todo el objeto 
let restTienda={
    DevolverCategorias: async function( { request, params, subcats } ){
        try {
            console.log('parametros del loader de react-router-dom....', request, params, subcats);

            //si en params existe propiedad .pathCategoria, entonces quiero recuperar subcategorias. Si no existe
            //esa prop. lo ejecuta el loader el metodo para recup. categorias principales
            //CREO UN PARAMETRO A INCLUIR EN LA URL a mandar al servicio de nodejs indicando q quiero recuperar:
            let _parametro=subcats === undefined ? 'principales' : subcats.pathCategoria; //Si no has seleccionada una categoria sacara las principales  y si has seleccionado pondra el path de la categoria seleccionada
            
            let _resp=await fetch(`http://localhost:3001/api/zonaTienda/DevolverCategorias?pathCategoria=${_parametro}`);
            let _bodyResp=await _resp.json(); //<---- un objteto: { codigo: x, mensaje: ..., datos: .... }

            console.log('respuesta del servicio para recup.categorias...', _bodyResp)
            return _bodyResp.datos;

        } catch (error) {
            console.log('error al recuperar categorias...', error.message);
            return null;            
        }
    },
    RecuperarProductosFromCat: async function( {request, params } ){
        try {
            console.log('parametros del loader de react-router-dom en RECUPERARPRODUCTOS....', request, params);
            let _resp=await fetch(`http://localhost:3001/api/zonaTienda/RecuperarProductosFromCat?catId=${params.catId}`);
            let _bodyResp=await _resp.json(); //<---- un objteto: { codigo: x, mensaje: ..., datos: .... }

            console.log('respuesta del servicio para recup.categorias...', _bodyResp)
            return _bodyResp.datos;

        } catch (error) {
            console.log('error al recuperar categorias...', error.message);
            return null;                        
        }
    },
    RecuperarProducto : async function( {request,params } ){
        try {
            console.log('parametros del loader de react-router-dom en RECUPERARPRODUCTO dese _ID ....', request, params);
            let _resp=await fetch(`http://localhost:3001/api/zonaTienda/RecuperarProducto?idProd=${params.idProd}`);
            let _bodyResp=await _resp.json(); //<---- un objteto: { codigo: x, mensaje: ..., datos: .... }

            console.log('respuesta del servicio para recup.producto...', _bodyResp)
            return _bodyResp.datos;

        } catch (error) {
            console.log('error al recuperar categorias...', error.message);
            return null;                        
        }

    },
    VendedorNombre:async function (numeros) {
        try {            
            let _resp=await fetch(`http://localhost:3001/api/zonaTienda/NombreVendedor?idProd=${numeros}`);
            let _bodyResp=await _resp.json(); //<---- un objteto: { codigo: x, mensaje: ..., datos: .... }

            console.log('respuesta del servicio para recup.nombre vendedor...', _bodyResp)
            return _bodyResp.datos;

        } catch (error) {
            console.log('error al recuperar nombre vendedor...', error.message);
            return null;                        
        }
        
    },
    DevolverDireccion:async function (email) {
        try{
            let _resp=await fetch(`http://localhost:3001/api/zonaTienda/DevolverDireccion?email=${email}`);
            let datosresp=await _resp.json();
            return datosresp;
        }catch(error){
            console.log('error al recuperar direccion...', error);
            return null;    
    }
    },
    AñadirDireccion:async function({direccion,telefono,email}) {
        try{
            const respuesta = await fetch('http://localhost:3001/api/zonaTienda/AnadirDireccion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ direccion, telefono, email }), // Convertir el objeto a JSON
            });    
            let datosresp=await respuesta.json();
            return datosresp;                
        }catch(error){
            console.log('error al enviar direccion ',error);
            return null;
        }
    },

    FinalizarPedido: async function ({refreshToken,accesToken,cliente,pedido}) {
        try{
            let _respuestaFinPedido=await fetch('http://localhost:3001/api/zonaTienda/ComprarProductos',{
                method:'POST',
                headers:{
                    //'Authorization':`Bearer ${accesToken}`,
                    //'X-RefreshToken':`${refreshToken}`,
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({cliente,pedido})
                
                
            });
            let datosResp=await _respuestaFinPedido.json();
            return datosResp;
        }catch(error){

        }
    }
}

export default restTienda
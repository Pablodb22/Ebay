//modulo de codigo que exporta un objeto js con metodos para generar/validar/refrescar JWT
//accestoken + refreshtoken <- tambien puede generar un accestoken de 1 solo uso
//verificar tokens (comprobar si no han expirado y esten firmados por el server del servicio)
const jsonwebtoken=require('jsonwebtoken');
module.exports={
    //ESTE METODO GENERA ACCES Y REFRESH
    generarJWT:function(payload,expiracion,unsolouso=false){
        //generamos o accestoken+refreshtoken o solo accesstoken de un solo uso...
        //1º token de accestoken:
        //FORMA LARGA
        /*
        let _accesToken=jwt.sign(
            {tipo:'accesToken', ...payload},
            process.env.JWT_SECRETKEY,
            {expiresIn:expiracion,issuer:'http://localhost:3001'}
        );
        let _refreshToken=jwt.sign(
            {tipo:'accesToken', email:payload.email},
            process.env.JWT_SECRETKEY,
            {expiresIn:expiracion,issuer:'http://localhost:3001'}
        );
        let _tokens=[_accesToken,_refreshToken];
        */

        //FORMA CORTA
        let tokens=[
            {tipo:'accessToken',expiresIn:expiracion},
            {tipo:'refreshToken',expiresIn:'5h'}

        ].map(
            (el,pos,arr)=>{
                let _payload=el.tipo==='accessToken' ? {tipo:el.tipo, ...payload}:{tipo:el.tipo,email:payload.email}
                return jsonwebtoken.sign(
                    _payload,
                    process .env.JWT_SECRETKEY,
                    {expiresIn:el.expiresIn,issuer:'http://localhost:3001'}
                )
            }
        );
        return unsolouso ? tokens[0]:tokens;
    },
    verificarJWT:function(jwt){
        //NECESARIO PARA VERIFICAR CUANDO SE ENVIE EL CORREO DE VERIFICACION 

    }
}
//Objeto js que va a servir para mandar emails usando cuenta de gmail del admin del servicio
const {google}=require('googleapis');

//1º paso configurar cliente oAuth2 con claves oAuth(clienteId,clienteSecret) de google, al cual pediremos 
//codigo para poder usar la api de gmail...con ese codigo conseguiremos un accessToken y refreshToken para
//poder hacer uso del servicio rest gmail
const oauth2Cliente=new google.auth.OAuth2(
    process.env.GMAIL_OAUTH_CLIENTEID,
    process.env.GMAIL_OAUTH_CLIENTESECRET,
    'https://developers.google.com/oauthplayground' // <-- url donde google cuando metes email + password, manda codigo para intercambiar por accestoken + refreshtoken
    
    //como estamos en el lado del server donde el corre el servicio, solo se van a originar una unica vez, google aconseja poner esa url    
);
// GMAIL_OAUTH_CLIENTEID y GMAIL_OAUTH_CLIENTESECRET son muy importantes ya que sin estos no podremos sacar los tokens
//se supone que ya hemos accedido con ese codigo a la obtencion de los jwt: accestoken y refreshtoken para acceder a la api de GMAIL de google
oauth2Cliente.setCredentials(
    {
        access_token:process.env.GMAIL_ACCESS_TOKEN,
        refresh_token:process.env.GMAIL_REFRESH_TOKEN,
    }
);

//con esos tokens ya podemos acceder a la API de gmail usando la cuenta de admin del portal:
//metemos el objeto oauth2Cliente el cual tendra el clienteid y clientesecret y los tokens (los cuales los añadimos despues de crearlo)
const gmailCliente=google.gmail({version:'v1',auth:oauth2Cliente});

//2º paso con esos jwt de acceso a la api de gmail, mandar el correo usando la api: .send(mensaje_correo)
//esos jwt van en la cabecera authorization
module.exports={
    EnviarEmail:async function(detallesEmail) {
        try{
            console.log('detalles del email a mandar ',detallesEmail);
            const{to,subject,cuerpoMensaje,adjuntos=[]}=detallesEmail;
            //la api de GMAIL para usar su metodo .send() obliga a que en el cuerpo del mensaje de llamada a la api (siempre por POST)
            //tiene que ir un objeto asi:
            /*
                {
                    userId:'me',
                    requestBody:{
                                    raw:codigoBASE64EMAIL
                                 }
                }

                el email estara formado por strings con los campos from: .... to: ..... subject: ..... content-type:....  [MENSAJE]
            */
           const lineasEmail=[
            `From: ${process.env.EMAIL_ADMIN}`,
            `To: ${to}`,
            'Content-Type: text/html;charset=iso-8859-1',
            'MIME-Version:1.0',
            `Subject: ${subject}`,
            '',
            `${cuerpoMensaje}`
           ];

           let codigoBASE64EMAIL=btoa(lineasEmail.join('\r\n').trim()); //convierto a 64 porque asi lo quiere la api de gmail
           let respuestaEnvio=await gmailCliente.users.messages.send(
            {
                userId:'me',
                requestBody:{
                    raw:codigoBASE64EMAIL
                }
            }
           );
           console.log('respuesta al envio del email',respuestaEnvio)
           return true;
        }catch(error){
            console.log('error al envio del email ',error)
            return false;
        }
    }
}



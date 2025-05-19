const axios=require('axios');

async function getAt() {
    try{    
    let base64ClientIdClienteSecret=Buffer.from('AnonymousGeoApi:tryHarder').toString('base64');
    let respToken=await axios(
        {
            url:'http://localhost:6666/api/GeoApi/GetAccessToken',
            method:'POST',
            headers:{
                'Authorization':`Basic ${base64ClientIdClienteSecret}`
            },
            data: {
                solicitud: 'accessToken',
            },} );
            
         
            if (respToken.data.codigo === 0) {
                console.log('AccessToken:', respToken.data.datos.accessToken);
                return respToken.data.datos.accessToken; // Devuelve el token de acceso
            } else {
                console.error('Error en la respuesta generar Token:', respToken.data.mensaje);
                return null;
            }
            } catch (error) {
            console.log('Error al intentar recuperar el accessToken:', error);
            return null;
            }
}

async function getProvincia(at){
   
    if (!at) {
        console.error('AccessToken no válido o ausente');
       
    }
    try{    
    let respProvincia=await axios(
                        { 
                            url:'http://localhost:6666/api/GeoApi/ListaProvincias',
                            method:'GET',
                            headers:{
                               'Authorization':`Bearer ${at}`
                            } 
                        });

    if(respProvincia.data.codigo===0){
        return respProvincia.data.datos.provincias
    }else{
        console.error('Error en la respuesta generar provincias:', respProvincia.data.mensaje);
        return null;
    }

    }catch(error){
        console.log('Error al intentar recuperar provincias:', error);
        return null;  
    }

}



async function getMunicipio(at, codProv) {
    if (!at) {
        console.error('AccessToken no válido o ausente');
        return null;
    }
    try {
        const respMunicipio = await axios({
            url: `http://localhost:6666/api/GeoApi/ListaMunicipios?codProv=${codProv}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${at}`,
            },
        });

        if (respMunicipio.data.codigo === 0) {
            return respMunicipio.data.datos.municipios;
        } else {
            console.error('Error en la respuesta al obtener municipios:', respMunicipio.data.mensaje);
            return [];
        }
    } catch (error) {
        console.error('Error al intentar recuperar municipios:', error);
        return [];
    }
}



module.exports = {
    getAt,
    getProvincia,
    getMunicipio,
};
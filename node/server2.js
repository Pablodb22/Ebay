/*
modulo principal configuracion de nodejs con express y mongo
este modulo va a importar una funcion de configuracion definida en otro modulo en la cual se configuran los
pipeline (middleweare de express)

modulo principal 
server2.js                          funcion exportada 
    |                               en modulo: configg_pipeline.js
express                                     ||
configPipeLine(servidorWeb) <---------function(){ ... } <--configuramos middleweare del servidor express
                                                            salvo los de enrutamiento que tambien se sacan
                                                            en modulos independiente
                                                                 |
                                                    ---------------------------------------------
                                                     |                                          |
                                                     modulo endpointsCliente.js             modulo endpointsTienda.js
                                                        |                                                   |
                                                exporta objeto Router de express                    exporta objeto Router de express
                                                donde se definen las rutas zonaCliente              donde se definen las rutas zonaTienda
                                                con las funciones a ejecutar                        con las funciones a ejecutar    


                                                            
*/
require("dotenv").config();
const express=require('express');
const configPipeLine=require('./config_server/config_pipeline');
const miServidorWeb = express();

//configuramos pipeline de expres...
configPipeLine(miServidorWeb);

miServidorWeb.listen(3001, () => {
    console.log("Servidor web express escuchando peticiones en puerto 3001");
  });


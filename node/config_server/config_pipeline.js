const cors = require("cors"); //añandimos modulos cors para poder usar diferentes puertos y que se enlacen
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const routerCliente = require("./config_routing/endpointsCliente");
const routerTienda=require("./config_routing/endpointsTienda");

module.exports=function(servidorWeb){
    servidorWeb.use(cookieParser());
    servidorWeb.use(bodyParser.json());
    servidorWeb.use(bodyParser.urlencoded({ extended: false }));
    servidorWeb.use(cors());

    servidorWeb.use('/api/zonaCliente',routerCliente);
    servidorWeb.use('/api/zonaTienda',routerTienda);
    

}
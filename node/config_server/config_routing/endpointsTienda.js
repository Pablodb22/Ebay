const express=require('express');
const tiendaEndPointsController = require('../controllers/tiendaEndPointsController');
const routerTienda=express.Router();

routerTienda.get('/DevolverCategorias',tiendaEndPointsController.DevolverCategorias);
routerTienda.get('/RecuperarProductosFromCat',tiendaEndPointsController.RecuperarProductosFromCat);
routerTienda.get('/RecuperarProducto',tiendaEndPointsController.RecuperarProducto);
routerTienda.get('/NombreVendedor',tiendaEndPointsController.NombreVendedor);
routerTienda.get('/DevolverDireccion',tiendaEndPointsController.DevolverDireccion);
routerTienda.post('/AnadirDireccion',tiendaEndPointsController.AnadirDireccion);
routerTienda.post('/ComprarProductos',tiendaEndPointsController.ComprarProductos);
routerTienda.get('/PayPalCallBack',tiendaEndPointsController.PayPalCallBack);


module.exports=routerTienda;
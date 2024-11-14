const express=require('express');
const clienteEndPointsController = require('../controllers/clienteEndPointsController');
const routerCliente=express.Router();

routerCliente.post('/Registro',clienteEndPointsController.Registro);
routerCliente.get('/ActivarCuenta',clienteEndPointsController.ActivarCuenta);
routerCliente.post('/ComprobarEmail',clienteEndPointsController.ComprobarEmail);
routerCliente.post('/ComprobarEmailyPassword',clienteEndPointsController.ComprobarEmailyPassword);
routerCliente.get('/VerificarToken',clienteEndPointsController.VerificarToken);
routerCliente.get('/CrearNuevoToken',clienteEndPointsController.CrearNuevoToken);

module.exports=routerCliente;
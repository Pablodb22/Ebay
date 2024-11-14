    import './ComprarYa.css';
    import { Link, useLoaderData, useLocation } from 'react-router-dom';
    import { useState, useEffect } from 'react';

    import MetodosPago from './metodosPagoComponent/MetodosPago';
    import DireccionEnvio from './direccionComponent/Direccion';
    import RevisarPedido from './revisarPedidoComponent/RevisarPedido';
    import ItemsPedido from '../itemsPedidoComponent/ItemsPedido';
    import useGlobaStore from '../../../hooks_personalizados/storeGlobal';
    function ComprarProductoYa() {
    const pedido=useGlobaStore(state => state.pedido);    
    const cliente=useGlobaStore(state => state.cliente);    
    const setPedido=useGlobaStore(state => state.setPedido);       
    console.log('cliente ',cliente);
        return (
            <div className="container mt-5">
                <div className="d-flex flex-row justify-content-between">
                    <div className='d-flex flex-row align-items-center'> 
                        <Link to="/"><img src='/images/logo_ebay.png' alt='logo Ebay'/> </Link> 
                        <h4><strong>Pago y envío</strong></h4>
                    </div>
                    <div>
                        <p>¿Te gusta el servicio Pago y envío? <a href='/'>Danos tu opinión</a></p>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-8">
                        <h4>Pagar con</h4>
                        <div className="mb-4">
                            <MetodosPago pedido={pedido} setPedido={setPedido}/>
                        </div>
                        <DireccionEnvio cliente={cliente} />
                        <div className="mb-4">
                            <h4>Revisar pedido</h4>
                            <RevisarPedido pedido={pedido} setPedido={setPedido}/>
                        </div>
                    </div>

                    <div className="col-4">
                        <h4 className="mb-4">Resumen del pedido</h4>
                        <ItemsPedido pedido={pedido} setPedido={setPedido} cliente={cliente}/>
                    </div>
                </div>
            </div>
        );
    }

    export default ComprarProductoYa;
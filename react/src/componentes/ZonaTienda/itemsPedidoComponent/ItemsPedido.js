import './ItemsPedido.css';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useGlobaStore from '../../../hooks_personalizados/storeGlobal';
import restTienda from '../../../servicios/restServiceTienda';

function ItemsPedido({ pedido, setPedido,cliente }) {
    const _path = useLocation();

    // Usamos useEffect para actualizar el subtotal y el total solo cuando cambien los valores de pedido.
    useEffect(() => {
        const subtotal = pedido.comprarYa.cantidad * pedido.comprarYa.producto.precio;
        const total = subtotal + pedido.gastosEnvio;

        // Actualizamos el pedido solo si el subtotal o el total han cambiado para evitar ciclos infinitos.
        setPedido(({           
            subtotal: subtotal,
            total: total,
        }));
    }, [pedido.comprarYa.cantidad]); // Solo se ejecutará cuando cambiar alguno de estos valores

    async function HandlerClickComprar() {
        let respPago=await restTienda.FinalizarPedido(cliente,pedido);

        if(respPago.datos.urlPayPal){
            //abriendo el acceso a paypal en una nueva ventana
            window.open(respPago.datos.urlPayPal,"abriendo paypal","popup");
        }else{

        }
    }

    return (
        <div className="card">
            <div className="card-body">
                <div className="container">
                    <div className="row">
                        <div className="col-8">
                            <p className="card-text">Artículos({pedido.comprarYa.cantidad})</p>
                        </div>
                        <div className="col-4">
                            <p className="card-text">{pedido.subtotal?.toFixed(2)} EUR</p> {/* Mostramos subtotal con dos decimales */}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-8">
                            <p className="card-text">Envío</p>
                        </div>
                        <div className="col-4">
                            <p className="card-text">{pedido.gastosEnvio?.toFixed(2)} EUR</p> {/* Mostramos gastos de envío con dos decimales */}
                        </div>
                    </div>
                    <hr />
                    <div className="row">
                        <div className="col-8">
                            <p className="card-text"><strong>Total del pedido</strong></p>
                        </div>
                        <div className="col-4">
                            <p className="card-text"><strong>{pedido.total?.toFixed(2)} EUR</strong></p> {/* Mostramos total con dos decimales */}
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <button className="btn btn-primary w-100" onClick={HandlerClickComprar}>
                                {_path.pathname.includes('ComprarYa') ? 'Confirmar y pagar' : 'Completar Compra'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ItemsPedido;

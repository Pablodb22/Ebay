import { useEffect, useState } from 'react';
import './RevisarPedido.css';
import { useLocation } from 'react-router-dom';
import restTienda from '../../../../servicios/restServiceTienda';


function RevisarPedido({ pedido, setPedido }) {
    const location = useLocation();
    //const pedido=useGlobaStore(state => state.pedido);    
    //const setPedido=useGlobaStore(state => state.setPedido);
    //const { producto, cantidad } = itemPedido;

    const handleCantidadChange = (e) => {
        const nuevaCantidad = parseInt(e.target.value, 10);
        setPedido({
            comprarYa: {
                ...pedido.comprarYa, // Mantiene el producto actual y cualquier otro dato en "comprarYa"
                cantidad: nuevaCantidad // Cambia solo la cantidad
            }
        }); // Llama a modificarItem con la nueva cantidad
    };

    const numeros = location.pathname.match(/\/(\d+.*)$/); // Extraer el id del producto
    const [vendedor, setVendedor] = useState(null); // Cambiar a null o {} en vez de []

    useEffect(() => {
        const obtenerVendedor = async () => {
            
                try {
                    const vendedorNombre = await restTienda.VendedorNombre(pedido.comprarYa.producto._id);
                    setVendedor(vendedorNombre || null); // Manejar el caso de vendedor no encontrado
                } catch (error) {
                    console.error('Error al recuperar el nombre del vendedor:', error);
                    setVendedor(null); // Manejar error
                }            
        };

        obtenerVendedor();
    },[]);

    return (
        <div className="card mb-4">
            <div className="card-header">
                <p className="card-text"><strong>Vendedor:</strong> {vendedor ? vendedor.nombre : "Desconocido"} <a href="#">Añadir nota para el vendedor</a></p>
            </div>

            <div className="card-body d-flex flex-row">
                <div className="col-md-2 p-2">
                    <img 
                        src={(pedido.comprarYa.producto.imagenes && pedido.comprarYa.producto.imagenes[0]) || "https://via.placeholder.com/100"} 
                        alt="Producto"
                        className="img-thumbnail"
                        style={{ width: '100px' }}
                    />
                </div>

                <div className="col-md-10 p-3">
                    <p className='card-text'><strong>{pedido.comprarYa.producto.nombre}</strong><br/><span className="text-muted">Estado: {pedido.comprarYa.producto.estado || "Desconocido"}</span></p>
                    <p className='card-text '><strong>{pedido.comprarYa.producto.precio || 0} EUR</strong></p>

                    <div className="form-floating mb-3" style={{ width: '135px' }}>
                        <select
                            id="quantity"
                            className="form-control form-select"
                            value={pedido.comprarYa.cantidad}
                            onChange={handleCantidadChange}
                        >
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                        <label htmlFor="quantity" className="form-label"><strong>Cantidad:</strong></label>
                    </div>

                    <div className="mb-3">
                        <h6><strong>Envío:</strong></h6>
                        <span className='text-muted'>{pedido.comprarYa.producto.envio?.tiempoEstimado}</span>
                        {(pedido.comprarYa.producto.envio?.compania || []).map((envio, pos) => (
                            <div className="form-check" key={pos}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="envio"
                                    value={envio}
                                    id={`id-${envio}`}
                                    checked={pos === 0}
                                />
                                <label className="form-check-label" htmlFor={`id-${envio}`}>
                                    {envio} (0,00 EUR)
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RevisarPedido;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGlobaStore from '../../../hooks_personalizados/hooks_store_zustland/storeGlobal';
import './puja.css';
import restTienda from '../../../servicios/restTienda';

function Puja() {
    const navigate = useNavigate();
    const producto = useGlobaStore(state => state.Producto); // Obtener el producto del estado global
    const precioMasAlto = useGlobaStore(state => state.PrecioMasAlto); // Obtener el precio más alto del estado global
    
    // Estado para la puja
    const [puja, setPuja] = useState(0);

    // Manejar la puja
    const handlePujar = async () => {
        if (puja >= precioMasAlto) {
            //Aqui llamar al servicio rest y pasarle el id del producto y puja para poder actualizar el precio mas alto 
            try{
                const respuestaServer=await restTienda.Pujar(producto._id,puja);
                if(respuestaServer.codigo===0){
                    console.log("La puja se ha llevado a cabo con exito",respuestaServer);
                }
            }catch(error){
                console.log("Error a la hora de hacer la puja ",error);
            }                                    
        } else {
            console.log('La puja debe ser igual o mayor al precio más alto.');
        }
    };

    // Si no hay producto, redirigir al usuario
    if (!producto) {
        return <div>No se encontró el producto.</div>;
    }
    console.log('Producto:', producto);
    console.log('Precio más alto:', precioMasAlto);
    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-5">
                    <img 
                        src={producto.imagenes[0] || "https://via.placeholder.com/500"} 
                        alt={producto.nombre} 
                        className="img-fluid rounded" 
                    />
                </div>
                <div className="col-md-7">
                    <h3>{producto.nombre}</h3>
                    <p className="text-muted">Precio más alto de la puja: <strong>{precioMasAlto} EUR</strong></p>
                    <div className="input-group mb-3">
                        <input
                            type="number"
                            className="form-control"
                            value={puja}
                            onChange={(e) => setPuja(parseFloat(e.target.value))}
                            placeholder="Ingresa tu puja"
                        />
                        <button className="btn btn-primary" onClick={handlePujar}>Añadir Puja</button>
                    </div>
                    <p className="text-danger">Asegúrate de que tu puja sea igual o mayor al precio más alto.</p>
                    <button className="btn btn-secondary" onClick={() => navigate(-1)}>Volver al Producto</button>
                </div>
            </div>
        </div>
    );
}

export default Puja;
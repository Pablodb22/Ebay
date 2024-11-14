import { useEffect, useState } from 'react';
import './Direccion.css';
import restTienda from '../../../../servicios/restServiceTienda';

function Direccion({ cliente }) {
    const [email, setEmail] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [direccion, setDireccion] = useState(null);  // Nuevo estado para la dirección

    useEffect(() => {
        const fetchDireccion = async () => {
            try {
                const emailusuario = localStorage.getItem("usuario");
                const usuario = JSON.parse(emailusuario);

                const email = usuario.email;
                setEmail(email);
                setNombre(usuario.nombre);
                setApellido(usuario.apellido);

                let respuesta = await restTienda.DevolverDireccion(email);
                
                // Asumiendo que la respuesta tiene el formato: { codigo, mensaje, datos }
                if (respuesta.codigo === 0 && respuesta.datos.length > 0) {
                    setDireccion(respuesta.datos[0]);  // Guarda la primera dirección en el estado
                } else {
                    console.log('No se encontraron direcciones para este usuario');
                }
            } catch (error) {
                console.log('Error al recuperar la dirección:', error);
            }
        };

        fetchDireccion();
    }, []);  // Asegúrate de que solo se ejecute una vez al cargar el componente

    return (
        <div className="mb-4">
            <h4>Envío a</h4>
            <div className="card">
                <div className="card-header">
                    <p className="card-text">
                        <h6>{nombre} {apellido}</h6>
                        <span className="text-muted">Datos contacto: (email: {email})</span>
                    </p>  
                </div>
                <div className="card-body">
                    {direccion ? (
                        <p className="card-text">
                           calle {direccion.calle}<br/>
                            {direccion.municipio}, {direccion.provincia} <br/>
                            {direccion.pais}
                        </p>
                    ) : (
                        <p className="text-muted">No se encontró dirección</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Direccion;

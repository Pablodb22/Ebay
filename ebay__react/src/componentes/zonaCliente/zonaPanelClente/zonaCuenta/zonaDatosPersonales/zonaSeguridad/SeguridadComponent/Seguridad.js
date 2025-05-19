import { useState } from 'react';
import restCliente from '../../../../../../../servicios/restCliente';
import useGlobaStore from '../../../../../../../hooks_personalizados/hooks_store_zustland/storeGlobal';
function Seguridad() {
    const [contrasenaActual, setContrasenaActual] = useState('');
    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const cliente = useGlobaStore((state) => state.cliente);   
    //1º verificar si la contrasena nueva y la repeticion de la contraseña nueva son iguales
    async function cambiarcontraseña(event){
        event.preventDefault();
        try{
            if(nuevaContrasena===nuevaContrasena){
                console.log(cliente._id);
                const respuestaServer=await restCliente.CambiarPass(contrasenaActual,nuevaContrasena,cliente._id)
                console.log(respuestaServer)
            }
        }catch(error){
            console.log('Error en react ',error)
        }        
    }
    //2º mandarle al servidor la contraseña antigua y la nueva 

    
       return (
           <div className="container">
               <h4><strong>Cambiar Contraseña</strong></h4>
               <form>
                   <div className="mb-3">
                       <label htmlFor="txtContrasenaActual" className="form-label">Contraseña Actual</label>
                       <input
                           type="password"
                           id="txtContrasenaActual"
                           className="form-control"
                           value={contrasenaActual}
                           onChange={(e) => setContrasenaActual(e.target.value)}
                           required
                       />
                   </div>
                   <div className="mb-3">
                       <label htmlFor="txtNuevaContrasena" className="form-label">Nueva Contraseña</label>
                       <input
                           type="password"
                           id="txtNuevaContrasena"
                           className="form-control"
                           value={nuevaContrasena}
                           onChange={(e) => setNuevaContrasena(e.target.value)}
                           required
                       />
                   </div>
                   <div className="mb-3">
                       <label htmlFor="txtConfirmarContrasena" className="form-label">Confirmar Nueva Contraseña</label>
                       <input
                           type="password"
                           id="txtConfirmarContrasena"
                           className="form-control"
                           value={confirmarContrasena}
                           onChange={(e) => setConfirmarContrasena(e.target.value)}
                           required
                       />
                   </div>
                   <button type="submit" className="btn btn-primary" onClick={cambiarcontraseña}>Cambiar Contraseña</button>
               </form>
           </div>
       );
   }
   
export default Seguridad;

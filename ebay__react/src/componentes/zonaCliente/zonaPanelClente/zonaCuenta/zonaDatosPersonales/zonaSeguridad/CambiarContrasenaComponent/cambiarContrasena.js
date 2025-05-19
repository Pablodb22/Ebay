import { useState } from 'react';


function CambiarContrasena() {
    const [contrasenaActual, setContrasenaActual] = useState('');
    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
     
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
                <button type="submit" className="btn btn-primary">Cambiar Contraseña</button>
            </form>
        </div>
    );
}

export default CambiarContrasena;


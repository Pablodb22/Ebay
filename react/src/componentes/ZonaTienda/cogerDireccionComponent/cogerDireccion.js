import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import restTienda from '../../../servicios/restServiceTienda';

const FormularioEnvio = () => {
  const navigate = useNavigate();
  const [telefono, setTelefono] = useState('');

  const [pais, setPais] = useState('España');
  const [municipio, setMunicipio] = useState('');
  const [provincia, setProvincia] = useState('');
  const [calle, setCalle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construir el objeto direccion con los datos ingresados
    const direccion = {
      pais: pais,
      municipio: municipio,
      provincia: provincia,
      calle: calle
  };
            
    try {    
      const emailusuario=localStorage.getItem("usuario");
      const usuario = JSON.parse(emailusuario);
      const email=usuario.email;

      let respuesta = await restTienda.AñadirDireccion({ direccion, telefono,email });
      if(respuesta.codigo==0){
        navigate('/Tienda/ComprarYa');
      }
    } catch (error) {
      console.log("ERROR EN RESPUESTA de poner direccion en bd cliente", error);
    }

    
    
  };

  return (
    <form onSubmit={handleSubmit} className="container mt-5">
      <h2 className="mb-3">Añade una dirección de envío</h2>
      <p>Para continuar, necesitamos tu información de contacto.</p>

      <div className="mb-3">
        <label htmlFor="pais" className="form-label">País o región</label>
        <select
          id="pais"
          className="form-select"
          value={pais}
          onChange={(e) => setPais(e.target.value)}
        >
          <option value="España">España</option>
        </select>
      </div>

      <div className="mb-3">
        <label htmlFor="direccion-calle" className="form-label">Calle</label>
        <input
          type="text"
          id="direccion-calle"
          className="form-control"
          value={calle}
          onChange={(e) => setCalle(e.target.value)}
          placeholder="Calle"
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="direccion-municipio" className="form-label">Municipio</label>
        <input
          type="text"
          id="direccion-municipio"
          className="form-control"
          value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}
          placeholder="Municipio"
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="direccion-provincia" className="form-label">Provincia</label>
        <input
          type="text"
          id="direccion-provincia"
          className="form-control"
          value={provincia}
          onChange={(e) => setProvincia(e.target.value)}
          placeholder="Provincia"
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="telefono" className="form-label">Nº de teléfono</label>
        <div className="input-group">
          <span className="input-group-text">+34</span>
          <input
            type="tel"
            id="telefono"
            className="form-control"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Número de teléfono"
            required
          />
        </div>
      </div>

      <p>
        Esta información nos ayuda a mantener la seguridad en nuestra plataforma
        de compraventa. <a href="#">Más información</a>
      </p>

      <button type="submit" className="btn btn-primary w-100">
        Continuar
      </button>
    </form>
  );
};

export default FormularioEnvio;

function MiniDireccion({ el, index, eliminarDireccion, modificarDireccion }) {
    return (
        <div className="card">
            <div className="row g-0">
                <div className="col-md-8">
                    <div className="card-body">
                        <p className="card-title"><strong>{el.datosContacto.nombre} {el.datosContacto.apellidos}</strong></p>
                        <p className="card-text">
                            {el.calle}<br />
                            {el.municipio.DMUN50}, {el.provincia.PRO}, {el.cp}<br />
                            {el.pais}<br />
                            {el.datosContacto.telefono}
                        </p>
                    </div>
                </div>

                <div className="col-md-4 d-flex flex-column justify-content-center p-3">
                    <button 
                        className="btn btn-sm btn-outline-primary" 
                        style={{ borderRadius: '30px' }} 
                        onClick={modificarDireccion}
                    >
                        Modificar
                    </button>
                    <button 
                        className="btn btn-sm btn-outline-danger" 
                        style={{ borderRadius: '30px' }} 
                        onClick={() => eliminarDireccion(index)}
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MiniDireccion;

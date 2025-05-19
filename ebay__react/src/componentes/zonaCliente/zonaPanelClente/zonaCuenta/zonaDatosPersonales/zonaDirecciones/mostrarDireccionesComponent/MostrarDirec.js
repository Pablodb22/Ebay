import { useEffect, useState, useRef } from 'react';
import useGlobaStore from '../../../../../../../hooks_personalizados/hooks_store_zustland/storeGlobal';
import restCliente from '../../../../../../../servicios/restCliente';
import MiniDireccion from '../miniDireccionComponent/MiniDireccion';
import './MostrarDirec.css';

function MostrarDirec() {
    const [showModal, setShowModal] = useState(false);
    const [accesTokenApi, setAccesTokenApi] = useState('');
    const cliente = useGlobaStore((state) => state.cliente);
    const [direccionesModificadas, setDireccionesModificadas] = useState(false);
    const [municipio, setMunicipio] = useState([]);
    const [provincia, setProvincia] = useState([]);
    const hasFetchedToken = useRef(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const updateDireccion = useGlobaStore((state) => state.updateDireccion);


    const [formData, setFormData] = useState({
        pais: '',
        datosContacto: {
            nombre: '',
            telefono: ''
        },
        calle: '',
        cp: '',
        provincia: {
            PRO:'',
        },
        municipio:{
            DMUN50:'',
        } 
    });
    const [isFormValid, setIsFormValid] = useState(false);

    // Validar formulario
    useEffect(() => {
        const validarFormulario = () => {
            const camposValidos = Object.values(formData).every((campo) => {
                // Verificar si es un string
                if (typeof campo === 'string') {
                    return campo.trim() !== '';
                }
                // Para objetos, verificamos campos específicos
                if (typeof campo === 'object' && campo !== null) {
                    return Object.values(campo).every((subcampo) =>
                        typeof subcampo === 'string' ? subcampo.trim() !== '' : true
                    );
                }
                return false; // Si el campo no es string ni objeto, no es válido
            });
            setIsFormValid(camposValidos);
        };

        validarFormulario();
    }, [formData]);

    // Cargar token de API
    useEffect(() => {
        const obtenerToken = async () => {
            try {
                if (!hasFetchedToken.current) {
                    hasFetchedToken.current = true;
                    const respuestaTK = await restCliente.AccesTokenApi();
                    setAccesTokenApi(respuestaTK.token);
                }
            } catch (error) {
                console.error('Error al obtener el token de acceso:', error);
            }
        };

        obtenerToken();
    }, []);

    // Cargar provincias
    useEffect(() => {
        const obtenerProvincias = async () => {
            try {
                const respuestaProvincia = await restCliente.Provincia(accesTokenApi);
                setProvincia(respuestaProvincia);
            } catch (error) {
                console.error('Error al obtener provincias:', error);
            }
        };

        obtenerProvincias();
    }, [accesTokenApi]);



    // Actualizar estado cuando cambian las direcciones del cliente
    useEffect(() => {
        setDireccionesModificadas(true);
    }, [cliente.direcciones]);


    // Manejo del formulario
    const handleInputChange = async (e) => {
        const { name, value } = e.target;
    
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData((prevState) => ({
                ...prevState,
                [parent]: {
                    ...prevState[parent],
                    [child]: value,
                },
            }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    
        // Si cambia la provincia, cargar los municipios asociados a su CPRO
        if (name === "provincia.PRO") {
            const provinciaSeleccionada = provincia.find(
                (provinciaItem) => provinciaItem.PRO === value
            );
    
            if (provinciaSeleccionada && provinciaSeleccionada.CPRO) {
                try {
                    const municipiosFiltrados = await restCliente.Municipio(
                        accesTokenApi,
                        provinciaSeleccionada.CPRO // Pasar el CPRO en lugar de PRO
                    );
                    setMunicipio(municipiosFiltrados);
                } catch (error) {
                    console.error("Error al cargar los municipios:", error);
                }
            } else {
                setMunicipio([]); // Resetear los municipios si no se encuentra CPRO
            }
        }
    };
    

    const guardarDireccion = () => {
        if (editingIndex !== null) {
            // Si estamos en modo de edición
            updateDireccion(editingIndex, formData);
        } else {
            // Modo de creación de nueva dirección
            useGlobaStore.getState().addDireccion({
                ...formData,
                esFacturacion: false,
                esPrincipal: false,
            });
        }

        setShowModal(false);
        setEditingIndex(null); // Resetear el índice
        setFormData({
            pais: '',
            datosContacto: {
                nombre: '',
                telefono: ''
            },
            calle: '',
            cp: '',
            provincia: { PRO: '' },
            municipio: { DMUN50: '' },
        });
    };

    const abrirModalParaModificar = (index) => {
        const direccion = cliente.direcciones[index];
        setFormData(direccion); // Rellenar el formulario con los datos de la dirección seleccionada
        setEditingIndex(index); // Guardar el índice
        setShowModal(true);
    };


    console.log("****CLIENTE*****",cliente)

    return (
        <div className="container">
                    <div className="row">
                                    <div className="col-2"></div>
                                    <div className="col-8">
                                        <h4><strong>Dirección de ... tipo de dirección: envío, devoluciones, etc...</strong></h4>
                                        {cliente.direcciones.length > 0 ? (
                                            cliente.direcciones.map((direccion, index) => (
                                                <MiniDireccion 
                                                    key={direccion.calle} 
                                                    el={direccion} 
                                                    index={index} 
                                                    eliminarDireccion={(idx) => useGlobaStore.getState().deleteDireccion(idx)}
                                                    modificarDireccion={() => abrirModalParaModificar(index)} 
                                                />
                                            ))
                                        ) : (
                                            <p style={{ backgroundColor: '#3665f3', color: '#fff' }}>
                                                <i className="fa-solid fa-circle-info"></i> No tenemos tu dirección. Añade una dirección nueva.
                                            </p>
                                        )}
                                    </div>
                    </div>


            <div className="row mt-3">
                <div className="col-2"></div>
                <div className="col-8 d-flex flex-row justify-content-end">
                    <button className="btn btn-link" onClick={() => setShowModal(true)}>Añadir otra dirección</button>
                </div>
            </div>

            {/* Modal */}
            <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Añadir/Modificar dirección</h3>
                            <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowModal(false)}></button>
                        </div>

                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <label htmlFor="pais" className="form-label">País</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="pais"
                                        name="pais"
                                        value={formData.pais}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="row mt-3">
                                <div className="col-md-12">
                                    <label htmlFor="nombre" className="form-label">Nombre y Apellidos:</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nombre"
                                        name="datosContacto.nombre"
                                        value={formData.datosContacto.nombre}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="row mt-3">
                                <div className="col-md-9">
                                    <label htmlFor="calle" className="form-label">Calle</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="calle"
                                        name="calle"
                                        value={formData.calle}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="cp" className="form-label">Código postal</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="cp"
                                        name="cp"
                                        value={formData.cp}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="row mt-3">
                                <div className="col-md-6">
                                    <label htmlFor="provincia" className="form-label">Provincia</label>
                                    <select
                                        className="form-select"
                                        id="provincia"
                                        name="provincia.PRO"
                                        value={formData.provincia.PRO}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">...cargar provincias...</option>
                                        {provincia.map((provinciaItem) => (
                                            <option key={provinciaItem._id} value={provinciaItem.PRO}>
                                                {provinciaItem.PRO}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="municipio" className="form-label">Municipio</label>
                                    <select
                                        className="form-select"
                                        id="municipio"
                                        name="municipio.DMUN50"
                                        value={formData.municipio.DMUN50}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Seleccione un municipio...</option>
                                        {municipio.map((municipioItem) => (
                                            <option key={municipioItem._id} value={municipioItem.DMUN50}>
                                                {municipioItem.DMUN50}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>

                            <div className="row mt-3">
                                <div className="col-md-6">
                                    <label htmlFor="telefono" className="form-label">Número de teléfono</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="telefono"
                                        name="datosContacto.telefono"
                                        value={formData.datosContacto.telefono}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                                Cancelar
                            </button>
                            <button type="button" className="btn btn-primary" onClick={guardarDireccion}>
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MostrarDirec;
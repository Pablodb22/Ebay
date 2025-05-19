//modulo js q exporta hook para usar global state creado por store de zustland
import { create } from 'zustand';

//creamos el state global mediante un store de zustand usando la funcion create()
//admite un unico parametro q es la funcion creadora de dicho store; esta funcion creadora
//del state global tiene 3 parametros a su  vez: set, get, store
//esta funcion debe devolver un objeto q va a representar el state global de la aplicacion
// -set es una funcion para cambiar el valor del objeto del state global
// -get es una funcion para recuperar el valor del objeto del state global
// -store es un objeto q representa los valores q exporta el hook y q pueden usar los componentes...


const useGlobaStore=create(
    (set,get,store)=>{
        console.log('parametros de funcion creadora del state global mediante store...', set.toString(), get.toString(), store);
        //en el objeto q se devuelve, se usan como props. los valores a usar por los componentes para mostrar en sus vistas, etc
        //si estos componentes necesitan actualizar alguno de estos valores, defines funciones dentro del objeto q usan la funcion set 
        return {
                accesTokenApi:'',
                accessToken: '',
                refreshToken: '',
                cliente: {},
                PrecioMasAlto:0,
                pedido:{
                    metodoPago: { tipo:'', datos:{} }, //<---- objeto formato: { tipo: 'creditCard |paypal|google-pay', datos:{} } 
                    itemsPedido:[],
                    comprarYa: {}, //<--- objeto formato: { producto: ...., cantidad: ....}
                    subtotal: 0,
                    gastosEnvio: 0,
                    total: 0,
                },
                producto:null,
                setAccessTokenApi: jwt => set( state => ( { accessTokenApi: jwt } ) ),
                setAccessToken: jwt => set( state => ( { accessToken: jwt } ) ),
                setRefreshToken: jwt => set( state => ( { refreshToken: jwt} ) ),
                setPedido: pedido => set( state => ( { ...state, pedido: {...state.pedido, ...pedido } } )),
                setCliente: datoscliente => set(state => ( { ...state, cliente: { ...state.cliente, ...datoscliente } } )),

                // Función para añadir una nueva dirección
                addDireccion: (nuevaDireccion) => set(state => ({
                    cliente: {
                        ...state.cliente,
                        direcciones: [...state.cliente.direcciones, nuevaDireccion] // Añadir la nueva dirección
                    }
                })),


                // Función para actualizar una dirección existente por la calle
                updateDireccion: (index, direccionActualizada) => set(state => ({
                    cliente: {
                        ...state.cliente,
                        direcciones: state.cliente.direcciones.map((direccion, idx) =>
                            idx === index ? { ...direccion, ...direccionActualizada } : direccion
                        )
                    }
                })),                
                // Función para eliminar una dirección por la calle
                deleteDireccion: (index) => set(state => ({
                    cliente: {
                        ...state.cliente,
                        direcciones: state.cliente.direcciones.filter((_, idx) => idx !== index)
                    }
                })),

                setPrecioMasAlto: (precio) => set({ PrecioMasAlto: precio }),

                setProducto: (producto) => set({ Producto: producto })
    };
});
export default useGlobaStore;
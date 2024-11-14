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
                accessToken: '',
                refreshToken: '',
                cliente: {},
                pedido:{
                    metodoPago:{tipo:'', datos:{} }, //<--- objeto {tipo,datos}
                    itemsPedido:[], //<--- para el carrito
                    comprarYa:{}, //<--- objeto {producto,cantidad}
                    subtotal:0,
                    gastosEnvio:0,
                    total:0,
                },
                setAccessToken: jwt => set(state => ({ ...state, accessToken: jwt })),
                setRefreshToken: jwt => set(state => ({ ...state, refreshToken: jwt })),                
                //esto estaria mal, pq estas mutando  el objeto cliente y apunta a la misma referencia en ram...no estas construyendo uno nuevo!!!
                // setCuentaCliente: (datosCuenta)=>set( 
                //                                         state=> {
                //                                             const {email,nombre,apellidos,activada,imagenAvatar,nick}=datosCuenta;                                                        
                //                                             return state.cliente.cuenta={ email,nombre,apellidos,activada,imagenAvatar,nick}
                //                                             }
                //                                         )
                setCliente: datoscliente => set(state => ( { ...state, cliente: { ...state.cliente, ...datoscliente } } )),
                setPedido: (actualizaciones) => set(state => ({pedido: {...state.pedido, ...actualizaciones}}))
                






            }
    }

);


export default useGlobaStore;
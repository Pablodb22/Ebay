import './Layout.css'
import { Outlet, useLoaderData } from 'react-router-dom'

import Header from './headerComponent/Header'
import Footer from './footerComponent/Footer'

function Layout(){
    /*
    OUTLET -> se utiliza como un marcador de posición para renderizar los componentes secundarios de una ruta anidada (app.js -> children)
    */
    const _categorias=useLoaderData(); //<---- en la variable _categorias recupero el resultado de la ejecucion de la funcion asincrona del loader (restTienda.DevolverCategorias,)
    return (
        <>
            <Header categorias={_categorias} ></Header> 
                <div className='container-fluid'>
                    <div className='row'>
                        <div className='col'>
                            <Outlet></Outlet> 
                        </div>
                    </div>
                </div>
            <Footer></Footer>
        </>
    )
}

export default Layout
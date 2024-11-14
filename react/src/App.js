import './App.css';
import { createBrowserRouter,Navigate,RouterProvider } from 'react-router-dom';
import Login from './componentes/ZonaCliente/Login/Login';
import Register from './componentes/ZonaCliente/Registro/Register';
import Productos from './componentes/ZonaTienda/productosComponent/Productos';
import MostrarProducto from './componentes/ZonaTienda/mostrarProductoComponent/MostrarProducto';
import Layout from './componentes/ZonaTienda/layoutComponent/Layout';
import restTienda from './servicios/restServiceTienda';
import Principal from './componentes/ZonaTienda/principalComponent/Principal';
import ComprarYa from './componentes/ZonaTienda/comprarProductoYaComponent/comprarYa';
import FormularioEnvio from './componentes/ZonaTienda/cogerDireccionComponent/cogerDireccion';

//aray de objetos route a pasar al metodo createBrowserRourer(...) cada objeto Route representa la carga de un componente ante una URL del navegador
const _routerObjecto=createBrowserRouter(
    [
        {
          element: <Layout></Layout>, //llama al elemento layout el cual renderiza el header y footer
          loader: restTienda.DevolverCategorias, //el cual tendra un loader que devolvera categorias
          children:[ 
            { path:'/', element: <Principal></Principal>},//<Navigate to='/Tienda/Productos'/>},  //devolvera el principal de la pagina el body
            { path:'/Tienda/Productos/:catId', element: <Productos></Productos>,loader: restTienda.RecuperarProductosFromCat }, //devolvera productos de cada categoria con su loader correspondiente
                                // catId: lo sacas en la linea 133 de Header                                    
            { path: '/Tienda/MostrarProducto/:idProd', element: <MostrarProducto></MostrarProducto>, loader: restTienda.RecuperarProducto } //mostrar el contenido del producto (precio,imagenes,...) con su loader correspondiente
                                        // idProd: lo sacas en la linea 94 de Productos
          ]
    
        },
        {path:'/Tienda/Direccion',element:<FormularioEnvio/>},
        //{ path: '/Tienda/ComprarYa/:idProd', element: <ComprarYa></ComprarYa>, loader: restTienda.RecuperarProducto },  <-- asi estba antes
        { path: '/Tienda/ComprarYa', element: <ComprarYa></ComprarYa>, loader: restTienda.RecuperarProducto },
                                  //idProd en la linea 66 de MostrarProducto
        { path: '/Cliente/Login', element: <Login></Login> }, //llama al login
        { path: '/Cliente/Registro', element: <Register></Register>} //llama al registro
    
      ]
    );
function App(){

  
    return(
        <>
        <RouterProvider router={_routerObjecto}/> 
        </>
    )
}
export default App;
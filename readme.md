# 🛒 eBay Clone - Plataforma de Compra y Venta Online

¡Bienvenido a tu propio eBay! Esta aplicación web full stack te permite comprar, vender y gestionar productos de forma sencilla y segura, inspirada en la experiencia de eBay pero desarrollada desde cero con tecnologías modernas.

---

## 🚀 Funcionalidades Principales

- **Registro y Login Seguro**  
  Autenticación con validación, activación por email y protección JWT.

- **Gestión de Usuario**  
  Edita tu perfil, direcciones, preferencias y seguridad desde un panel intuitivo.

- **Explora y Filtra Productos**  
  Busca por categorías, estado, formato de compra y mucho más.

- **Compra y Venta de Productos**  
  Añade productos, realiza compras, pujas y gestiona tus pedidos.

- **Pagos Online Integrados**  
  Soporte para Stripe, PayPal y Google Pay.

- **Notificaciones y Emails Automáticos**  
  Recibe alertas de actividad, confirmaciones y recordatorios.

- **Geolocalización Inteligente**  
  Selecciona provincias y municipios de España gracias a un microservicio dedicado.

---

## 🛠️ Tecnologías Utilizadas

### Backend (`ebay__nodejs`)
- **Node.js** + **Express**  
- **MongoDB** (NoSQL)  
- **JWT** para autenticación  
- **Stripe & PayPal SDK**  
- **Google APIs** (envío de emails)  
- **bcrypt**, **dotenv**, **CORS**

### Frontend (`ebay__react`)
- **React 18**  
- **React Router**  
- **Zustand** (gestión de estado)  
- **Bootstrap 5**  
- **Fetch API**

### Microservicio de Geolocalización (`geoApi_nodejs_microservice`)
- **Node.js** + **Express**  
- **MongoDB**  
- **JWT**

---

## 📁 Estructura del Proyecto

```
/ebay__nodejs                # Backend principal (API, lógica, pagos, emails)
/ebay__react                 # Frontend en React (SPA)
/geoApi_nodejs_microservice  # Microservicio de provincias y municipios
```

---

## ⚡ Cómo Empezar

1. Clona el repositorio y entra en cada carpeta.
2. Instala dependencias:  
   `npm install`
3. Configura tus variables de entorno (`.env`).
4. Inicia backend y microservicio:  
   `node server2.js` y `node server.js`
5. Inicia el frontend:  
   `npm start` en `ebay__react`
6. ¡Listo! Accede en [http://localhost:3000](http://localhost:3000)

---

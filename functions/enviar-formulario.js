const nodemailer = require('nodemailer');
const { ConfidentialClientApplication } = require('@azure/msal-node'); // Usamos MSAL para Azure AD
require('dotenv').config();

// Configuración de Azure AD
const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID, // ID de la aplicación
        authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`, // Tenant ID
        clientSecret: process.env.CLIENT_SECRET, // Secreto de la aplicación
    },
};

// Crear una instancia de MSAL
const cca = new ConfidentialClientApplication(msalConfig);

// Función para obtener un Access Token usando el Refresh Token
async function getAccessToken() {
    try {
        const tokenResponse = await cca.acquireTokenByRefreshToken({
            refreshToken: process.env.REFRESH_TOKEN,
            scopes: ['https://graph.microsoft.com/.default'], // Scopes para Microsoft Graph API
        });

        console.log('Access Token obtenido:', tokenResponse.accessToken);
        return tokenResponse.accessToken;
    } catch (error) {
        console.error('Error al obtener el Access Token:', error);
        throw error;
    }
}

// Función principal de Netlify
exports.handler = async (event, context) => {
    // Manejar solicitudes CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ message: 'CORS preflight successful' }),
        };
    }

    // Solo permitir solicitudes POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Método no permitido' }),
        };
    }

    // Parsear el cuerpo de la solicitud
    const { nombre, email, mensaje } = JSON.parse(event.body);

    // Validar campos obligatorios
    if (!nombre || !email || !mensaje) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Faltan campos obligatorios' }),
        };
    }

    try {
        // Obtener el Access Token
        const accessToken = await getAccessToken();

        // Configurar el transportador de Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'outlook',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER, // Tu correo de Outlook
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken, // Access Token obtenido dinámicamente
            },
        });

        // Configurar las opciones del correo
        const mailOptions = {
            from: process.env.EMAIL_USER, // Remitente
            to: 'Contacto@PruebasOMRTech.onmicrosoft.com', // Alias
            subject: `Nuevo mensaje de contacto de ${nombre}`,
            text: `Nombre: ${nombre}\nEmail: ${email}\nMensaje: ${mensaje}`,
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);

        // Respuesta exitosa
        return {
            statusCode: 200,
            body: JSON.stringify({ mensaje: 'Correo enviado correctamente' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
    } catch (error) {
        console.error('Error enviando el correo:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error al enviar el correo' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
    }
};
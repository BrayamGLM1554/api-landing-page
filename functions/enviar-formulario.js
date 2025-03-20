const axios = require('axios');
const { ConfidentialClientApplication } = require('@azure/msal-node');
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

        // Configurar las opciones del correo
        const mailOptions = {
            message: {
                subject: `Nuevo mensaje de contacto de ${nombre}`,
                body: {
                    contentType: 'Text',
                    content: `Nombre: ${nombre}\nEmail: ${email}\nMensaje: ${mensaje}`,
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: 'omrtech@omrtech.onmicrosoft.com', // Alias
                        },
                    },
                ],
            },
        };

        // Enviar el correo usando Microsoft Graph API
        const response = await axios.post(
            'https://graph.microsoft.com/v1.0/me/sendMail', // Usar /me para el usuario autenticado
            mailOptions,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('Correo enviado:', response.data);

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
        console.error('Error enviando el correo:', error.response ? error.response.data : error.message);
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
const axios = require('axios');
const { ConfidentialClientApplication } = require('@azure/msal-node');
require('dotenv').config();

// Configuración de Azure AD
const config = {
    auth: {
        clientId: process.env.CLIENT_ID, // ID de la aplicación
        authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`, // Tenant ID
        clientSecret: process.env.CLIENT_SECRET, // Contraseña de la aplicación
    },
};

// Crear una instancia de MSAL
const cca = new ConfidentialClientApplication(config);

// Obtener un nuevo Access Token usando el Refresh Token
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

// Enviar un correo usando Microsoft Graph API
async function sendMail() {
    try {
        const accessToken = await getAccessToken();

        const mailOptions = {
            message: {
                subject: 'Asunto del correo',
                body: {
                    contentType: 'Text',
                    content: 'Contenido del correo',
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: 'Contacto@PruebasOMRTech.onmicrosoft.com', // Reemplaza con el correo del destinatario
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
                },
            }
        );

        console.log('Correo enviado:', response.data);
    } catch (error) {
        console.error('Error al enviar el correo:', error.response ? error.response.data : error.message);
    }
}

// Llamar a la función para enviar el correo
sendMail();
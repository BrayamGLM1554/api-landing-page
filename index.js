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
    console.log('Token obtenido:', accessToken);
    try {
        const accessToken = await getAccessToken();

        const mailOptions = {
            message: {
                subject: `Nuevo mensaje de contacto de ${nombre}`,
                body: {
                    contentType: 'Text',
                    content: `Nombre: ${nombre}\nEmail: ${email}\nMensaje: ${mensaje}`,
                },
                from: {
                    emailAddress: {
                        address: process.env.FROM_EMAIL, // Alias o correo del remitente
                    },
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: 'destinatario@dominio.com', // Reemplaza con el destinatario real
                        },
                    },
                ],
            },
        };

        // Enviar el correo usando Microsoft Graph API
        const response = await axios.post(
            `https://graph.microsoft.com/v1.0/users/${process.env.SENDER_EMAIL}/sendMail`,
            mailOptions,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('Correo enviado:', response.data);
    } catch (error) {
        console.error('Error enviando el correo:', error.response?.data || error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.response?.data || 'Error desconocido al enviar el correo' }),
        };
    }
}

// Llamar a la función para enviar el correo
sendMail();
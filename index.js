const axios = require('axios');
const { ConfidentialClientApplication } = require('@azure/msal-node');
require('dotenv').config();

// Configuración de Azure AD
const config = {
    auth: {
        clientId: process.env.CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
        clientSecret: process.env.CLIENT_SECRET,
    },
};

// Crear una instancia de MSAL
const cca = new ConfidentialClientApplication(config);

// Obtener un nuevo Access Token
async function getAccessToken() {
    try {
        const tokenResponse = await cca.acquireTokenByClientCredential({
            scopes: ['https://graph.microsoft.com/.default'],
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
        const accessToken = await getAccessToken(); // 🔹 Aquí obtenemos el token correctamente

        const mailOptions = {
            message: {
                subject: 'Asunto del correo',
                body: {
                    contentType: 'Text',
                    content: 'Contenido del correo',
                },
                from: {
                    emailAddress: {
                        address: process.env.FROM_EMAIL, // Alias o correo del remitente
                    },
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: 'omrtech@omrtech.onmicrosoft.com', // Reemplaza con el destinatario real
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
        console.error('Error al enviar el correo:', error.response ? error.response.data : error.message);
    }
}

// Llamar a la función para enviar el correo
sendMail();

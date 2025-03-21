const axios = require('axios');
const { ConfidentialClientApplication } = require('@azure/msal-node');
require('dotenv').config();

// Configuración de Azure AD
const msalConfig = {
    auth: {
        clientId: process.env.CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
        clientSecret: process.env.CLIENT_SECRET,
    },
};

// Crear una instancia de MSAL
const cca = new ConfidentialClientApplication(msalConfig);

// Obtener el Access Token
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

// Función principal de Netlify
exports.handler = async (event, context) => {
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

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Método no permitido' }),
        };
    }

    const { nombre, email, mensaje } = JSON.parse(event.body);

    if (!nombre || !email || !mensaje) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Faltan campos obligatorios' }),
        };
    }

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
                        address: 'Contacto@omrtech.onmicrosoft.com', // Alias o correo del remitente
                    },
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: 'omrtech@omrtech.onmicrosoft.com',
                        },
                    },
                ],
            },
        };

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
            body: JSON.stringify({ error: error.response ? error.response.data : 'Error desconocido al enviar el correo' }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
    }
};

const nodemailer = require('nodemailer');
const { google } = require('googleapis'); // Necesitas instalar el paquete `googleapis`

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID, // ID de la aplicación
    process.env.CLIENT_SECRET, // Secreto de cliente
    process.env.REDIRECT_URI // URI de redirección
);

exports.handler = async (event, context) => {
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
        // Obtener el access token de manera dinámica
        const accessToken = await oauth2Client.getAccessToken();
        
        const transporter = nodemailer.createTransport({
            service: 'outlook',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN, // El refresh token sigue siendo necesario para obtener un access token
                accessToken: accessToken.token, // El access token que se obtuvo dinámicamente
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER, // Remitente
            to: 'Contacto@PruebasOMRTech.onmicrosoft.com', // Alias
            subject: `Nuevo mensaje de contacto de ${nombre}`,
            text: `Nombre: ${nombre}\nEmail: ${email}\nMensaje: ${mensaje}`,
        };

        await transporter.sendMail(mailOptions);

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

const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    // Manejar solicitudes OPTIONS para CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: '',
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Método no permitido' }),
        };
    }

    const { nombre, email, mensaje } = JSON.parse(event.body);

    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `Nuevo mensaje de contacto de ${nombre}`,
        text: `Nombre: ${nombre}\nEmail: ${email}\nMensaje: ${mensaje}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Permitir peticiones desde cualquier origen
            },
            body: JSON.stringify({ mensaje: 'Correo enviado correctamente' }),
        };
    } catch (error) {
        console.error('Error enviando el correo:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*', // Permitir peticiones desde cualquier origen
            },
            body: JSON.stringify({ error: 'Error al enviar el correo' }),
        };
    }
};

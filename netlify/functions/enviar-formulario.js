const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    // Solo permitir solicitudes POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Método no permitido' }),
        };
    }

    const { nombre, email, mensaje } = JSON.parse(event.body);

    // Validar campos obligatorios
    if (!nombre || !email || !mensaje) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Faltan campos obligatorios' }),
        };
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER, // Usar variable de entorno
            pass: process.env.EMAIL_PASS, // Usar variable de entorno
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
            body: JSON.stringify({ mensaje: 'Correo enviado correctamente' }),
            headers: {
                'Access-Control-Allow-Origin': '*', // Permitir todas las solicitudes CORS
                'Access-Control-Allow-Methods': 'OPTIONS,POST', // Métodos permitidos
                'Access-Control-Allow-Headers': 'Content-Type', // Cabeceras permitidas
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
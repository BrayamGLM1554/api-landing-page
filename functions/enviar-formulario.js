const express = require('express');
const serverless = require('serverless-http');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuración del transporte SMTP (Microsoft 365)
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER, // Usar variable de entorno
        pass: process.env.EMAIL_PASS, // Usar variable de entorno
    },
});

// Ruta para enviar el formulario
app.post('/enviar-formulario', async (req, res) => {
    const { nombre, email, mensaje } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `Nuevo mensaje de contacto de ${nombre}`,
        text: `Nombre: ${nombre}\nEmail: ${email}\nMensaje: ${mensaje}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ mensaje: 'Correo enviado correctamente' });
    } catch (error) {
        console.error('Error enviando el correo:', error);
        res.status(500).json({ error: 'Error al enviar el correo' });
    }
});

module.exports.handler = serverless(app);

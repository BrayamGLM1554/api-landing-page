const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config(); // Cargar variables de entorno

const app = express();
app.use(cors());
app.use(express.json());

// Configuración del transporte SMTP (Microsoft 365)
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com', // Servidor SMTP de Microsoft 365
    port: 587, // Puerto
    secure: false, // Usar STARTTLS
    auth: {
        user: process.env.EMAIL_USER, // Usar variable de entorno
        pass: process.env.EMAIL_PASS, // Usar variable de entorno
    },
});

// Endpoint para recibir los datos del formulario y enviar el correo
app.post('/enviar-formulario', async (req, res) => {
    const { nombre, email, mensaje } = req.body;

    // Validar campos obligatorios
    if (!nombre || !email || !mensaje) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Configuración del correo
    const mailOptions = {
        from: process.env.EMAIL_USER, // Remitente
        to: process.env.EMAIL_USER, // Destinatario
        subject: `Nuevo mensaje de contacto de ${nombre}`, // Asunto
        text: `Nombre: ${nombre}\nEmail: ${email}\nMensaje: ${mensaje}`, // Cuerpo del correo
    };

    try {
        // Enviar el correo
        await transporter.sendMail(mailOptions);
        res.status(200).json({ mensaje: 'Correo enviado correctamente' });
    } catch (error) {
        console.error('Error enviando el correo:', error);
        res.status(500).json({ error: 'Error al enviar el correo' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 4000; // Puerto para la API
app.listen(PORT, () => {
    console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});
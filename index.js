const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración del transporte SMTP (Microsoft 365)
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com', // Servidor SMTP de Microsoft 365
    port: 587, // Puerto
    secure: false, // Usar STARTTLS
    auth: {
        user: 'BrayamLopezMorales@PruebasOMRTech.onmicrosoft.com', // Tu dirección de correo principal
        pass: 'BrayamLM155478', // Tu contraseña
    },
});

// Endpoint para recibir los datos del formulario y enviar el correo
app.post('/enviar-formulario', async (req, res) => {
    const { nombre, email, mensaje } = req.body;

    // Configuración del correo
    const mailOptions = {
        from: 'brayamlopezmorales@pruebasomrtech.onmicrosoft.com', // Usa el alias como remitente
        to: 'BrayamLopezMorales@PruebasOMRTech.onmicrosoft.com', // Destinatario (tu correo principal)
        subject: `Nuevo mensaje de contacto de ${nombre}`, // Asunto
        text: `Este es un mensaje de prueba enviado desde el alias.\n Nombre: ${nombre}\nEmail: ${email}\nMensaje: ${mensaje}`, // Cuerpo del correo
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
const PORT = 4000; // Puerto para la API
app.listen(PORT, () => {
    console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});
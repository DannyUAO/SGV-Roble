// server/servicios/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

/**
 * Envía correo al residente cuando un visitante ingresa al edificio.
 */
async function notificarIngreso({ correoResidente, nombreResidente, apartamento, visitante, documento, vigilante, horaIngreso }) {
  const hora = new Date(horaIngreso).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'short',
    timeStyle: 'short',
  });

  await transporter.sendMail({
    from: `"SGV Roble" <${process.env.GMAIL_USER}>`,
    to: correoResidente,
    subject: `Visitante en camino a su apartamento ${apartamento}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
        <div style="background:#1a1a2e;padding:20px 24px;">
          <h2 style="color:#fff;margin:0;">🏢 SGV Roble</h2>
          <p style="color:#aaa;margin:4px 0 0;">Sistema de Gestión de Visitantes</p>
        </div>
        <div style="padding:24px;">
          <p style="font-size:15px;">Estimado/a <strong>${nombreResidente}</strong>,</p>
          <p style="font-size:15px;">Le informamos que el siguiente visitante ha ingresado al edificio con destino a su apartamento:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr style="background:#f5f5f5;">
              <td style="padding:10px 14px;font-weight:600;">Visitante</td>
              <td style="padding:10px 14px;">${visitante}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-weight:600;">Documento</td>
              <td style="padding:10px 14px;">${documento}</td>
            </tr>
            <tr style="background:#f5f5f5;">
              <td style="padding:10px 14px;font-weight:600;">Apartamento</td>
              <td style="padding:10px 14px;">${apartamento}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;font-weight:600;">Hora de ingreso</td>
              <td style="padding:10px 14px;">${hora}</td>
            </tr>
            <tr style="background:#f5f5f5;">
              <td style="padding:10px 14px;font-weight:600;">Registrado por</td>
              <td style="padding:10px 14px;">${vigilante}</td>
            </tr>
          </table>
          <p style="font-size:13px;color:#888;">Si no esperaba esta visita, comuníquese con la portería.</p>
        </div>
        <div style="background:#f5f5f5;padding:12px 24px;text-align:center;">
          <p style="font-size:12px;color:#aaa;margin:0;">SGV Roble · Notificación automática</p>
        </div>
      </div>
    `,
  });
}

module.exports = { notificarIngreso };

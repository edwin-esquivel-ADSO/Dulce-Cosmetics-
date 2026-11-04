import nodemailer from "nodemailer";

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export interface SendWelcomeEmailParams {
  toEmail: string;
  userName: string;
  role?: string;
}

/**
 * Envía un correo elegante de bienvenida a la plataforma Dulce Cosmetics
 */
export async function sendWelcomeEmail({ toEmail, userName, role = "ADMIN" }: SendWelcomeEmailParams) {
  const emailFrom = process.env.EMAIL_FROM || "Dulce Cosmetics <contacto@dulcecosmetics.com>";
  const emailServer = process.env.EMAIL_SERVER;

  const safeUserName = escapeHtml(userName);
  const safeToEmail = escapeHtml(toEmail);
  const safeRole = role === "ADMIN" ? "Administrador Principal" : "Sub-Administrador";

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a Dulce Cosmetics</title>
      <style>
        body { margin: 0; padding: 0; background-color: #faf9f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1c1c; }
        .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #ebdcdc; box-shadow: 0 10px 30px rgba(123, 84, 85, 0.08); }
        .header { background: linear-gradient(135deg, #7b5455 0%, #523536 100%); padding: 40px 30px; text-align: center; color: #ffffff; }
        .brand-title { font-family: 'Georgia', serif; font-size: 28px; font-weight: bold; letter-spacing: 2px; margin: 0; color: #ffdad9; }
        .brand-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 4px; color: #f1ca50; margin-top: 6px; font-weight: 600; }
        .content { padding: 36px 32px; line-height: 1.6; }
        .greeting { font-size: 20px; font-weight: bold; color: #7b5455; margin-top: 0; }
        .badge { display: inline-block; padding: 4px 12px; background-color: #f4c2c2; color: #734e4e; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        .card { background-color: #fcf9f9; border-left: 4px solid #7b5455; padding: 18px 20px; border-radius: 0 12px 12px 0; margin: 24px 0; font-size: 14px; }
        .cta-btn { display: inline-block; background-color: #7b5455; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 30px; font-weight: bold; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; margin: 20px 0; box-shadow: 0 4px 15px rgba(123, 84, 85, 0.3); }
        .footer { background-color: #1a1c1c; padding: 24px; text-align: center; color: #dadada; font-size: 12px; }
        .footer a { color: #f1ca50; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="brand-title">Dulce Cosmetics</h1>
          <div class="brand-sub">Editorial Luxe • Neiva, Huila</div>
        </div>
        <div class="content">
          <div class="badge">Acceso de Administración Confirmado</div>
          <h2 class="greeting">¡Hola, ${safeUserName}! 🌸</h2>
          <p>Te damos la más cálida bienvenida a la plataforma oficial de <strong>Dulce Cosmetics</strong>.</p>
          <p>Tu cuenta ha sido vinculada exitosamente con permisos de <strong>${safeRole}</strong>. Ya tienes acceso integral para gestionar el catálogo de belleza, monitorear los pedidos en Neiva y administrar el inventario en tiempo real.</p>
          
          <div class="card">
            <strong>Detalles de tu cuenta:</strong><br>
            • Correo vinculado: <strong>${safeToEmail}</strong><br>
            • Rol asignado: <strong>${safeRole}</strong><br>
            • Ubicación sede: <strong>Neiva, Huila (Barrio Las Granjas)</strong>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin" class="cta-btn">
              Ir al Panel de Control →
            </a>
          </div>

          <p style="font-size: 13px; color: #706565;">Si tienes alguna duda con respecto a la operación en tienda o soporte de entregas locales, contáctanos a través de la línea directa de WhatsApp (+57 317 778 0413).</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Dulce Cosmetics • Neiva, Colombia</p>
          <p>Belleza seleccionada y formulada para nuestro clima.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Modo seguro si no hay servidor SMTP configurado aún
  if (!emailServer) {
    console.log(`[Email Mock] Servidor SMTP no configurado. Simulación de bienvenida enviada a: ${toEmail}`);
    console.log(`[Email Mock] Asunto: ¡Bienvenido(a) a Dulce Cosmetics, ${userName}! ✨`);
    return {
      success: true,
      message: "Correo simulado registrado en consola (EMAIL_SERVER pendiente en .env.local)",
    };
  }

  try {
    const transporter = nodemailer.createTransport(emailServer);
    const info = await transporter.sendMail({
      from: emailFrom,
      to: toEmail,
      subject: `¡Bienvenido(a) a Dulce Cosmetics, ${userName}! ✨`,
      html: htmlContent,
    });

    console.log(`[Email Success] Correo de bienvenida enviado a ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, message: "Correo de bienvenida enviado exitosamente." };
  } catch (error: any) {
    console.error("[Email Error] Fallo al enviar correo de bienvenida:", error);
    return { success: false, message: error?.message || "Error al despachar el correo." };
  }
}

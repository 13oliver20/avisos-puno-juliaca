import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Chamba Al Toque <onboarding@resend.dev>';

// Lazy client initialization so missing API key doesn't throw at import time
const getResendClient = () => {
  if (!resendApiKey) return null;
  return new Resend(resendApiKey);
};

export interface RegistrationEmailParams {
  to: string;
  firstName: string;
  lastName: string;
  email: string;
  loginUrl: string;
}

export interface PasswordResetNotificationParams {
  to: string;
  firstName?: string;
  email: string;
}

/**
 * Correo #1: Confirmación de Registro
 * Enviado tras crear la cuenta exitosamente vía /api/register
 * Muestra credenciales (Nombres y Correo, NUNCA la contraseña) e incluye la URL de login.
 */
export async function sendRegistrationEmail({
  to,
  firstName,
  lastName,
  email,
  loginUrl
}: RegistrationEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const fullName = `${firstName} ${lastName}`.trim();

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a Chamba Al Toque</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .box { background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0; }
        .box-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #166534; letter-spacing: 0.5px; margin-bottom: 10px; }
        .data-row { font-size: 14px; margin: 6px 0; color: #334155; }
        .data-row strong { color: #0f172a; }
        .cta-btn { display: inline-block; background-color: #059669; color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 12px; text-decoration: none; text-align: center; margin-top: 10px; box-shadow: 0 2px 4px rgba(5,150,105,0.2); }
        .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ChambaAlToque</h1>
          <p>Avisos Clasificados de Empleo • Puno & Juliaca</p>
        </div>
        <div class="content">
          <div class="greeting">¡Bienvenido a bordo, ${firstName}!</div>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            Tu cuenta ha sido creada exitosamente. Ahora puedes publicar ofertas de empleo, gestionar postulantes de Puno y Juliaca y conectar directamente por WhatsApp con trabajadores de oficios, gastronomía, construcción y comercio.
          </p>

          <div class="box">
            <div class="box-title">Datos de tu cuenta registrada:</div>
            <div class="data-row"><strong>Nombre completo:</strong> ${fullName}</div>
            <div class="data-row"><strong>Correo de acceso:</strong> ${email}</div>
            <div class="data-row" style="margin-top: 10px; font-size: 12px; color: #166534;">
              🔒 <em>Por estrictas razones de seguridad, tu contraseña nunca se muestra por correo electrónico.</em>
            </div>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${loginUrl}" class="cta-btn" target="_blank">Iniciar Sesión en tu Panel</a>
          </div>

          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
            <a href="${loginUrl}" style="color: #059669; word-break: break-all;">${loginUrl}</a>
          </p>
        </div>
        <div class="footer">
          <p style="margin: 0;">Chamba Al Toque • Digitalización de Clasificados de Empleo</p>
          <p style="margin: 4px 0 0;">Puno y Juliaca, Perú</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const resend = getResendClient();
    if (!resend) {
      console.log('[Resend Simulation] No RESEND_API_KEY found. Simulated email payload:', {
        to,
        subject: '¡Bienvenido a Chamba Al Toque! Tu cuenta ha sido creada con éxito',
        loginUrl
      });
      return { success: true, id: 'simulated-resend-id' };
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: '¡Bienvenido a Chamba Al Toque! Tu cuenta ha sido creada con éxito',
      html: htmlContent
    });

    if (error) {
      console.error('Error sending registration email via Resend:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('Exception in sendRegistrationEmail:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Correo #3: Confirmación de Cambio de Clave
 * Enviado tras actualizar la contraseña exitosamente vía /api/notify-reset
 * Alerta de seguridad notificando que la contraseña fue cambiada correctamente.
 */
export async function sendPasswordResetNotification({
  to,
  firstName,
  email
}: PasswordResetNotificationParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const name = firstName || 'Estimado Usuario';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tu contraseña ha sido modificada</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
        .content { padding: 32px 28px; }
        .alert-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #1e40af; }
        .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Seguridad de tu Cuenta</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #94a3b8;">Chamba Al Toque</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; font-weight: 700; color: #0f172a;">Hola, ${name}:</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">
            Te confirmamos que la contraseña asociada a tu cuenta <strong>${email}</strong> ha sido restablecida y actualizada correctamente.
          </p>

          <div class="alert-box">
            <strong>¿Fuiste tú?</strong> Si realizaste este cambio, no necesitas hacer nada más. Ya puedes iniciar sesión con tu nueva clave.
          </div>

          <p style="font-size: 13px; line-height: 1.6; color: #dc2626;">
            <strong>⚠️ ¿No fuiste tú?</strong> Si no solicitaste este cambio, tu cuenta podría estar comprometida. Por favor solicita de inmediato una nueva recuperación de contraseña desde nuestra plataforma o contáctanos a soporte.
          </p>
        </div>
        <div class="footer">
          <p style="margin: 0;">Chamba Al Toque • Seguridad y Notificaciones</p>
          <p style="margin: 4px 0 0;">Puno y Juliaca, Perú</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const resend = getResendClient();
    if (!resend) {
      console.log('[Resend Simulation] No RESEND_API_KEY found. Simulated password reset email:', {
        to,
        subject: 'Seguridad Chamba Al Toque: Tu contraseña ha sido actualizada'
      });
      return { success: true, id: 'simulated-resend-id' };
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: 'Seguridad Chamba Al Toque: Tu contraseña ha sido actualizada',
      html: htmlContent
    });

    if (error) {
      console.error('Error sending password reset notification via Resend:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('Exception in sendPasswordResetNotification:', err);
    return { success: false, error: err.message };
  }
}

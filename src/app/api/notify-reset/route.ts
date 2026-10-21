import { NextResponse } from 'next/server';
import { sendPasswordResetNotification } from '@/lib/emailService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName } = body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Correo electrónico inválido.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Enviar Correo #3 vía Resend
    const result = await sendPasswordResetNotification({
      to: cleanEmail,
      firstName: firstName || '',
      email: cleanEmail
    });

    return NextResponse.json({
      success: true,
      message: 'Notificación de cambio de contraseña enviada exitosamente por correo.',
      emailSent: result.success
    });

  } catch (err: any) {
    console.error('Error in /api/notify-reset:', err);
    return NextResponse.json(
      { error: err.message || 'Error al enviar notificación de reseteo.' },
      { status: 500 }
    );
  }
}

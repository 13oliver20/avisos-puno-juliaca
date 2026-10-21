import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { sendRegistrationEmail } from '@/lib/emailService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    // 1. Validaciones de Backend
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json(
        { error: 'Nombres y apellidos son requeridos.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Por favor ingresa un correo electrónico válido.' },
        { status: 400 }
      );
    }

    // Validación de robustez de contraseña
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres.' },
        { status: 400 }
      );
    }

    const hasNumber = /\d/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    if (!hasNumber || !hasUpper) {
      return NextResponse.json(
        { error: 'La contraseña debe contener al menos un número y una letra mayúscula.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const fullName = `${cleanFirstName} ${cleanLastName}`;

    let userId = `user-${Date.now()}`;

    // 2. Registro con Supabase Auth si está configurado
    if (isSupabaseConfigured()) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            first_name: cleanFirstName,
            last_name: cleanLastName,
            full_name: fullName,
            role: 'anunciante'
          }
        }
      });

      if (authError) {
        console.error('Supabase Auth error:', authError);
        return NextResponse.json(
          { error: authError.message || 'Error al crear la cuenta en Supabase.' },
          { status: 400 }
        );
      }

      if (authData.user) {
        userId = authData.user.id;
      }
    }

    // 3. Obtener URL base de la aplicación para el enlace de inicio de sesión
    const requestUrl = new URL(request.url);
    const origin = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
    const loginUrl = `${origin}/login`;

    // 4. Enviar Correo #1 vía Resend
    const emailResult = await sendRegistrationEmail({
      to: cleanEmail,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      email: cleanEmail,
      loginUrl: loginUrl
    });

    return NextResponse.json({
      success: true,
      message: 'Cuenta creada exitosamente. Se ha enviado un correo de bienvenida.',
      emailSent: emailResult.success,
      user: {
        id: userId,
        email: cleanEmail,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        fullName: fullName
      }
    });

  } catch (err: any) {
    console.error('Unhandled error in /api/register:', err);
    return NextResponse.json(
      { error: err.message || 'Error interno del servidor al registrar usuario.' },
      { status: 500 }
    );
  }
}

// app/api/cron/route.js - CRON JOB SOLO SUPABASE
import { NextResponse } from 'next/server';
import { reminderQueries } from '../../../lib/supabase';

// ✅ Headers CORS para el cron
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};


export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

// ✅ Función para enviar email a Elenita
async function sendEmailToElenita(reminder) {
  try {
    const nodemailer = require('nodemailer');

    console.log('📧 Configurando transporter para:', reminder.title);

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS   
      }
    });

    // ✅ Mensaje motivacional personalizado
    const getMessage = (title) => {
      const lower = title.toLowerCase();
      
      if (lower.includes('agua')) {
        return {
          emoji: '💧',
          title: '¡Hora de hidratarte, bella!',
          message: 'Tu cuerpo es como una flor que necesita agua para brillar. ¡Cada sorbo te hace más radiante! 🌸✨'
        };
      } else if (lower.includes('medicina') || lower.includes('pastilla')) {
        return {
          emoji: '💊',
          title: '¡Cuidar tu salud es amor propio!',
          message: 'Eres una guerrera que se cuida con amor. Cada pastilla es un paso hacia tu bienestar. 💖'
        };
      } else if (lower.includes('comida') || lower.includes('comer')) {
        return {
          emoji: '🍽️',
          title: '¡Nutrir tu cuerpo con amor!',
          message: 'La comida es combustible para tus sueños. ¡Alimenta tu cuerpo como la reina que eres! 👑'
        };
      } else if (lower.includes('ejercicio') || lower.includes('deporte')) {
        return {
          emoji: '🏃‍♀️',
          title: '¡Tu cuerpo está listo para moverse!',
          message: 'Cada movimiento es una celebración de lo increíble que eres. ¡Dale a tu cuerpo el regalo del movimiento! 💃'
        };
      } else {
        return {
          emoji: '💖',
          title: '¡Momento especial para ti!',
          message: 'Cada recordatorio es una oportunidad para cuidarte y crecer. ¡Eres increíble! ✨'
        };
      }
    };

    const content = getMessage(reminder.title);
    const fecha = new Date(reminder.datetime).toLocaleString('es-ES');

    // ✅ Email HTML súper bonito para Elenita
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff9a9e, #fecfef); padding: 20px; border-radius: 25px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff6b6b, #ffa8a8); padding: 25px; border-radius: 20px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
            ${content.emoji} ${content.title} ${content.emoji}
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            ¡Tu recordatorio especial ha llegado!
          </p>
        </div>

        <!-- Recordatorio -->
        <div style="background: white; padding: 30px; border-radius: 20px; margin-bottom: 20px;">
          <div style="background: linear-gradient(135deg, #fff5f5, #ffeef7); padding: 20px; border-radius: 15px; margin-bottom: 20px; border-left: 5px solid #ff6b6b;">
            <h2 style="color: #ff6b6b; margin: 0 0 10px 0; font-size: 24px;">
              📝 ${reminder.title}
            </h2>
            ${reminder.description ? `
              <p style="color: #666; font-size: 16px; margin: 10px 0;">
                💬 ${reminder.description}
              </p>
            ` : ''}
            <p style="color: #888; font-size: 14px; margin: 10px 0 0 0;">
              📅 ${fecha}
            </p>
          </div>

          <!-- Mensaje motivacional -->
          <div style="background: linear-gradient(135deg, #e8f4fd, #f0e8ff); padding: 25px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
            <h3 style="color: #6366f1; margin: 0 0 15px 0; font-size: 20px;">
              💫 Mensaje Especial para Ti
            </h3>
            <p style="color: #4f46e5; font-size: 16px; line-height: 1.7; margin: 0;">
              ${content.message}
            </p>
          </div>

          <!-- Mensaje final -->
          <div style="background: linear-gradient(135deg, #ff9a9e, #fecfef); padding: 25px; border-radius: 15px; text-align: center;">
            <h3 style="color: white; margin: 0 0 15px 0; font-size: 20px; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">
              💖 Recuerda siempre 💖
            </h3>
            <p style="color: white; font-size: 16px; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); line-height: 1.6;">
              Eres fuerte, eres hermosa, eres capaz de todo lo que te propongas. 
              <br>¡Este pequeño acto de cuidado personal te acerca más a tus metas! 🚀💖
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px;">
          <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0;">
            Enviado con mucho amor desde tu app de recordatorios 💖🐝
          </p>
        </div>
      </div>
    `;

    // ✅ Enviar email
    const info = await transporter.sendMail({
      from: '"🐝 Recordatorios de Elenita 💖" <poyiyosgordos@gmail.com>',
      to: reminder.userEmail || 'jsandi12199@gmail.com',
      subject: `${content.emoji} ${content.title} - ${reminder.title}`,
      html: emailHtml
    });

    console.log('✅ Email enviado exitosamente:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw error;
  }
}

// ✅ CRON JOB PRINCIPAL - SOLO SUPABASE
export async function GET() {
  const startTime = new Date();
  console.log('🤖 [CRON] Iniciando ejecución:', startTime.toLocaleString('es-ES'));
  
  try {
    // ✅ 1. Obtener recordatorios pendientes de Supabase
    console.log('🔍 [CRON] Buscando recordatorios pendientes en Supabase...');
    
    let pendingReminders;
    try {
      pendingReminders = await reminderQueries.getPendingNotifications();
      console.log(`📬 [CRON] Encontrados ${pendingReminders.length} recordatorios pendientes`);
    } catch (supabaseError) {
      console.error('❌ [CRON] Error conectando a Supabase:', supabaseError);
      return NextResponse.json({ 
        success: false, 
        message: 'Error conectando a Supabase en cron job',
        error: supabaseError.message,
        timestamp: startTime.toISOString(),
        source: 'supabase'
      }, { 
        status: 500,
        headers: corsHeaders
      });
    }
    
    // ✅ 2. Si no hay recordatorios pendientes
    if (pendingReminders.length === 0) {
      console.log('📭 [CRON] No hay recordatorios pendientes');
      return NextResponse.json({ 
        success: true, 
        message: 'No hay recordatorios pendientes',
        timestamp: startTime.toISOString(),
        processed: 0,
        source: 'supabase'
      }, {
        headers: corsHeaders
      });
    }

    let emailsSent = 0;
    let errors = [];

    // ✅ 3. Procesar cada recordatorio
    console.log(`📋 [CRON] Procesando ${pendingReminders.length} recordatorios...`);
    
    for (const reminder of pendingReminders) {
      try {
        console.log(`📧 [CRON] Procesando: "${reminder.title}" (ID: ${reminder.id})`);
        
        // Enviar email
        await sendEmailToElenita(reminder);
        console.log(`✅ [CRON] Email enviado para: ${reminder.title}`);
        
        // Marcar como notificado en Supabase
        await reminderQueries.markAsNotified(reminder.id);
        console.log(`✅ [CRON] Marcado como notificado en Supabase: ${reminder.id}`);
        
        // Si es recurrente, crear el siguiente en Supabase
        if (reminder.recurring) {
          await reminderQueries.createNextRecurring(reminder);
          console.log(`🔄 [CRON] Siguiente recurrencia programada para: ${reminder.title}`);
        }
        
        emailsSent++;
        
      } catch (emailError) {
        const errorMsg = `${reminder.title}: ${emailError.message}`;
        console.error(`❌ [CRON] Error procesando recordatorio ${reminder.id}:`, emailError);
        errors.push(errorMsg);
      }
    }

    // ✅ 4. Respuesta final del cron job
    const endTime = new Date();
    const duration = endTime - startTime;
    
    const response = { 
      success: true, 
      message: `Cron job completado: ${emailsSent}/${pendingReminders.length} recordatorios procesados`,
      timestamp: endTime.toISOString(),
      startTime: startTime.toISOString(),
      duration: `${duration}ms`,
      processed: emailsSent,
      total: pendingReminders.length,
      source: 'supabase',
      environment: {
        isVercel: process.env.VERCEL === '1',
        isProduction: process.env.NODE_ENV === 'production'
      }
    };

    if (errors.length > 0) {
      response.errors = errors;
      response.partialSuccess = true;
      console.log(`⚠️ [CRON] Completado con errores: ${errors.length} errores`);
    } else {
      console.log(`🎉 [CRON] Completado exitosamente: ${emailsSent} emails enviados`);
    }

    return NextResponse.json(response, {
      headers: corsHeaders
    });

  } catch (error) {
    const endTime = new Date();
    const duration = endTime - startTime;
    
    console.error('❌ [CRON] Error crítico en cron job:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: 'Error crítico en cron job',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: endTime.toISOString(),
      startTime: startTime.toISOString(),
      duration: `${duration}ms`,
      source: 'supabase'
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

// ✅ Para Vercel, también manejar POST
export async function POST() {
  return GET();
}
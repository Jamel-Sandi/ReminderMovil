import { NextResponse } from 'next/server';
const nodemailer = require('nodemailer'); // Cambiar a require para evitar problemas de ES modules

export async function POST(request) {
  try {
    const { to, reminder } = await request.json();

    // Configurar transporter con las credenciales - MÉTODO COMPATIBLE
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Formatear fecha bonita
    const formattedDate = new Date(reminder.datetime).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Mensajes motivacionales personalizados según el tipo de recordatorio
    const getMotivationalMessage = (title) => {
      const lowerTitle = title.toLowerCase();
      
      if (lowerTitle.includes('agua')) {
        return {
          emoji: '💧',
          title: '¡Hora de hidratarte, bella!',
          motivation: 'Tu cuerpo es como una flor que necesita agua para brillar. ¡Cada sorbo te hace más radiante! 🌸✨',
          action: 'Toma un vaso grande de agua fresquita y siente cómo tu energía se renueva.',
          benefit: 'Tu piel te lo agradecerá y te sentirás súper fresca 💎'
        };
      } else if (lowerTitle.includes('medicina') || lowerTitle.includes('pastilla') || lowerTitle.includes('medicamento')) {
        return {
          emoji: '💊',
          title: '¡Cuidar tu salud es un acto de amor propio!',
          motivation: 'Eres una guerrera que se cuida con amor. Cada pastilla es un paso hacia tu bienestar. 💖',
          action: 'Toma tu medicamento con una sonrisa, sabiendo que estás invirtiendo en tu salud.',
          benefit: 'Tu futuro yo te agradecerá este momento de autocuidado 🌟'
        };
      } else if (lowerTitle.includes('comida') || lowerTitle.includes('comer') || lowerTitle.includes('almuerzo') || lowerTitle.includes('desayuno') || lowerTitle.includes('cena')) {
        return {
          emoji: '🍽️',
          title: '¡Es momento de nutrir tu cuerpo con amor!',
          motivation: 'La comida es combustible para tus sueños. ¡Alimenta tu cuerpo como la reina que eres! 👑',
          action: 'Prepara algo delicioso y nutritivo. Disfruta cada bocado con gratitud.',
          benefit: 'Tu energía se multiplicará y te sentirás increíble 🌈'
        };
      } else if (lowerTitle.includes('ejercicio') || lowerTitle.includes('deporte') || lowerTitle.includes('caminar') || lowerTitle.includes('correr')) {
        return {
          emoji: '🏃‍♀️',
          title: '¡Tu cuerpo está listo para moverse!',
          motivation: 'Cada movimiento es una celebración de lo increíble que eres. ¡Dale a tu cuerpo el regalo del movimiento! 💃',
          action: 'Ponte ropa cómoda, pon tu música favorita y mueve ese cuerpo hermoso.',
          benefit: 'Las endorfinas te harán sentir en las nubes ☁️✨'
        };
      } else if (lowerTitle.includes('trabajo') || lowerTitle.includes('reunión') || lowerTitle.includes('llamada')) {
        return {
          emoji: '💼',
          title: '¡Es hora de brillar profesionalmente!',
          motivation: 'Eres capaz de lograr cosas increíbles. Tu talento y dedicación te llevarán lejos. 🚀',
          action: 'Respira profundo, sonríe y demuestra de qué estás hecha.',
          benefit: 'Cada paso profesional te acerca más a tus metas 🎯'
        };
      } else if (lowerTitle.includes('dormir') || lowerTitle.includes('descansar') || lowerTitle.includes('sueño')) {
        return {
          emoji: '😴',
          title: '¡Tu cuerpo merece un descanso reparador!',
          motivation: 'El sueño es el momento en que tu cuerpo se regenera y tu mente se renueva. ¡Date este regalo! 🌙',
          action: 'Prepara un ambiente relajante, apaga las pantallas y deja que el descanso te abrace.',
          benefit: 'Mañana despertarás radiante y llena de energía 🌅'
        };
      } else if (lowerTitle.includes('estudiar') || lowerTitle.includes('leer') || lowerTitle.includes('aprender')) {
        return {
          emoji: '📚',
          title: '¡Hora de alimentar tu mente brillante!',
          motivation: 'Cada página que lees, cada cosa que aprendes te hace más poderosa. ¡El conocimiento es tu superpoder! 🧠✨',
          action: 'Encuentra un lugar cómodo, prepara una bebida rica y sumérgete en el aprendizaje.',
          benefit: 'Tu mente se expande y tus horizontes se amplían 🌟'
        };
      } else {
        return {
          emoji: '💖',
          title: '¡Momento especial para ti!',
          motivation: 'Cada recordatorio es una oportunidad para cuidarte y crecer. ¡Eres increíble! ✨',
          action: 'Tómate un momento para agradecer todo lo bueno en tu vida.',
          benefit: 'Tu bienestar es tu mayor tesoro 💎'
        };
      }
    };

    const motivationalContent = getMotivationalMessage(reminder.title);

    // Email súper motivacional y bonito para Elenita
    const emailHtml = `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ff9a9e, #fecfef, #ffeaa7); padding: 20px; border-radius: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff6b6b, #ffa8a8); padding: 25px; border-radius: 20px; text-align: center; margin-bottom: 20px; position: relative; overflow: hidden;">
          <div style="position: absolute; top: 10px; left: 20px; font-size: 20px;">🌸</div>
          <div style="position: absolute; top: 15px; right: 25px; font-size: 18px;">💖</div>
          <div style="position: absolute; bottom: 10px; left: 30px; font-size: 16px;">💕</div>
          <div style="position: absolute; bottom: 15px; right: 20px; font-size: 22px;">🐝</div>
          
          <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
            ${motivationalContent.emoji} ${motivationalContent.title} ${motivationalContent.emoji}
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            ¡Tu recordatorio especial ha llegado!
          </p>
        </div>

        <!-- Contenido principal -->
        <div style="background: white; padding: 30px; border-radius: 20px; margin-bottom: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
          
          <!-- Recordatorio -->
          <div style="background: linear-gradient(135deg, #fff5f5, #ffeef7); padding: 20px; border-radius: 15px; margin-bottom: 25px; border-left: 5px solid #ff6b6b;">
            <h2 style="color: #ff6b6b; margin: 0 0 10px 0; font-size: 24px;">
              📝 ${reminder.title}
            </h2>
            ${reminder.description ? `
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 10px 0;">
                💬 ${reminder.description}
              </p>
            ` : ''}
          </div>

          <!-- Mensaje motivacional -->
          <div style="background: linear-gradient(135deg, #e8f4fd, #f0e8ff); padding: 25px; border-radius: 15px; margin-bottom: 25px; text-align: center;">
            <h3 style="color: #6366f1; margin: 0 0 15px 0; font-size: 20px;">
              💫 Mensaje Especial para Ti
            </h3>
            <p style="color: #4f46e5; font-size: 16px; line-height: 1.7; margin: 0; font-weight: 500;">
              ${motivationalContent.motivation}
            </p>
          </div>

          <!-- Acción sugerida -->
          <div style="background: linear-gradient(135deg, #ecfdf5, #f0fdf4); padding: 20px; border-radius: 15px; margin-bottom: 25px;">
            <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">
              🎯 Tu Plan de Acción:
            </h3>
            <p style="color: #065f46; font-size: 15px; line-height: 1.6; margin: 0;">
              ${motivationalContent.action}
            </p>
          </div>

          <!-- Beneficio -->
          <div style="background: linear-gradient(135deg, #fef7ff, #faf5ff); padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 18px;">
              🌟 Tu Recompensa:
            </h3>
            <p style="color: #5b21b6; font-size: 15px; line-height: 1.6; margin: 0;">
              ${motivationalContent.benefit}
            </p>
          </div>

          <!-- Detalles del recordatorio -->
          <div style="background: #f9fafb; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">📅 Detalles de tu Recordatorio:</h3>
            <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">
              <strong>📅 Programado para:</strong> ${formattedDate}
            </p>
            ${reminder.recurring ? `
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">
                <strong>🔄 Se repite:</strong> Cada ${reminder.recurringInterval} ${
                  reminder.recurringType === 'hours' ? 'hora(s)' :
                  reminder.recurringType === 'days' ? 'día(s)' :
                  reminder.recurringType === 'weeks' ? 'semana(s)' : 'mes(es)'
                }
              </p>
            ` : ''}
          </div>

          <!-- Mensaje de ánimo -->
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
          <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">
            Enviado con mucho amor desde tu app de recordatorios 💖🐝
          </p>
          <div style="margin-top: 15px;">
            <span style="font-size: 20px; margin: 0 5px;">🌟</span>
            <span style="font-size: 24px; margin: 0 5px;">💫</span>
            <span style="font-size: 20px; margin: 0 5px;">⭐</span>
          </div>
        </div>
      </div>
    `;

    // Versión texto plano
    const emailText = `
🌸💖 ${motivationalContent.title} 💖🌸

${motivationalContent.emoji} Recordatorio: ${reminder.title}
${reminder.description ? `\n💬 ${reminder.description}` : ''}

💫 Mensaje Especial:
${motivationalContent.motivation}

🎯 Tu Plan de Acción:
${motivationalContent.action}

🌟 Tu Recompensa:
${motivationalContent.benefit}

📅 Programado para: ${formattedDate}
${reminder.recurring ? `🔄 Se repite cada ${reminder.recurringInterval} ${
  reminder.recurringType === 'hours' ? 'hora(s)' :
  reminder.recurringType === 'days' ? 'día(s)' :
  reminder.recurringType === 'weeks' ? 'semana(s)' : 'mes(es)'
}` : ''}

💖 Recuerda: Eres fuerte, eres hermosa, eres capaz de todo lo que te propongas.
¡Este pequeño acto de cuidado personal te acerca más a tus metas! 🚀💖

Enviado con mucho amor desde tu app de recordatorios 💖🐝
    `;

    // Enviar email
    const info = await transporter.sendMail({
      from: '"🐝 Recordatorios de Elenita 💖" <poyiyosgordos@gmail.com>',
      to: to,
      subject: `${motivationalContent.emoji} ${motivationalContent.title} - ${reminder.title}`,
      html: emailHtml,
      text: emailText
    });

    console.log('📧 Email motivacional enviado exitosamente:', info.messageId);

    return NextResponse.json({ 
      success: true, 
      message: 'Email súper motivacional enviado exitosamente a Elenita! 🐝💖',
      messageId: info.messageId 
    });
    
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error enviando email motivacional',
      error: error.message 
    }, { status: 500 });
  }
}
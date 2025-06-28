// app/api/reminders/route.js - API SOLO SUPABASE
import { NextResponse } from 'next/server';
import { reminderQueries, testConnection } from '../../../lib/supabase';

// ✅ Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Content-Type': 'application/json',
};

// ✅ Manejar preflight requests (OBLIGATORIO)
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// 📋 GET - Obtener todos los recordatorios (SOLO SUPABASE)
export async function GET(request) {
  console.log('🔍 GET /api/reminders - Iniciando...');
  
  try {
    // ✅ Test de conexión obligatorio
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('❌ Supabase no está disponible');
      return NextResponse.json({ 
        success: false, 
        message: 'Error de conexión con Supabase',
        error: 'No se puede conectar a la base de datos'
      }, {
        status: 503,
        headers: corsHeaders
      });
    }

    // ✅ Obtener recordatorios de Supabase
    const reminders = await reminderQueries.getAll();
    
    console.log(`✅ ${reminders.length} recordatorios obtenidos de Supabase`);
    
    return NextResponse.json({
      success: true,
      data: reminders,
      count: reminders.length,
      source: 'supabase',
      timestamp: new Date().toISOString()
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('❌ Error en GET /api/reminders:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error obteniendo recordatorios de Supabase',
      error: error.message,
      source: 'supabase'
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

// ➕ POST - Crear nuevo recordatorio (SOLO SUPABASE)
export async function POST(request) {
  console.log('➕ POST /api/reminders - Iniciando...');
  
  try {
    const reminderData = await request.json();
    console.log('📋 Datos recibidos:', {
      title: reminderData.title,
      datetime: reminderData.datetime,
      recurring: reminderData.recurring
    });
    
    // ✅ Validación de datos requeridos
    if (!reminderData.title || !reminderData.datetime) {
      return NextResponse.json({
        success: false,
        message: 'Título y fecha/hora son requeridos'
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // ✅ Test de conexión obligatorio
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('❌ Supabase no está disponible para crear');
      return NextResponse.json({ 
        success: false, 
        message: 'Error de conexión con Supabase al crear',
        error: 'No se puede conectar a la base de datos'
      }, {
        status: 503,
        headers: corsHeaders
      });
    }

    // ✅ Crear en Supabase
    const newReminder = await reminderQueries.create(reminderData);
    
    console.log('✅ Recordatorio creado en Supabase con ID:', newReminder.id);
    
    return NextResponse.json({
      success: true,
      message: 'Recordatorio creado exitosamente en Supabase',
      data: newReminder,
      source: 'supabase'
    }, { 
      status: 201,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('❌ Error en POST /api/reminders:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error creando recordatorio en Supabase',
      error: error.message,
      source: 'supabase'
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

// ✏️ PUT - Actualizar recordatorio (SOLO SUPABASE)
export async function PUT(request) {
  console.log('✏️ PUT /api/reminders - Iniciando...');
  
  try {
    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID del recordatorio es requerido'
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // ✅ Test de conexión obligatorio
    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error de conexión con Supabase al actualizar'
      }, {
        status: 503,
        headers: corsHeaders
      });
    }

    // ✅ Actualizar en Supabase
    const updatedReminder = await reminderQueries.update(id, updates);
    
    console.log('✅ Recordatorio actualizado en Supabase');

    return NextResponse.json({
      success: true,
      message: 'Recordatorio actualizado exitosamente en Supabase',
      data: updatedReminder,
      source: 'supabase'
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('❌ Error en PUT /api/reminders:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error actualizando recordatorio en Supabase',
      error: error.message
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

// 🗑️ DELETE - Eliminar recordatorio (SOLO SUPABASE)
export async function DELETE(request) {
  console.log('🗑️ DELETE /api/reminders - Iniciando...');
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID del recordatorio es requerido'
      }, { 
        status: 400,
        headers: corsHeaders
      });
    }

    // ✅ Test de conexión obligatorio
    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json({ 
        success: false, 
        message: 'Error de conexión con Supabase al eliminar'
      }, {
        status: 503,
        headers: corsHeaders
      });
    }

    // ✅ Eliminar de Supabase
    await reminderQueries.delete(id);
    
    console.log('✅ Recordatorio eliminado de Supabase');
    
    return NextResponse.json({
      success: true,
      message: 'Recordatorio eliminado exitosamente de Supabase',
      source: 'supabase'
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('❌ Error en DELETE /api/reminders:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error eliminando recordatorio de Supabase',
      error: error.message
    }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}
import { NextResponse } from 'next/server';
import { reminderQueries, testConnection } from '../../../lib/mysql';

// 📋 GET - Obtener todos los recordatorios
export async function GET(request) {
  try {
    // Probar conexión primero
    const connectionOk = await testConnection();
    if (!connectionOk) {
      // Fallback a localStorage si la BD no está disponible
      return NextResponse.json({ 
        success: false, 
        message: 'BD no disponible - usando localStorage',
        useLocalStorage: true 
      });
    }

    const reminders = await reminderQueries.getAll();
    
    return NextResponse.json({
      success: true,
      data: reminders,
      count: reminders.length
    });

  } catch (error) {
    console.error('Error obteniendo recordatorios:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error obteniendo recordatorios',
      error: error.message,
      useLocalStorage: true
    }, { status: 500 });
  }
}

// ➕ POST - Crear nuevo recordatorio
export async function POST(request) {
  try {
    const reminderData = await request.json();
    
    // Validar datos requeridos
    if (!reminderData.title || !reminderData.datetime) {
      return NextResponse.json({
        success: false,
        message: 'Título y fecha/hora son requeridos'
      }, { status: 400 });
    }

    // Probar conexión
    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json({ 
        success: false, 
        message: 'BD no disponible - usar localStorage',
        useLocalStorage: true 
      });
    }

    const newReminder = await reminderQueries.create(reminderData);
    
    return NextResponse.json({
      success: true,
      message: 'Recordatorio creado exitosamente',
      data: newReminder
    }, { status: 201 });

  } catch (error) {
    console.error('Error creando recordatorio:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error creando recordatorio',
      error: error.message,
      useLocalStorage: true
    }, { status: 500 });
  }
}

// ✏️ PUT - Actualizar recordatorio
export async function PUT(request) {
  try {
    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID del recordatorio es requerido'
      }, { status: 400 });
    }

    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json({ 
        success: false, 
        message: 'BD no disponible - usar localStorage',
        useLocalStorage: true 
      });
    }

    const updatedReminder = await reminderQueries.update(id, updates);
    
    if (!updatedReminder) {
      return NextResponse.json({
        success: false,
        message: 'Recordatorio no encontrado'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Recordatorio actualizado exitosamente',
      data: updatedReminder
    });

  } catch (error) {
    console.error('Error actualizando recordatorio:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error actualizando recordatorio',
      error: error.message
    }, { status: 500 });
  }
}

// 🗑️ DELETE - Eliminar recordatorio
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID del recordatorio es requerido'
      }, { status: 400 });
    }

    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json({ 
        success: false, 
        message: 'BD no disponible - usar localStorage',
        useLocalStorage: true 
      });
    }

    await reminderQueries.delete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Recordatorio eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando recordatorio:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error eliminando recordatorio',
      error: error.message
    }, { status: 500 });
  }
}
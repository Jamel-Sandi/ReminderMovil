// lib/supabase.js - CLIENTE SOLO SUPABASE (SIN LOCALSTORAGE)
import { createClient } from '@supabase/supabase-js';

// ✅ Variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 🚨 Validación estricta
if (!supabaseUrl) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL es requerida');
}

if (!supabaseAnonKey) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY es requerida');
}

console.log('🔧 Configurando Supabase...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Key presente:', supabaseAnonKey ? '✅' : '❌');

// ✅ Crear cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // No necesitamos auth para recordatorios
    autoRefreshToken: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  }
});

// ✅ FUNCIONES PARA RECORDATORIOS - SOLO SUPABASE
export const reminderQueries = {
  
  // 📋 Obtener todos los recordatorios
  async getAll(userEmail = 'jsandi12199@gmail.com') {
    console.log('🔍 [Supabase] Obteniendo recordatorios...');
    
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_email', userEmail)
      .eq('status', 'active')
      .order('datetime', { ascending: true });
    
    if (error) {
      console.error('❌ [Supabase] Error:', error);
      throw new Error(`Error obteniendo recordatorios: ${error.message}`);
    }
    
    console.log(`✅ [Supabase] ${data?.length || 0} recordatorios obtenidos`);
    
    // Convertir nombres de columnas para compatibilidad
    return (data || []).map(reminder => ({
      ...reminder,
      recurringType: reminder.recurring_type,
      recurringInterval: reminder.recurring_interval,
      createdAt: reminder.created_at,
      updatedAt: reminder.updated_at
    }));
  },

  // ➕ Crear nuevo recordatorio
  async create(reminderData) {
    console.log('➕ [Supabase] Creando recordatorio:', reminderData.title);
    
    const recordatorioParaDB = {
      title: reminderData.title,
      description: reminderData.description || null,
      datetime: reminderData.datetime,
      recurring: reminderData.recurring || false,
      recurring_type: reminderData.recurringType || null,
      recurring_interval: reminderData.recurringInterval || 1,
      color: reminderData.color || 'pink',
      user_email: 'jsandi12199@gmail.com',
      status: 'active',
      notified: false
    };
    
    const { data, error } = await supabase
      .from('reminders')
      .insert([recordatorioParaDB])
      .select()
      .single();
    
    if (error) {
      console.error('❌ [Supabase] Error creando:', error);
      throw new Error(`Error creando recordatorio: ${error.message}`);
    }
    
    console.log('✅ [Supabase] Recordatorio creado con ID:', data.id);
    
    return {
      ...data,
      recurringType: data.recurring_type,
      recurringInterval: data.recurring_interval,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // ✏️ Actualizar recordatorio
  async update(id, updates) {
    console.log('✏️ [Supabase] Actualizando recordatorio:', id);
    
    // Convertir camelCase a snake_case
    const dbUpdates = { ...updates };
    if (updates.recurringType !== undefined) {
      dbUpdates.recurring_type = updates.recurringType;
      delete dbUpdates.recurringType;
    }
    if (updates.recurringInterval !== undefined) {
      dbUpdates.recurring_interval = updates.recurringInterval;
      delete dbUpdates.recurringInterval;
    }
    
    const { data, error } = await supabase
      .from('reminders')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ [Supabase] Error actualizando:', error);
      throw new Error(`Error actualizando recordatorio: ${error.message}`);
    }
    
    console.log('✅ [Supabase] Recordatorio actualizado');
    
    return {
      ...data,
      recurringType: data.recurring_type,
      recurringInterval: data.recurring_interval,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // 🗑️ Eliminar recordatorio (soft delete)
  async delete(id) {
    console.log('🗑️ [Supabase] Eliminando recordatorio:', id);
    
    const { error } = await supabase
      .from('reminders')
      .update({ status: 'cancelled' })
      .eq('id', id);
    
    if (error) {
      console.error('❌ [Supabase] Error eliminando:', error);
      throw new Error(`Error eliminando recordatorio: ${error.message}`);
    }
    
    console.log('✅ [Supabase] Recordatorio eliminado');
    return true;
  },

  // 🔔 Obtener recordatorios pendientes para el cron
  async getPendingNotifications() {
    console.log('🔔 [Supabase] Buscando notificaciones pendientes...');
    
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('status', 'active')
      .eq('notified', false)
      .lte('datetime', now);
    
    if (error) {
      console.error('❌ [Supabase] Error buscando pendientes:', error);
      throw new Error(`Error obteniendo notificaciones pendientes: ${error.message}`);
    }
    
    console.log(`🔔 [Supabase] ${data?.length || 0} notificaciones pendientes`);
    
    return (data || []).map(reminder => ({
      ...reminder,
      recurringType: reminder.recurring_type,
      recurringInterval: reminder.recurring_interval,
      userEmail: reminder.user_email
    }));
  },

  // ✅ Marcar como notificado
  async markAsNotified(id) {
    console.log('✅ [Supabase] Marcando como notificado:', id);
    
    const { error } = await supabase
      .from('reminders')
      .update({ 
        notified: true, 
        last_notification: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('❌ [Supabase] Error marcando notificado:', error);
      throw new Error(`Error marcando como notificado: ${error.message}`);
    }
    
    console.log('✅ [Supabase] Marcado como notificado');
  },

  // 🔄 Crear siguiente recordatorio recurrente
  async createNextRecurring(reminder) {
    console.log('🔄 [Supabase] Creando siguiente recurrencia para:', reminder.title);
    
    const currentDate = new Date(reminder.datetime);
    let nextDate = new Date(currentDate);

    const recurringType = reminder.recurringType || reminder.recurring_type;
    const recurringInterval = reminder.recurringInterval || reminder.recurring_interval;

    switch (recurringType) {
      case 'hours':
        nextDate.setHours(nextDate.getHours() + recurringInterval);
        break;
      case 'days':
        nextDate.setDate(nextDate.getDate() + recurringInterval);
        break;
      case 'weeks':
        nextDate.setDate(nextDate.getDate() + (recurringInterval * 7));
        break;
      case 'months':
        nextDate.setMonth(nextDate.getMonth() + recurringInterval);
        break;
    }

    await this.update(reminder.id, {
      datetime: nextDate.toISOString(),
      notified: false
    });
    
    console.log('🔄 [Supabase] Siguiente recurrencia programada para:', nextDate.toLocaleString());
  }
};

// 🧪 Función para probar conexión
export async function testConnection() {
  try {
    console.log('🧪 [Supabase] Probando conexión...');
    
    const { data, error } = await supabase
      .from('reminders')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ [Supabase] Test falló:', error);
      return false;
    }
    
    console.log('✅ [Supabase] Conexión exitosa');
    return true;
  } catch (error) {
    console.error('❌ [Supabase] Error de conexión:', error);
    return false;
  }
}

export default { 
  reminderQueries, 
  testConnection,
  supabase
};
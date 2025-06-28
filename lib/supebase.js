import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Adaptación completa de todas las funciones para que funcionen igual que antes
export const reminderQueries = {
  
  // 📋 Obtener todos los recordatorios
  async getAll(userEmail = 'jsandi12199@gmail.com') {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_email', userEmail)
      .eq('status', 'active')
      .order('datetime', { ascending: true });
    
    if (error) throw error;
    
    // Convertir formato para compatibilidad con el código existente
    return data.map(reminder => ({
      ...reminder,
      recurringType: reminder.recurring_type,
      recurringInterval: reminder.recurring_interval,
      createdAt: reminder.created_at,
      updatedAt: reminder.updated_at
    }));
  },

  // ➕ Crear nuevo recordatorio
  async create(reminder) {
    const { data, error } = await supabase
      .from('reminders')
      .insert([{
        title: reminder.title,
        description: reminder.description || null,
        datetime: reminder.datetime,
        recurring: reminder.recurring || false,
        recurring_type: reminder.recurringType || null,
        recurring_interval: reminder.recurringInterval || 1,
        color: reminder.color || 'pink',
        user_email: reminder.userEmail || 'jsandi12199@gmail.com'
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      recurringType: data.recurring_type,
      recurringInterval: data.recurring_interval,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  // 🔍 Obtener por ID
  async getById(id) {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
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
    // Convertir camelCase a snake_case para Supabase
    const dbUpdates = {};
    Object.keys(updates).forEach(key => {
      if (key === 'recurringType') dbUpdates.recurring_type = updates[key];
      else if (key === 'recurringInterval') dbUpdates.recurring_interval = updates[key];
      else dbUpdates[key] = updates[key];
    });
    
    const { data, error } = await supabase
      .from('reminders')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
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
    const { error } = await supabase
      .from('reminders')
      .update({ status: 'cancelled' })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // 🔔 Obtener recordatorios pendientes de notificación
  async getPendingNotifications() {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('status', 'active')
      .eq('notified', false)
      .lte('datetime', new Date().toISOString());
    
    if (error) throw error;
    
    return data.map(reminder => ({
      ...reminder,
      recurringType: reminder.recurring_type,
      recurringInterval: reminder.recurring_interval,
      userEmail: reminder.user_email
    }));
  },

  // ✅ Marcar como notificado
  async markAsNotified(id) {
    const { error } = await supabase
      .from('reminders')
      .update({ 
        notified: true, 
        last_notification: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
  },

  // 🔄 Crear siguiente recordatorio recurrente
  async createNextRecurring(reminder) {
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

    return await this.update(reminder.id, {
      datetime: nextDate.toISOString(),
      notified: false
    });
  },

  // 📊 Obtener estadísticas
  async getStats(userEmail = 'jsandi12199@gmail.com') {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_email', userEmail);
    
    if (error) throw error;
    
    const now = new Date();
    return {
      total: data.length,
      recurrentes: data.filter(r => r.recurring).length,
      activos: data.filter(r => r.status === 'active').length,
      futuros: data.filter(r => new Date(r.datetime) > now && r.status === 'active').length,
      vencidos: data.filter(r => new Date(r.datetime) < now && r.status === 'active' && !r.notified).length
    };
  }
};

// 🧪 Función para probar la conexión
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('reminders')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a Supabase:', error.message);
    return false;
  }
}

export default { 
  reminderQueries, 
  testConnection,
  supabase
};
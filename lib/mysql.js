import mysql from 'mysql2/promise';

// Configuración de la base de datos
const dbConfig = {
  // Para desarrollo local
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'tu_password_local',
  database: process.env.DB_NAME || 'recordatorios',
  
  // Configuraciones adicionales
  timezone: '+00:00',
  charset: 'utf8mb4',
  
  // Para Railway (producción)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Pool de conexiones
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
};

// Pool de conexiones para mejor rendimiento
let pool;

function createPool() {
  try {
    return mysql.createPool(dbConfig);
  } catch (error) {
    console.error('Error creando pool de conexiones:', error);
    throw error;
  }
}

function getPool() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

// Función principal para ejecutar consultas
export async function executeQuery(query, params = []) {
  try {
    const connection = getPool();
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('Error ejecutando consulta:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

// =====================================================
// FUNCIONES ESPECÍFICAS PARA RECORDATORIOS
// =====================================================

export const reminderQueries = {
  
  // 📋 Obtener todos los recordatorios
  async getAll(userEmail = 'jsandi12199@gmail.com') {
    const query = `
      SELECT 
        id,
        title,
        description,
        datetime,
        recurring,
        recurring_type as recurringType,
        recurring_interval as recurringInterval,
        color,
        user_email as userEmail,
        notified,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM reminders 
      WHERE user_email = ? AND status = 'active'
      ORDER BY datetime ASC
    `;
    return await executeQuery(query, [userEmail]);
  },

  // ➕ Crear nuevo recordatorio
  async create(reminder) {
    const query = `
      INSERT INTO reminders (
        title, 
        description, 
        datetime, 
        recurring, 
        recurring_type, 
        recurring_interval, 
        color, 
        user_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      reminder.title,
      reminder.description || null,
      reminder.datetime,
      reminder.recurring || false,
      reminder.recurringType || null,
      reminder.recurringInterval || 1,
      reminder.color || 'pink',
      reminder.userEmail || 'jsandi12199@gmail.com'
    ];
    
    const result = await executeQuery(query, params);
    
    // Devolver el recordatorio creado con el ID
    if (result.insertId) {
      return {
        id: result.insertId,
        ...reminder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notified: false,
        status: 'active'
      };
    }
    return null;
  },

  // 🔍 Obtener recordatorio por ID
  async getById(id) {
    const query = `
      SELECT 
        id,
        title,
        description,
        datetime,
        recurring,
        recurring_type as recurringType,
        recurring_interval as recurringInterval,
        color,
        user_email as userEmail,
        notified,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM reminders 
      WHERE id = ?
    `;
    const results = await executeQuery(query, [id]);
    return results[0] || null;
  },

  // ✏️ Actualizar recordatorio
  async update(id, updates) {
    const allowedFields = [
      'title', 'description', 'datetime', 'recurring', 
      'recurring_type', 'recurring_interval', 'color', 'notified', 'status'
    ];
    
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        // Convertir camelCase a snake_case para la BD
        const dbField = key === 'recurringType' ? 'recurring_type' :
                       key === 'recurringInterval' ? 'recurring_interval' : key;
        fields.push(`${dbField} = ?`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const query = `UPDATE reminders SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    
    await executeQuery(query, values);
    return await this.getById(id);
  },

  // 🗑️ Eliminar recordatorio (soft delete)
  async delete(id) {
    const query = 'UPDATE reminders SET status = "cancelled", updated_at = NOW() WHERE id = ?';
    await executeQuery(query, [id]);
    return true;
  },

  // 🔔 Obtener recordatorios pendientes de notificación
  async getPendingNotifications() {
    const query = `
      SELECT 
        id,
        title,
        description,
        datetime,
        recurring,
        recurring_type as recurringType,
        recurring_interval as recurringInterval,
        color,
        user_email as userEmail
      FROM reminders 
      WHERE status = 'active' 
      AND notified = FALSE 
      AND datetime <= NOW()
      ORDER BY datetime ASC
    `;
    return await executeQuery(query);
  },

  // ✅ Marcar como notificado
  async markAsNotified(id) {
    const query = `
      UPDATE reminders 
      SET notified = TRUE, last_notification = NOW(), updated_at = NOW()
      WHERE id = ?
    `;
    await executeQuery(query, [id]);
  },

  // 🔄 Crear siguiente recordatorio recurrente
  async createNextRecurring(reminder) {
    const currentDate = new Date(reminder.datetime);
    let nextDate = new Date(currentDate);

    switch (reminder.recurringType) {
      case 'hours':
        nextDate.setHours(nextDate.getHours() + reminder.recurringInterval);
        break;
      case 'days':
        nextDate.setDate(nextDate.getDate() + reminder.recurringInterval);
        break;
      case 'weeks':
        nextDate.setDate(nextDate.getDate() + (reminder.recurringInterval * 7));
        break;
      case 'months':
        nextDate.setMonth(nextDate.getMonth() + reminder.recurringInterval);
        break;
    }

    // Actualizar el recordatorio existente con la nueva fecha
    await this.update(reminder.id, {
      datetime: nextDate.toISOString().slice(0, 19).replace('T', ' '),
      notified: false
    });

    return await this.getById(reminder.id);
  },

  // 📊 Obtener estadísticas
  async getStats(userEmail = 'jsandi12199@gmail.com') {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN recurring = TRUE THEN 1 END) as recurrentes,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as activos,
        COUNT(CASE WHEN datetime > NOW() AND status = 'active' THEN 1 END) as futuros,
        COUNT(CASE WHEN datetime < NOW() AND status = 'active' AND notified = FALSE THEN 1 END) as vencidos
      FROM reminders 
      WHERE user_email = ?
    `;
    const results = await executeQuery(query, [userEmail]);
    return results[0];
  }
};

// 🧪 Función para probar la conexión
export async function testConnection() {
  try {
    const result = await executeQuery('SELECT 1 as test, NOW() as fecha');
    console.log('✅ Conexión a MySQL exitosa:', result[0]);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    return false;
  }
}

// Cerrar el pool de conexiones (útil para testing)
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export default { 
  executeQuery, 
  reminderQueries, 
  testConnection, 
  closePool 
};
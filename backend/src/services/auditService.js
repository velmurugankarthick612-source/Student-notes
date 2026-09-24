const { supabase, isConfigured } = require('../config/supabase');
const crypto = require('crypto');

// In-memory fallback audit log buffer
const memoryAuditLogs = [];

/**
 * Log administrative operations
 * @param {Object} params
 * @param {string} params.adminId - Admin UUID performing the action
 * @param {'STUDENT_CREATED'|'STUDENT_UPDATED'|'STUDENT_ACTIVATED'|'STUDENT_DEACTIVATED'|'STUDENT_DELETED'} params.action
 * @param {string} params.targetUserId - Target student user UUID
 * @param {Object} params.details - Safe JSON metadata (NEVER PASS PASSWORDS OR SECRETS)
 */
const logAdminAction = async ({ adminId, action, targetUserId, details = {} }) => {
  const logEntry = {
    id: crypto.randomUUID(),
    admin_id: adminId || null,
    action,
    target_user_id: targetUserId || null,
    details: sanitizeDetails(details),
    created_at: new Date().toISOString(),
  };

  // Always store in memory for platform introspection
  memoryAuditLogs.unshift(logEntry);
  if (memoryAuditLogs.length > 500) {
    memoryAuditLogs.pop();
  }

  // Attempt database persistence if configured
  if (isConfigured && supabase) {
    try {
      await supabase.from('admin_audit_logs').insert([logEntry]);
    } catch (err) {
      console.warn('Could not insert admin audit log into database:', err.message);
    }
  }

  return logEntry;
};

/**
 * Strip any sensitive keys (passwords, tokens) before logging
 */
const sanitizeDetails = (details) => {
  if (!details || typeof details !== 'object') return {};
  const sanitized = { ...details };
  const sensitiveKeys = ['password', 'temporary_password', 'token', 'access_token', 'secret'];
  for (const key of sensitiveKeys) {
    if (key in sanitized) {
      delete sanitized[key];
    }
  }
  return sanitized;
};

const getAuditLogs = async (limit = 50) => {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      // Fallback to in-memory
    }
  }
  return memoryAuditLogs.slice(0, limit);
};

module.exports = {
  logAdminAction,
  getAuditLogs,
};

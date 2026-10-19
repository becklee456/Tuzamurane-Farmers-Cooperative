import AuditLog from '../models/AuditLog.js';

export const writeAudit = (action, entity) => async (req, res, next) => {
  res.on('finish', async () => {
    if (res.statusCode >= 200 && res.statusCode < 400 && req.user) {
      await AuditLog.create({
        user: req.user._id,
        action,
        entity,
        method: req.method,
        path: req.originalUrl,
        ipAddress: req.ip
      }).catch(() => {});
    }
  });
  next();
};

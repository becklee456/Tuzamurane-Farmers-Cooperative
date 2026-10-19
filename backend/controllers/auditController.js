import AuditLog from '../models/AuditLog.js';
import asyncHandler from '../utils/asyncHandler.js';
import { pagination } from '../utils/buildQuery.js';

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const [items, total] = await Promise.all([
    AuditLog.find().populate('user', 'name username role').sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments()
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

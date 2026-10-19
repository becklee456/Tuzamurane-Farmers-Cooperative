import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'manager'), getAuditLogs);

export default router;

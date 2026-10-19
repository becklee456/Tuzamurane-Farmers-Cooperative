import express from 'express';
import { getPayments, getReceipt, markPaymentPaid } from '../controllers/paymentController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { writeAudit } from '../middleware/auditMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getPayments);
router.get('/:id/receipt', getReceipt);
router.patch('/:id/pay', authorize('admin', 'manager'), writeAudit('mark-paid', 'payment'), markPaymentPaid);

export default router;

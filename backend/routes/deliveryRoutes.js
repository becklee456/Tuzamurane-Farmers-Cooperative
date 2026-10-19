import express from 'express';
import {
  createDelivery,
  deleteDelivery,
  getDeliveries,
  getDelivery,
  updateDelivery
} from '../controllers/deliveryController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { writeAudit } from '../middleware/auditMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { deliveryValidator } from '../validators/deliveryValidators.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getDeliveries).post(authorize('admin', 'manager', 'staff'), deliveryValidator, validateRequest, writeAudit('create', 'delivery'), createDelivery);
router
  .route('/:id')
  .get(getDelivery)
  .put(authorize('admin', 'manager', 'staff'), deliveryValidator, validateRequest, writeAudit('update', 'delivery'), updateDelivery)
  .delete(authorize('admin', 'manager'), writeAudit('delete', 'delivery'), deleteDelivery);

export default router;

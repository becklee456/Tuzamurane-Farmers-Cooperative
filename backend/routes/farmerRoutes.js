import express from 'express';
import {
  createFarmer,
  deleteFarmer,
  getFarmer,
  getFarmerHistory,
  getFarmers,
  updateFarmer
} from '../controllers/farmerController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { writeAudit } from '../middleware/auditMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { farmerValidator } from '../validators/farmerValidators.js';

const router = express.Router();

router.use(protect);
router.get('/history/:farmerNumber', getFarmerHistory);
router.route('/').get(getFarmers).post(authorize('admin', 'manager', 'staff'), farmerValidator, validateRequest, writeAudit('create', 'farmer'), createFarmer);
router
  .route('/:id')
  .get(getFarmer)
  .put(authorize('admin', 'manager', 'staff'), farmerValidator, validateRequest, writeAudit('update', 'farmer'), updateFarmer)
  .delete(authorize('admin', 'manager'), writeAudit('delete', 'farmer'), deleteFarmer);

export default router;

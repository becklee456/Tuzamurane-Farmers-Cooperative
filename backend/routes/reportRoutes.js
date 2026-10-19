import express from 'express';
import {
  cropPerformanceReport,
  farmerDeliveryReport,
  monthlyIncomeReport,
  paymentReport
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/monthly-income', monthlyIncomeReport);
router.get('/payments', paymentReport);
router.get('/farmer-deliveries', farmerDeliveryReport);
router.get('/crop-performance', cropPerformanceReport);

export default router;

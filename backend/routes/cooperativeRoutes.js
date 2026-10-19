import express from 'express';
import {
  createCooperative,
  deleteCooperative,
  getCooperative,
  getCooperatives,
  updateCooperative
} from '../controllers/cooperativeController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { writeAudit } from '../middleware/auditMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { cooperativeValidator } from '../validators/cooperativeValidators.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getCooperatives).post(authorize('admin', 'manager'), cooperativeValidator, validateRequest, writeAudit('create', 'cooperative'), createCooperative);
router
  .route('/:id')
  .get(getCooperative)
  .put(authorize('admin', 'manager'), cooperativeValidator, validateRequest, writeAudit('update', 'cooperative'), updateCooperative)
  .delete(authorize('admin'), writeAudit('delete', 'cooperative'), deleteCooperative);

export default router;

import { body } from 'express-validator';

export const deliveryValidator = [
  body('deliveryId').optional().trim(),
  body('farmerNumber').trim().notEmpty().withMessage('Farmer number is required'),
  body('cropType')
    .isIn(['Maize', 'Beans', 'Irish Potatoes'])
    .withMessage('Crop type must be Maize, Beans, or Irish Potatoes'),
  body('weightKg').isFloat({ gt: 0 }).withMessage('Weight must be greater than zero'),
  body('pricePerKg').isFloat({ gt: 0 }).withMessage('Price per kilogram must be greater than zero'),
  body('deliveryDate').isISO8601().withMessage('Delivery date is required')
];

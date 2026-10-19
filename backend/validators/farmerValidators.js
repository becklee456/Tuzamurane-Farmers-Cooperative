import { body } from 'express-validator';

export const farmerValidator = [
  body('farmerNumber').trim().notEmpty().withMessage('Farmer number is required'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('telephoneNumber')
    .trim()
    .matches(/^(\+?250|0)?7[2389]\d{7}$/)
    .withMessage('Enter a valid Rwanda telephone number'),
  body('village').trim().notEmpty().withMessage('Village is required'),
  body('membershipDate').isISO8601().withMessage('Membership date is required'),
  body('cooperativeCode').trim().notEmpty().withMessage('Cooperative code is required')
];

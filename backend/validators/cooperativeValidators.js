import { body } from 'express-validator';

export const cooperativeValidator = [
  body('cooperativeCode').trim().notEmpty().withMessage('Cooperative code is required'),
  body('cooperativeName').trim().notEmpty().withMessage('Cooperative name is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
  body('chairpersonName').trim().notEmpty().withMessage('Chairperson name is required')
];

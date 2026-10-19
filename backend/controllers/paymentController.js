import Payment from '../models/Payment.js';
import asyncHandler from '../utils/asyncHandler.js';
import { dateRange, pagination, regexSearch } from '../utils/buildQuery.js';
import { timestampId } from '../utils/ids.js';

const paymentQuery = (params) => {
  const query = { ...dateRange(params.startDate, params.endDate, 'paymentDate') };
  if (params.paymentStatus) query.paymentStatus = params.paymentStatus;
  if (params.farmerNumber) query.farmerNumber = params.farmerNumber.toUpperCase();
  if (params.search) {
    query.$or = [
      { paymentId: regexSearch(params.search) },
      { farmerNumber: regexSearch(params.search) },
      { receiptNumber: regexSearch(params.search) }
    ];
  }
  return query;
};

export const getPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const query = paymentQuery(req.query);

  const [items, total] = await Promise.all([
    Payment.find(query)
      .populate('farmer', 'firstName lastName telephoneNumber village')
      .populate('delivery', 'deliveryId cropType weightKg pricePerKg deliveryDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(query)
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

export const markPaymentPaid = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('farmer').populate('delivery');
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  payment.paymentStatus = 'Paid';
  payment.paymentDate = req.body.paymentDate || new Date();
  payment.receiptNumber = payment.receiptNumber || timestampId('RCT');
  payment.notes = req.body.notes || payment.notes;
  await payment.save();

  res.json(payment);
});

export const getReceipt = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('farmer').populate('delivery');
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  res.json({
    receiptNumber: payment.receiptNumber || payment.paymentId,
    cooperative: 'Tuzamurane Farmers Cooperative',
    location: 'Nyamagabe District, Rwanda',
    farmer: payment.farmer,
    delivery: payment.delivery,
    amount: payment.totalAmountPaid,
    status: payment.paymentStatus,
    paymentDate: payment.paymentDate,
    generatedAt: new Date()
  });
});

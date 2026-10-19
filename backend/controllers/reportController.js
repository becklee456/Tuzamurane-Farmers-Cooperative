import Delivery from '../models/Delivery.js';
import Payment from '../models/Payment.js';
import asyncHandler from '../utils/asyncHandler.js';
import { dateRange } from '../utils/buildQuery.js';

const filteredDeliveryQuery = (queryParams) => {
  const query = { ...dateRange(queryParams.startDate, queryParams.endDate, 'deliveryDate') };
  if (queryParams.cropType) query.cropType = queryParams.cropType;
  if (queryParams.farmerNumber) query.farmerNumber = queryParams.farmerNumber.toUpperCase();
  return query;
};

export const monthlyIncomeReport = asyncHandler(async (req, res) => {
  const match = filteredDeliveryQuery(req.query);
  const rows = await Delivery.aggregate([
    { $match: match },
    {
      $group: {
        _id: { year: { $year: '$deliveryDate' }, month: { $month: '$deliveryDate' }, cropType: '$cropType' },
        totalWeight: { $sum: '$weightKg' },
        totalIncome: { $sum: '$totalAmount' },
        deliveries: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.json(
    rows.map((row) => ({
      month: `${row._id.year}-${String(row._id.month).padStart(2, '0')}`,
      cropType: row._id.cropType,
      deliveries: row.deliveries,
      totalWeight: row.totalWeight,
      totalIncome: row.totalIncome
    }))
  );
});

export const paymentReport = asyncHandler(async (req, res) => {
  const query = { ...dateRange(req.query.startDate, req.query.endDate, 'paymentDate') };
  if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;
  if (req.query.farmerNumber) query.farmerNumber = req.query.farmerNumber.toUpperCase();

  const payments = await Payment.find(query)
    .populate('farmer', 'firstName lastName telephoneNumber village')
    .sort({ paymentDate: -1, createdAt: -1 });

  res.json(payments);
});

export const farmerDeliveryReport = asyncHandler(async (req, res) => {
  const deliveries = await Delivery.find(filteredDeliveryQuery(req.query))
    .populate('farmer', 'firstName lastName telephoneNumber village cooperativeCode')
    .sort({ deliveryDate: -1 });

  res.json(deliveries);
});

export const cropPerformanceReport = asyncHandler(async (req, res) => {
  const rows = await Delivery.aggregate([
    { $match: filteredDeliveryQuery(req.query) },
    {
      $group: {
        _id: '$cropType',
        deliveries: { $sum: 1 },
        totalWeight: { $sum: '$weightKg' },
        averagePrice: { $avg: '$pricePerKg' },
        totalIncome: { $sum: '$totalAmount' }
      }
    },
    { $sort: { totalIncome: -1 } }
  ]);

  res.json(
    rows.map((row) => ({
      cropType: row._id,
      deliveries: row.deliveries,
      totalWeight: row.totalWeight,
      averagePrice: row.averagePrice,
      totalIncome: row.totalIncome
    }))
  );
});

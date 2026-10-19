import Delivery from '../models/Delivery.js';
import Farmer from '../models/Farmer.js';
import Payment from '../models/Payment.js';
import AuditLog from '../models/AuditLog.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalFarmers,
    totalDeliveries,
    incomeAgg,
    paidAgg,
    pendingAgg,
    cropTrend,
    monthlyIncome,
    recentActivities
  ] = await Promise.all([
    Farmer.countDocuments(),
    Delivery.countDocuments(),
    Delivery.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Payment.aggregate([{ $match: { paymentStatus: 'Paid' } }, { $group: { _id: null, total: { $sum: '$totalAmountPaid' } } }]),
    Payment.aggregate([{ $match: { paymentStatus: 'Pending' } }, { $group: { _id: null, total: { $sum: '$totalAmountPaid' } } }]),
    Delivery.aggregate([
      { $group: { _id: '$cropType', weight: { $sum: '$weightKg' }, income: { $sum: '$totalAmount' } } },
      { $sort: { weight: -1 } }
    ]),
    Delivery.aggregate([
      {
        $group: {
          _id: { year: { $year: '$deliveryDate' }, month: { $month: '$deliveryDate' } },
          income: { $sum: '$totalAmount' },
          deliveries: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    AuditLog.find().populate('user', 'name role').sort({ createdAt: -1 }).limit(8)
  ]);

  res.json({
    totalFarmers,
    totalDeliveries,
    totalCooperativeIncome: incomeAgg[0]?.total || 0,
    totalPaymentsMade: paidAgg[0]?.total || 0,
    totalPendingPayments: pendingAgg[0]?.total || 0,
    cropTrend: cropTrend.map((item) => ({ cropType: item._id, weight: item.weight, income: item.income })),
    monthlyIncome: monthlyIncome.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      income: item.income,
      deliveries: item.deliveries
    })),
    recentActivities
  });
});

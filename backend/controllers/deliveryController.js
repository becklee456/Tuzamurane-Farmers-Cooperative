import Delivery from '../models/Delivery.js';
import Farmer from '../models/Farmer.js';
import Payment from '../models/Payment.js';
import asyncHandler from '../utils/asyncHandler.js';
import { dateRange, pagination, regexSearch } from '../utils/buildQuery.js';
import { timestampId } from '../utils/ids.js';

const buildDeliveryQuery = (params) => {
  const query = { ...dateRange(params.startDate, params.endDate, 'deliveryDate') };
  if (params.cropType) query.cropType = params.cropType;
  if (params.farmerNumber) query.farmerNumber = params.farmerNumber.toUpperCase();
  if (params.search) {
    query.$or = [
      { deliveryId: regexSearch(params.search) },
      { farmerNumber: regexSearch(params.search) },
      { cropType: regexSearch(params.search) }
    ];
  }
  return query;
};

export const getDeliveries = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const query = buildDeliveryQuery(req.query);

  const [items, total] = await Promise.all([
    Delivery.find(query)
      .populate('farmer', 'firstName lastName telephoneNumber village')
      .sort({ deliveryDate: -1 })
      .skip(skip)
      .limit(limit),
    Delivery.countDocuments(query)
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

export const getDelivery = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findById(req.params.id).populate('farmer');
  if (!delivery) {
    res.status(404);
    throw new Error('Delivery not found');
  }
  res.json(delivery);
});

export const createDelivery = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ farmerNumber: req.body.farmerNumber.toUpperCase() });
  if (!farmer) {
    res.status(404);
    throw new Error('Farmer number does not exist');
  }

  const delivery = await Delivery.create({
    ...req.body,
    deliveryId: req.body.deliveryId || timestampId('DEL'),
    farmer: farmer._id,
    farmerNumber: farmer.farmerNumber
  });

  await Payment.create({
    paymentId: timestampId('PAY'),
    farmer: farmer._id,
    farmerNumber: farmer.farmerNumber,
    delivery: delivery._id,
    totalAmountPaid: delivery.totalAmount,
    paymentStatus: 'Pending'
  });

  res.status(201).json(delivery);
});

export const updateDelivery = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ farmerNumber: req.body.farmerNumber.toUpperCase() });
  if (!farmer) {
    res.status(404);
    throw new Error('Farmer number does not exist');
  }

  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) {
    res.status(404);
    throw new Error('Delivery not found');
  }

  const paidPayment = await Payment.findOne({ delivery: delivery._id, paymentStatus: 'Paid' });
  if (paidPayment) {
    res.status(409);
    throw new Error('Cannot update a delivery that already has a paid payment');
  }

  Object.assign(delivery, {
    ...req.body,
    farmer: farmer._id,
    farmerNumber: farmer.farmerNumber
  });
  await delivery.save();

  await Payment.findOneAndUpdate(
    { delivery: delivery._id, paymentStatus: 'Pending' },
    {
      farmer: farmer._id,
      farmerNumber: farmer.farmerNumber,
      totalAmountPaid: delivery.totalAmount
    },
    { runValidators: true }
  );

  res.json(delivery);
});

export const deleteDelivery = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) {
    res.status(404);
    throw new Error('Delivery not found');
  }

  const paidPayment = await Payment.findOne({ delivery: delivery._id, paymentStatus: 'Paid' });
  if (paidPayment) {
    res.status(409);
    throw new Error('Cannot delete a delivery that already has a paid payment');
  }

  await Payment.deleteMany({ delivery: delivery._id, paymentStatus: 'Pending' });
  await delivery.deleteOne();
  res.json({ message: 'Delivery deleted' });
});

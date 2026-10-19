import Cooperative from '../models/Cooperative.js';
import Delivery from '../models/Delivery.js';
import Farmer from '../models/Farmer.js';
import Payment from '../models/Payment.js';
import asyncHandler from '../utils/asyncHandler.js';
import { pagination, regexSearch } from '../utils/buildQuery.js';

const farmerQuery = (queryParams) => {
  const query = {};
  if (queryParams.cooperativeCode) query.cooperativeCode = queryParams.cooperativeCode.toUpperCase();
  if (queryParams.village) query.village = regexSearch(queryParams.village);
  if (queryParams.search) {
    query.$or = [
      { farmerNumber: regexSearch(queryParams.search) },
      { firstName: regexSearch(queryParams.search) },
      { lastName: regexSearch(queryParams.search) },
      { telephoneNumber: regexSearch(queryParams.search) },
      { village: regexSearch(queryParams.search) }
    ];
  }
  return query;
};

export const getFarmers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const query = farmerQuery(req.query);

  const [items, total] = await Promise.all([
    Farmer.find(query).populate('cooperative', 'cooperativeName district').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Farmer.countDocuments(query)
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

export const getFarmer = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findById(req.params.id).populate('cooperative');
  if (!farmer) {
    res.status(404);
    throw new Error('Farmer not found');
  }
  res.json(farmer);
});

export const getFarmerHistory = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findOne({ farmerNumber: req.params.farmerNumber.toUpperCase() });
  if (!farmer) {
    res.status(404);
    throw new Error('Farmer not found');
  }

  const [deliveries, payments] = await Promise.all([
    Delivery.find({ farmer: farmer._id }).sort({ deliveryDate: -1 }),
    Payment.find({ farmer: farmer._id }).sort({ createdAt: -1 })
  ]);

  res.json({ farmer, deliveries, payments });
});

export const createFarmer = asyncHandler(async (req, res) => {
  const cooperative = await Cooperative.findOne({
    cooperativeCode: req.body.cooperativeCode.toUpperCase()
  });

  if (!cooperative) {
    res.status(404);
    throw new Error('Cooperative code does not exist');
  }

  const farmer = await Farmer.create({
    ...req.body,
    cooperativeCode: cooperative.cooperativeCode,
    cooperative: cooperative._id
  });

  res.status(201).json(farmer);
});

export const updateFarmer = asyncHandler(async (req, res) => {
  const cooperative = await Cooperative.findOne({
    cooperativeCode: req.body.cooperativeCode.toUpperCase()
  });

  if (!cooperative) {
    res.status(404);
    throw new Error('Cooperative code does not exist');
  }

  const farmer = await Farmer.findByIdAndUpdate(
    req.params.id,
    { ...req.body, cooperativeCode: cooperative.cooperativeCode, cooperative: cooperative._id },
    { new: true, runValidators: true }
  );

  if (!farmer) {
    res.status(404);
    throw new Error('Farmer not found');
  }

  await Delivery.updateMany({ farmer: farmer._id }, { farmerNumber: farmer.farmerNumber });
  await Payment.updateMany({ farmer: farmer._id }, { farmerNumber: farmer.farmerNumber });

  res.json(farmer);
});

export const deleteFarmer = asyncHandler(async (req, res) => {
  const deliveryCount = await Delivery.countDocuments({ farmer: req.params.id });
  if (deliveryCount > 0) {
    res.status(409);
    throw new Error('Cannot delete a farmer with delivery history');
  }

  const farmer = await Farmer.findByIdAndDelete(req.params.id);
  if (!farmer) {
    res.status(404);
    throw new Error('Farmer not found');
  }

  await Payment.deleteMany({ farmer: farmer._id, paymentStatus: 'Pending' });
  res.json({ message: 'Farmer deleted' });
});

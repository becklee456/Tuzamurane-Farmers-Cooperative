import Cooperative from '../models/Cooperative.js';
import Farmer from '../models/Farmer.js';
import asyncHandler from '../utils/asyncHandler.js';
import { pagination, regexSearch } from '../utils/buildQuery.js';

export const getCooperatives = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const query = req.query.search
    ? {
        $or: [
          { cooperativeCode: regexSearch(req.query.search) },
          { cooperativeName: regexSearch(req.query.search) },
          { district: regexSearch(req.query.search) },
          { chairpersonName: regexSearch(req.query.search) }
        ]
      }
    : {};

  const [items, total] = await Promise.all([
    Cooperative.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Cooperative.countDocuments(query)
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

export const getCooperative = asyncHandler(async (req, res) => {
  const cooperative = await Cooperative.findById(req.params.id);
  if (!cooperative) {
    res.status(404);
    throw new Error('Cooperative not found');
  }
  res.json(cooperative);
});

export const createCooperative = asyncHandler(async (req, res) => {
  const cooperative = await Cooperative.create(req.body);
  res.status(201).json(cooperative);
});

export const updateCooperative = asyncHandler(async (req, res) => {
  const cooperative = await Cooperative.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!cooperative) {
    res.status(404);
    throw new Error('Cooperative not found');
  }

  await Farmer.updateMany(
    { cooperative: cooperative._id },
    { cooperativeCode: cooperative.cooperativeCode }
  );

  res.json(cooperative);
});

export const deleteCooperative = asyncHandler(async (req, res) => {
  const linkedFarmers = await Farmer.countDocuments({ cooperative: req.params.id });
  if (linkedFarmers > 0) {
    res.status(409);
    throw new Error('Cannot delete a cooperative that has registered farmers');
  }

  const cooperative = await Cooperative.findByIdAndDelete(req.params.id);
  if (!cooperative) {
    res.status(404);
    throw new Error('Cooperative not found');
  }

  res.json({ message: 'Cooperative deleted' });
});

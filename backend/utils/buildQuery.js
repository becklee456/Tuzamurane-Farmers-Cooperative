export const pagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const regexSearch = (value) => ({
  $regex: String(value || '').trim(),
  $options: 'i'
});

export const dateRange = (startDate, endDate, field = 'createdAt') => {
  const query = {};
  if (startDate || endDate) {
    query[field] = {};
    if (startDate) query[field].$gte = new Date(startDate);
    if (endDate) query[field].$lte = new Date(endDate);
  }
  return query;
};

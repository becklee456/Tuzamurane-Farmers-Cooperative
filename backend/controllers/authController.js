import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const normalized = identifier.toLowerCase();

  const user = await User.findOne({
    $or: [{ email: normalized }, { username: normalized }]
  }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This user account is disabled');
  }

  res.json({
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

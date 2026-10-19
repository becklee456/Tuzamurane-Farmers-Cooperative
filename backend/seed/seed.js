import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Cooperative from '../models/Cooperative.js';
import Farmer from '../models/Farmer.js';
import Delivery from '../models/Delivery.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { timestampId } from '../utils/ids.js';

dotenv.config();

const run = async () => {
  await connectDB();
  await Promise.all([
    AuditLog.deleteMany(),
    Payment.deleteMany(),
    Delivery.deleteMany(),
    Farmer.deleteMany(),
    Cooperative.deleteMany(),
    User.deleteMany()
  ]);

  const [admin] = await User.create([
    {
      name: 'Tuzamurane Administrator',
      username: 'admin',
      email: 'admin@tuzamurane.rw',
      password: 'Admin123!',
      role: 'admin'
    }
  ]);

  const cooperative = await Cooperative.create({
    cooperativeCode: 'TZM-001',
    cooperativeName: 'Tuzamurane Farmers Cooperative',
    district: 'Nyamagabe',
    chairpersonName: 'Uwimana Claudine'
  });

  const farmers = await Farmer.create([
    {
      farmerNumber: 'FRM-001',
      firstName: 'Jean',
      lastName: 'Habyarimana',
      telephoneNumber: '0781234567',
      village: 'Gatovu',
      membershipDate: '2024-01-12',
      cooperativeCode: cooperative.cooperativeCode,
      cooperative: cooperative._id
    },
    {
      farmerNumber: 'FRM-002',
      firstName: 'Aline',
      lastName: 'Mukamana',
      telephoneNumber: '0723456789',
      village: 'Kaduha',
      membershipDate: '2024-03-04',
      cooperativeCode: cooperative.cooperativeCode,
      cooperative: cooperative._id
    },
    {
      farmerNumber: 'FRM-003',
      firstName: 'Emmanuel',
      lastName: 'Nshimiyimana',
      telephoneNumber: '0734567890',
      village: 'Mugano',
      membershipDate: '2025-02-18',
      cooperativeCode: cooperative.cooperativeCode,
      cooperative: cooperative._id
    }
  ]);

  const deliveries = await Delivery.create([
    {
      deliveryId: 'DEL-001',
      farmerNumber: farmers[0].farmerNumber,
      farmer: farmers[0]._id,
      cropType: 'Maize',
      weightKg: 520,
      pricePerKg: 360,
      deliveryDate: '2026-01-09'
    },
    {
      deliveryId: 'DEL-002',
      farmerNumber: farmers[1].farmerNumber,
      farmer: farmers[1]._id,
      cropType: 'Beans',
      weightKg: 240,
      pricePerKg: 900,
      deliveryDate: '2026-02-14'
    },
    {
      deliveryId: 'DEL-003',
      farmerNumber: farmers[2].farmerNumber,
      farmer: farmers[2]._id,
      cropType: 'Irish Potatoes',
      weightKg: 830,
      pricePerKg: 250,
      deliveryDate: '2026-03-20'
    }
  ]);

  await Payment.create(
    deliveries.map((delivery, index) => ({
      paymentId: `PAY-00${index + 1}`,
      farmer: delivery.farmer,
      farmerNumber: delivery.farmerNumber,
      delivery: delivery._id,
      totalAmountPaid: delivery.totalAmount,
      paymentStatus: index === 0 ? 'Paid' : 'Pending',
      paymentDate: index === 0 ? new Date('2026-01-12') : undefined,
      receiptNumber: index === 0 ? timestampId('RCT') : undefined
    }))
  );

  await AuditLog.create({
    user: admin._id,
    action: 'seed',
    entity: 'database',
    method: 'SCRIPT',
    path: 'seed/seed.js'
  });

  console.log('Database seeded. Login with admin@tuzamurane.rw / Admin123!');
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});

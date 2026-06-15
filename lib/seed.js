const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seedDatabase(db) {
  const { User, Product, Order, isMock } = db;
  console.log('🌱 Starting Database Seeding (Global Localization)...');

  const hashedPassword = '$2b$10$gJAo3x5pVsHsJV7WZd4lr.kjq7Pd/xv8vxmjYNPzjig3rH/gEoY8e';

  // 1. Support Specialists & Admin Accounts
  const users = [
    {
      _id: 'agent-anamika',
      name: 'Dr. Anamika Verma (Gyne)',
      email: 'anamika@nexoveda.com',
      role: 'agent',
      specialty: 'medical',
      gender: 'female',
      status: 'online',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      password: hashedPassword,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'agent-harsh',
      name: 'Dr. Harsh Rawat (B.A.M.S.)',
      email: 'harsh@nexoveda.com',
      role: 'agent',
      specialty: 'herbal',
      gender: 'male',
      status: 'online',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      password: hashedPassword,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'agent-smita',
      name: 'Ms. Smita Gupta (M. A. Psychology)',
      email: 'smita@nexoveda.com',
      role: 'agent',
      specialty: 'mental_health',
      gender: 'female',
      status: 'online',
      avatarUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150&auto=format&fit=crop&q=80',
      password: hashedPassword,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'admin-main',
      name: 'Nexoveda Admin',
      email: 'admin@nexoveda.com',
      role: 'admin',
      specialty: null,
      gender: null,
      status: 'offline',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      password: hashedPassword,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
  ];

  // 2. Health & Wellness Catalog (USD Prices)
  const products = [
    {
      _id: 'prod-adivance',
      name: 'Adivance Capsule',
      price: 29.99,
      description: 'A premium, clinical-grade wellness supplement crafted with standardized extracts of Purified Shilajit, Ashwagandha, and Gokshura. Formulated to enhance stamina, recovery, performance, and daily vitality.',
      category: 'Supplements',
      image: '/image/adivance-capsule.jpeg',
      ingredients: [
        'Purified Shilajit (150mg)',
        'KSM-66 Ashwagandha (200mg)',
        'Safed Musli (100mg)',
        'Gokshura Extract (100mg)'
      ],
      benefits: [
        'Boosts physical stamina and energy',
        'Improves muscle recovery times',
        'Combats fatigue and daily stress',
        'Optimizes overall power and focus'
      ],
      rating: 4.9,
      reviewCount: 15,
      discountPercent: 10,
      suggestedUse: 'Take 1 to 2 capsules daily with milk or warm water after meals, or as recommended by your health specialist.',
      sku: 'NEX-ADV-001',
      reviews: [
        {
          author: 'Fahad Patel',
          location: 'London, UK',
          rating: 5,
          text: 'Excellent capsules for gym energy. Felt a difference within a week.',
          date: '2026-06-01'
        },
        {
          author: 'John Doe',
          location: 'New York, USA',
          rating: 5,
          text: 'Completely natural and safe stamina booster. Fast shipping.',
          date: '2026-05-24'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // 3. Mock Orders Data (USD)
  const orders = [
    {
      _id: 'ord-gl01829',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+15550199',
      addressLine1: '123 Main St',
      suburb: 'New York',
      state: 'New York, USA',
      postcode: '10001',
      items: [
        {
          productId: 'prod-adivance',
          name: 'Adivance Capsule',
          quantity: 2,
          price: 29.99
        }
      ],
      subtotal: 53.98,
      shippingCost: 0,
      total: 53.98,
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ];

  if (!isMock) {
    console.log('🔗 Connected to live MongoDB. Seeding collections...');
    // Drop existing data to prevent duplicates / stale schemas
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    // Bulk insert documents
    await User.insertMany(users);
    await Product.insertMany(products);
    await Order.insertMany(orders);

    console.log('✨ Live MongoDB database seeded successfully!');
  } else {
    console.log('💾 Running in mock mode. Seeding local JSON database...');
    try {
      const DB_FILE = path.join(process.cwd(), 'data', 'db.json');
      if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
        fs.mkdirSync(path.join(process.cwd(), 'data'));
      }

      const dbData = {
        users,
        conversations: [],
        messages: [],
        products,
        orders
      };

      fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
      console.log('✨ Local JSON Database seeded successfully at data/db.json!');
    } catch (err) {
      console.warn('⚠️ Local mock JSON DB seeding failed (possibly read-only filesystem):', err.message);
    }
  }
}

module.exports = { seedDatabase };

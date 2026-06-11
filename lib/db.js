const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Local JSON Database Paths
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const initialDbState = {
  users: [],
  conversations: [],
  messages: [],
  products: [],
  orders: []
};

let dbStateLoaded = false;
let dbState = initialDbState;

function ensureJsonDb() {
  if (dbStateLoaded) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      dbState = { ...initialDbState, ...JSON.parse(data) };
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDbState, null, 2));
    }
  } catch (err) {
    console.warn('⚠️ Local mock JSON DB initialization failed (possibly read-only filesystem):', err.message);
  }
  dbStateLoaded = true;
}

function readJsonDb() {
  ensureJsonDb();
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
    return dbState;
  } catch (err) {
    return dbState;
  }
}

function writeJsonDb(data) {
  ensureJsonDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Failed to write to mock JSON DB:', err.message);
  }
}

let isMock = false;

// 1. MONGOOSE SCHEMA DEFINITIONS (For MongoDB Mode)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'agent', 'admin'], default: 'customer' },
  specialty: { type: String, enum: ['herbal', 'medical', null], default: null },
  gender: { type: String, enum: ['male', 'female', null], default: null },
  status: { type: String, enum: ['online', 'offline', 'busy'], default: 'offline' },
  avatarUrl: { type: String },
  loyaltyPoints: { type: Number, default: 0 }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }, // in OMR
  description: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  ingredients: [String],
  benefits: [String],
  rating: { type: Number, default: 4.8 },
  reviewCount: { type: Number, default: 10 },
  discountPercent: { type: Number, default: 0 },
  suggestedUse: { type: String },
  sku: { type: String },
  reviews: [{
    author: String,
    location: String,
    rating: Number,
    text: String,
    date: String
  }]
}, { timestamps: true });

const ConversationSchema = new mongoose.Schema({
  customerName: { type: String, default: 'Anonymous Customer' },
  customerAge: { type: Number, required: true },
  customerGender: { type: String, required: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  preferredSpecialty: { type: String, enum: ['herbal', 'medical'], required: true },
  preferredGender: { type: String, enum: ['male', 'female', 'any'], required: true },
  status: { type: String, enum: ['pending', 'active', 'closed'], default: 'pending' },
  lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: String, required: true }, // Can be User ID or 'anonymous-customer'
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  attachmentUrl: { type: String, default: null } // Supporting clinical attachment logs
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  suburb: { type: String, required: true }, // Region/City
  state: { type: String, required: true }, // State/Province
  postcode: { type: String, required: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' }
}, { timestamps: true });

let MongoUser, MongoProduct, MongoConversation, MongoMessage, MongoOrder;

try {
  MongoUser = mongoose.models.User || mongoose.model('User', UserSchema);
  MongoProduct = mongoose.models.Product || mongoose.model('Product', ProductSchema);
  MongoConversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
  MongoMessage = mongoose.models.Message || mongoose.model('Message', MessageSchema);
  MongoOrder = mongoose.models.Order || mongoose.model('Order', OrderSchema);
} catch (e) {}

// Helper to generate IDs
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 2. MOCK CLASS MODEL (For JSON File Fallback Mode)
class MockModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  getCollection() {
    const db = readJsonDb();
    return db[this.collectionName] || [];
  }

  saveCollection(items) {
    const db = readJsonDb();
    db[this.collectionName] = items;
    writeJsonDb(db);
  }

  _populate(item) {
    if (!item) return null;
    const db = readJsonDb();
    const cloned = JSON.parse(JSON.stringify(item));

    if (this.collectionName === 'conversations') {
      if (cloned.agent) {
        cloned.agent = db.users.find((u) => u._id === cloned.agent) || cloned.agent;
      }
    }
    return cloned;
  }

  async find(query = {}) {
    let items = this.getCollection();
    
    const matchesQuery = (item, q) => {
      for (let key in q) {
        const queryVal = q[key];
        if (queryVal === undefined) continue;

        if (key === '$or') {
          if (Array.isArray(queryVal)) {
            const matched = queryVal.some(subQuery => matchesQuery(item, subQuery));
            if (!matched) return false;
          }
          continue;
        }

        if (key === '$and') {
          if (Array.isArray(queryVal)) {
            const matched = queryVal.every(subQuery => matchesQuery(item, subQuery));
            if (!matched) return false;
          }
          continue;
        }

        const itemVal = item[key];
        if (queryVal && typeof queryVal === 'object' && !Array.isArray(queryVal)) {
          if ('$in' in queryVal) {
            const inArray = queryVal['$in'];
            if (Array.isArray(inArray)) {
              const itemValStr = itemVal ? itemVal.toString() : '';
              if (!inArray.map(v => v ? v.toString() : '').includes(itemValStr)) return false;
            }
          } else if ('$nin' in queryVal) {
            const ninArray = queryVal['$nin'];
            if (Array.isArray(ninArray)) {
              const itemValStr = itemVal ? itemVal.toString() : '';
              if (ninArray.map(v => v ? v.toString() : '').includes(itemValStr)) return false;
            }
          } else {
            if (JSON.stringify(itemVal) !== JSON.stringify(queryVal)) return false;
          }
        } else {
          const itemStr = itemVal ? itemVal.toString() : '';
          const queryStr = queryVal ? queryVal.toString() : '';
          if (itemStr !== queryStr) return false;
        }
      }
      return true;
    };

    items = items.filter(item => matchesQuery(item, query));

    if (this.collectionName === 'conversations') {
      items.sort((a, b) => new Date(b.lastMessageAt || b.updatedAt).getTime() - new Date(a.lastMessageAt || a.updatedAt).getTime());
    } else if (this.collectionName === 'messages') {
      items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (this.collectionName === 'orders') {
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const populated = items.map((item) => this._populate(item));
    const result = populated;
    result.populate = () => result;
    return result;
  }

  async findOne(query = {}) {
    const items = this.getCollection();
    
    const matchesQuery = (item, q) => {
      for (let key in q) {
        const queryVal = q[key];
        if (queryVal === undefined) continue;

        if (key === '$or') {
          if (Array.isArray(queryVal)) {
            const matched = queryVal.some(subQuery => matchesQuery(item, subQuery));
            if (!matched) return false;
          }
          continue;
        }

        if (key === '$and') {
          if (Array.isArray(queryVal)) {
            const matched = queryVal.every(subQuery => matchesQuery(item, subQuery));
            if (!matched) return false;
          }
          continue;
        }

        const itemVal = item[key];
        if (queryVal && typeof queryVal === 'object' && !Array.isArray(queryVal)) {
          if ('$in' in queryVal) {
            const inArray = queryVal['$in'];
            if (Array.isArray(inArray)) {
              const itemValStr = itemVal ? itemVal.toString() : '';
              if (!inArray.map(v => v ? v.toString() : '').includes(itemValStr)) return false;
            }
          } else if ('$nin' in queryVal) {
            const ninArray = queryVal['$nin'];
            if (Array.isArray(ninArray)) {
              const itemValStr = itemVal ? itemVal.toString() : '';
              if (ninArray.map(v => v ? v.toString() : '').includes(itemValStr)) return false;
            }
          } else {
            if (JSON.stringify(itemVal) !== JSON.stringify(queryVal)) return false;
          }
        } else {
          const itemStr = itemVal ? itemVal.toString() : '';
          const queryStr = queryVal ? queryVal.toString() : '';
          if (itemStr !== queryStr) return false;
        }
      }
      return true;
    };

    const found = items.find(item => matchesQuery(item, query));
    return this._populate(found);
  }

  async findById(id) {
    if (!id) return null;
    const items = this.getCollection();
    const found = items.find((item) => item._id === id.toString());
    return this._populate(found);
  }

  async create(data) {
    const items = this.getCollection();
    const newItem = {
      _id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    this.saveCollection(items);

    if (this.collectionName === 'messages') {
      const db = readJsonDb();
      const convIndex = db.conversations.findIndex((c) => c._id === data.conversation);
      if (convIndex !== -1) {
        db.conversations[convIndex].lastMessageAt = newItem.createdAt;
        writeJsonDb(db);
      }
    }
    return this._populate(newItem);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    if (!id) return null;
    const items = this.getCollection();
    const index = items.findIndex((item) => item._id === id.toString());
    if (index === -1) return null;

    const original = items[index];
    const updated = {
      ...original,
      ...update,
      updatedAt: new Date().toISOString()
    };
    items[index] = updated;
    this.saveCollection(items);
    return this._populate(updated);
  }

  async updateOne(query = {}, update) {
    const items = this.getCollection();
    const index = items.findIndex((item) => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (index === -1) return { nModified: 0 };

    items[index] = {
      ...items[index],
      ...update,
      updatedAt: new Date().toISOString()
    };
    this.saveCollection(items);
    return { nModified: 1 };
  }
}

const MockUser = new MockModel('users');
const MockProduct = new MockModel('products');
const MockConversation = new MockModel('conversations');
const MockMessage = new MockModel('messages');
const MockOrder = new MockModel('orders');

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    isMock = true;
    console.log('⚠️ MONGODB_URI not configured. Using Local JSON Mock Database.');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    isMock = false;
    console.log('✨ MongoDB Connected successfully!');
  } catch (err) {
    isMock = true;
    console.warn(`⚠️ Failed to connect to MongoDB: "${err.message}". Using Local JSON Mock Database.`);
  }
}

const createModelProxy = (getMongoModel, getMockModel) => {
  return new Proxy(function() {}, {
    get(target, prop, receiver) {
      const model = isMock ? getMockModel() : getMongoModel();
      const value = Reflect.get(model, prop);
      if (typeof value === 'function') {
        return value.bind(model);
      }
      return value;
    },
    construct(target, argumentsList, newTarget) {
      const model = isMock ? getMockModel() : getMongoModel();
      return Reflect.construct(model, argumentsList);
    }
  });
};

const UserProxy = createModelProxy(() => MongoUser, () => MockUser);
const ProductProxy = createModelProxy(() => MongoProduct, () => MockProduct);
const ConversationProxy = createModelProxy(() => MongoConversation, () => MockConversation);
const MessageProxy = createModelProxy(() => MongoMessage, () => MockMessage);
const OrderProxy = createModelProxy(() => MongoOrder, () => MockOrder);

module.exports = {
  connectDB,
  get isMock() { return isMock; },
  User: UserProxy,
  Product: ProductProxy,
  Conversation: ConversationProxy,
  Message: MessageProxy,
  Order: OrderProxy
};

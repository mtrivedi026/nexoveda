const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const dev = process.env.NODE_ENV === 'development' || (process.env.NODE_ENV !== 'production' && !process.env.PORT && !process.env.MONGODB_URI);
const isStandalone = process.env.STANDALONE_BACKEND && process.env.STANDALONE_BACKEND.replace(/['"]/g, '') === 'true';

let nextApp, handle;
if (!isStandalone) {
  const next = require('next');
  nextApp = next({ dev });
  handle = nextApp.getRequestHandler();
}

const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'nexoveda_super_secret_session_key_2026';

// Initialize DB
const db = require('./lib/db');
const { connectDB, User, Product, Conversation, Message, Order, OtpToken } = db;

async function startServer() {
  if (!isStandalone) {
    await nextApp.prepare();
  }

  const app = express();
  const server = http.createServer(app);
  
  // Connect to database in the background (prevent blocking server listen)
  connectDB().then(async () => {
    try {
      const products = await Product.find({});
      if (products.length === 0) {
        console.log('📭 Database appears to be empty. Running auto-seed...');
        const { seedDatabase } = require('./lib/seed');
        await seedDatabase(db);
      } else {
        console.log(`📊 Found ${products.length} products in database. Auto-seed skipped.`);
      }
    } catch (seedErr) {
      console.error('⚠️ Auto-seeding check failed:', seedErr.message || seedErr);
    }
  }).catch((err) => {
    console.error('⚠️ Database connection failed in background:', err.message || err);
  });

  // Socket.io integration
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  app.use(cors());
  app.use(express.json());

  // Global DB connection middleware to ensure database status (isMock) is resolved before queries
  app.use(async (req, res, next) => {
    try {
      await connectDB();
    } catch (err) {
      console.error('Database connection middleware error:', err.message || err);
    }
    next();
  });

  // Socket.io user socket mapping
  const userSockets = {};

  // Middleware to verify JWT tokens
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Session expired or invalid' });
      req.user = user;
      next();
    });
  };

  // --- API AUTH ROUTES ---

  // Auth: Login (For Customers, Support Staff, and Admins)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
      }
      let user = await User.findOne({ email });
      if (!user) {
        try {
          const { syncAgents } = db;
          if (syncAgents) {
            await syncAgents(db);
            user = await User.findOne({ email });
          }
        } catch (syncErr) {
          console.warn('Self-healing sync failed:', syncErr);
        }
        
        if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
      }

      let isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        try {
          const { syncAgents } = db;
          if (syncAgents) {
            await syncAgents(db);
            const retriedUser = await User.findOne({ email });
            if (retriedUser) {
              user = retriedUser;
              isMatch = await bcrypt.compare(password, user.password);
            }
          }
        } catch (syncErr) {
          console.warn('Self-healing sync failed:', syncErr);
        }
        
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });
      }

      // If user is support staff, set status to online upon login
      if (user.role === 'agent') {
        await User.findByIdAndUpdate(user._id, { status: 'online' });
        io.to('admins').emit('agent-status-updated', { agentId: user._id, status: 'online' });
      }

      const token = jwt.sign(
        { 
          userId: user._id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          specialty: user.specialty,
          gender: user.gender
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          specialty: user.specialty,
          gender: user.gender,
          status: user.status || 'offline',
          avatarUrl: user.avatarUrl,
          loyaltyPoints: user.loyaltyPoints || 0
        }
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // Auth: Get Profile
  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ message: 'Profile not found.' });
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialty: user.specialty,
        gender: user.gender,
        status: user.status,
        avatarUrl: user.avatarUrl,
        loyaltyPoints: user.loyaltyPoints || 0
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // --- API PRODUCT CATALOG ROUTES ---

  // Products list
  app.get('/api/products', async (req, res) => {
    try {
      const products = await Product.find({});
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: 'Failed to list products.', error: err.message });
    }
  });

  // Submit Verified Product Review
  app.post('/api/products/:id/reviews', async (req, res) => {
    try {
      const { id } = req.params;
      const { author, location, rating, text } = req.body;

      if (!author || !rating || !text) {
        return res.status(400).json({ message: 'Missing rating, review text or nickname.' });
      }

      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ message: 'Product not found.' });

      const newReview = {
        author,
        location: location || 'Global',
        rating: Number(rating),
        text,
        date: new Date().toISOString().split('T')[0]
      };

      const reviews = product.reviews || [];
      reviews.push(newReview);

      // Recalculate average rating & count
      const totalRatingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = Number((totalRatingSum / reviews.length).toFixed(1));

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { 
          reviews,
          rating: avgRating,
          reviewCount: reviews.length
        },
        { new: true }
      );

      res.status(201).json(updatedProduct);
    } catch (err) {
      res.status(500).json({ message: 'Failed to submit review.', error: err.message });
    }
  });

  // --- API CHECKOUT & ORDER ROUTES ---

  // Validate Promo Code
  app.post('/api/promo/validate', (req, res) => {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ message: 'Promo code is required.' });

    const activeCode = code.trim().toUpperCase();
    let discountPercent = 0;

    if (activeCode === 'NEXO10') {
      discountPercent = 10;
    } else if (activeCode === 'WELCOME15') {
      discountPercent = 15;
    } else {
      return res.status(400).json({ message: 'Invalid coupon code.' });
    }

    const discountValue = Number((subtotal * (discountPercent / 100)).toFixed(2));
    res.json({
      code: activeCode,
      discountPercent,
      discountValue
    });
  });

  // Place Order (With Loyalty Point Redemptions)
  app.post('/api/orders', async (req, res) => {
    try {
      const { 
        customerName, customerEmail, customerPhone,
        addressLine1, suburb, state, postcode,
        items, subtotal, shippingCost, total,
        redeemedPoints, customerId
      } = req.body;

      if (!customerName || !customerEmail || !customerPhone || !addressLine1 || !suburb || !items || items.length === 0) {
        return res.status(400).json({ message: 'Missing required shipping or items parameters.' });
      }

      const newOrder = await Order.create({
        customerName,
        customerEmail,
        customerPhone,
        addressLine1,
        suburb,
        state,
        postcode,
        items,
        subtotal,
        shippingCost,
        total,
        status: 'pending'
      });

      // Deduct loyalty points and credit new points
      if (customerId) {
        const user = await User.findById(customerId);
        if (user) {
          let points = user.loyaltyPoints || 0;
          if (redeemedPoints && redeemedPoints > 0) {
            points = Math.max(0, points - redeemedPoints);
          }
          // Earn 5% credit on current purchase total
          const pointsEarned = total * 0.05;
          const finalPoints = Number((points + pointsEarned).toFixed(2));
          await User.findByIdAndUpdate(customerId, { loyaltyPoints: finalPoints });
        }
      }

      // Notify admins
      io.to('admins').emit('new-order-received', newOrder);

      res.status(201).json(newOrder);
    } catch (err) {
      res.status(500).json({ message: 'Failed to place order.', error: err.message });
    }
  });

  // Fetch Orders
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await Order.find({});
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: 'Failed to list orders.', error: err.message });
    }
  });

  // Update Order Shipment Status (Pending -> Shipped -> Delivered)
  app.patch('/api/orders/:orderId/status', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Administrator privilege required.' });
      }
      const { orderId } = req.params;
      const { status } = req.body;

      if (!['pending', 'shipped', 'delivered'].includes(status)) {
        return res.status(400).json({ message: 'Invalid shipment status values.' });
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );

      if (!updatedOrder) return res.status(404).json({ message: 'Order not found.' });

      // Notify admins
      io.to('admins').emit('order-status-changed', updatedOrder);
      // Notify clients
      io.emit('client-order-status-updated', updatedOrder);

      res.json(updatedOrder);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update order shipment status.', error: err.message });
    }
  });

  // --- API CHAT CONSULTATION ROUTES ---

  // Initiate Anonymous Consultation & Match Specialist
  app.post('/api/chats/initiate', async (req, res) => {
    try {
      const { customerAge, customerGender, preferredSpecialty, preferredGender } = req.body;

      if (!customerAge || !customerGender || !preferredSpecialty || !preferredGender) {
        return res.status(400).json({ message: 'Please specify age, gender, specialist type, and gender preference.' });
      }

      if (Number(customerAge) < 18) {
        return res.status(400).json({ message: 'Consultation is only available for individuals aged 18 and older.' });
      }

      let selectedAgent = null;

      if (preferredSpecialty === 'mental_health') {
        selectedAgent = await User.findOne({ email: 'smita@nexoveda.com' });
      } else {
        if (preferredGender === 'male') {
          selectedAgent = await User.findOne({ email: 'harsh@nexoveda.com' });
        } else if (preferredGender === 'female') {
          selectedAgent = await User.findOne({ email: 'anamika@nexoveda.com' });
        } else {
          const harsh = await User.findOne({ email: 'harsh@nexoveda.com' });
          const anamika = await User.findOne({ email: 'anamika@nexoveda.com' });

          if (harsh && anamika) {
            const harshChats = (await Conversation.find({ agent: harsh._id, status: 'active' })).length;
            const anamikaChats = (await Conversation.find({ agent: anamika._id, status: 'active' })).length;
            selectedAgent = harshChats <= anamikaChats ? harsh : anamika;
          } else {
            selectedAgent = harsh || anamika;
          }
        }
      }

      // Generate unique reference number
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let referenceNumber = 'NEXO-';
      for (let i = 0; i < 5; i++) {
        referenceNumber += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Create conversation
      let newConv = await Conversation.create({
        customerName: 'Anonymous Customer',
        customerAge: Number(customerAge),
        customerGender,
        preferredSpecialty,
        preferredGender,
        referenceNumber,
        agent: selectedAgent ? selectedAgent._id : null,
        status: selectedAgent ? 'active' : 'pending'
      });

      // Trigger email and whatsapp alerts asynchronously
      try {
        const { sendConsultationNotification } = require('./lib/notification');
        sendConsultationNotification(newConv).catch(console.error);
      } catch (notifErr) {
        console.error('Failed to trigger consultation alert notification:', notifErr);
      }

      if (selectedAgent) {
        // Notify matched agent socket
        const agentSocketId = userSockets[selectedAgent._id];
        if (agentSocketId) {
          io.to(agentSocketId).emit('chat-assigned', newConv);
        }
      }

      // Notify Admin
      io.to('admins').emit('new-pending-chat', newConv);
      res.status(201).json(newConv);
    } catch (err) {
      res.status(500).json({ message: 'Routing failed', error: err.message });
    }
  });

  // List Rooms
  app.get('/api/chats/rooms', authenticateToken, async (req, res) => {
    try {
      const { role, userId } = req.user;
      let rooms = [];

      if (role === 'admin') {
        rooms = await Conversation.find({ status: { $in: ['pending', 'active'] } });
      } else if (role === 'agent') {
        const agentProfile = await User.findById(userId);
        rooms = await Conversation.find({
          $or: [
            { agent: userId, status: 'active' },
            { status: 'pending', preferredSpecialty: agentProfile.specialty }
          ]
        });
      } else {
        rooms = await Conversation.find({ customer: userId });
      }
      res.json(rooms);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch rooms', error: err.message });
    }
  });

  // Get Messages
  app.get('/api/chats/rooms/:roomId/messages', async (req, res) => {
    try {
      const { roomId } = req.params;
      const messages = await Message.find({ conversation: roomId });
      const jsonMessages = messages.map((m) => m.toJSON ? m.toJSON() : m);
      res.json(jsonMessages);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch messages', error: err.message });
    }
  });

  // Get Room Details
  app.get('/api/chats/rooms/:roomId', async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await Conversation.findById(roomId);
      if (!room) return res.status(404).json({ message: 'Room not found.' });
      
      let populatedRoom = room;
      if (typeof room.populate === 'function') {
        populatedRoom = await room.populate('agent');
      }
      res.json(populatedRoom);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch room', error: err.message });
    }
  });

  // Manual assignment by Admin
  app.post('/api/chats/rooms/:roomId/assign', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'agent') {
        return res.status(403).json({ message: 'Access denied: Admin or Agent privileges required.' });
      }
      if (req.user.role === 'agent' && req.user.userId !== agentId) {
        return res.status(403).json({ message: 'Access denied: Agents can only claim chats for themselves.' });
      }
      const { roomId } = req.params;
      const { agentId } = req.body;

      const agent = await User.findById(agentId);
      if (!agent || agent.role !== 'agent') {
        return res.status(404).json({ message: 'Specialist agent not found.' });
      }

      const updatedConv = await Conversation.findByIdAndUpdate(
        roomId,
        { agent: agentId, status: 'active' },
        { new: true }
      );

      // Notify room members
      io.to(roomId).emit('chat-assigned', updatedConv);

      const agentSocketId = userSockets[agentId];
      if (agentSocketId) {
        io.to(agentSocketId).emit('chat-assigned', updatedConv);
      }

      io.to('admins').emit('queue-updated');
      res.json(updatedConv);
    } catch (err) {
      res.status(500).json({ message: 'Failed to assign agent.', error: err.message });
    }
  });

  // Close Conversation
  app.post('/api/chats/rooms/:roomId/close', async (req, res) => {
    try {
      const { roomId } = req.params;
      const updatedConv = await Conversation.findByIdAndUpdate(
        roomId,
        { status: 'closed' },
        { new: true }
      );
      io.to(roomId).emit('chat-closed', updatedConv);
      io.to('admins').emit('queue-updated');
      res.json(updatedConv);
    } catch (err) {
      res.status(500).json({ message: 'Failed to close conversation.', error: err.message });
    }
  });

  // POST Message (HTTP Polling fallback support)
  app.post('/api/chats/rooms/:roomId/messages', async (req, res) => {
    try {
      const { roomId } = req.params;
      const { sender, senderName, text, attachmentUrl } = req.body;

      if (!sender || !senderName || !text) {
        return res.status(400).json({ message: 'Missing sender, senderName, or text' });
      }

      const msg = await Message.create({
        conversation: roomId,
        sender,
        senderName,
        text,
        attachmentUrl: attachmentUrl || null
      });

      await Conversation.findByIdAndUpdate(roomId, { lastMessageAt: new Date() });

      // Broadcast to any active socket connection
      const serializedMsg = msg.toJSON ? msg.toJSON() : msg;
      io.to(roomId).emit('recv-msg', serializedMsg);
      io.to('admins').emit('admin-recv-msg', serializedMsg);

      res.status(201).json(msg);
    } catch (err) {
      res.status(500).json({ message: 'Failed to send message', error: err.message });
    }
  });

  // Agents list
  app.get('/api/agents', authenticateToken, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required.' });
      }
      const agents = await User.find({ role: 'agent' });
      res.json(agents);
    } catch (err) {
      res.status(500).json({ message: 'Failed to list agents.', error: err.message });
    }
  });

  // Agent Status Toggle
  app.post('/api/agents/status', authenticateToken, async (req, res) => {
    try {
      const { status } = req.body;
      if (req.user.role !== 'agent') return res.status(403).json({ message: 'Agent only.' });
      
      const updatedAgent = await User.findByIdAndUpdate(
        req.user.userId,
        { status },
        { new: true }
      );

      // Notify admin
      io.to('admins').emit('agent-status-updated', {
        agentId: updatedAgent._id,
        status: updatedAgent.status
      });

      res.json(updatedAgent);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update status', error: err.message });
    }
  });

  // Chat Attachment upload simulation
  app.post('/api/chats/rooms/:roomId/attachments', (req, res) => {
    res.json({
      uploadUrl: `http://localhost:${port}/api/upload/mock`,
      fileUrl: `/symptom_report.pdf`
    });
  });

  // --- SOCKET.IO EVENT HANDLERS ---
  io.on('connection', (socket) => {
    let currentUserId = null;

    socket.on('register-socket', ({ userId, role }) => {
      currentUserId = userId;
      userSockets[userId] = socket.id;

      if (role === 'admin') {
        socket.join('admins');
      }
      console.log(`🔌 Socket registered for user ${userId} (${role})`);
    });

    socket.on('join-room', ({ roomId }) => {
      socket.join(roomId);
      console.log(`💬 Socket joined room ${roomId}`);
    });

    socket.on('send-msg', async ({ roomId, senderId, senderName, text, attachmentUrl }) => {
      try {
        const msg = await Message.create({
          conversation: roomId,
          sender: senderId,
          senderName,
          text,
          attachmentUrl: attachmentUrl || null
        });

        const serializedMsg = msg.toJSON ? msg.toJSON() : msg;
        io.to(roomId).emit('recv-msg', serializedMsg);
        io.to('admins').emit('admin-recv-msg', serializedMsg);

        // Simulated Agent Auto-Reply for offline/testing agents in Mock mode
        if (db.isMock && senderId === 'anonymous-customer') {
          const conv = await Conversation.findById(roomId);
          if (conv && conv.agent && conv.status === 'active') {
            const agentId = conv.agent._id || conv.agent;
            // Check if agent socket is connected
            const isAgentConnected = !!userSockets[agentId];
            if (!isAgentConnected) {
              // Simulate typing indicator after 1 second
              setTimeout(() => {
                io.to(roomId).emit('user-typing', { userId: agentId, name: 'Advisor', isTyping: true });
              }, 1000);

              // Send response after 3 seconds total
              setTimeout(async () => {
                io.to(roomId).emit('user-typing', { userId: agentId, name: 'Advisor', isTyping: false });

                const agent = await User.findById(agentId);
                const agentName = agent ? agent.name : 'Wellness Specialist';
                let replyText = "Hello! I am reviewing your symptoms. Please tell me more about your daily habits.";
                
                if (agent && agent.specialty === 'medical') {
                  replyText = `Hello, I am Dr. Anamika Verma (Gyne). As a medical health consultant, I suggest KSM-66 Ashwagandha with warm milk after meals to lower stress and muscle fatigue. How can I support you today?`;
                } else if (agent && agent.specialty === 'herbal') {
                  replyText = `Greetings, I am Dr. Harsh Rawat (B.A.M.S.). I recommend organic Himalayan Shilajit for cellular energy, or Eucalyptus honey elixir for fatigue. Do you have any other recovery issues?`;
                } else if (agent && agent.specialty === 'mental_health') {
                  replyText = `Hello, I am Ms. Smita Gupta (M. A. Psychology). As a mental health support advisor, how can I help you today? Please feel free to share whatever is on your mind.`;
                }

                const replyMsg = await Message.create({
                  conversation: roomId,
                  sender: agentId,
                  senderName: agentName,
                  text: replyText,
                  attachmentUrl: null
                });

                io.to(roomId).emit('recv-msg', replyMsg);
                io.to('admins').emit('admin-recv-msg', replyMsg);
              }, 3000);
            }
          }
        }
      } catch (err) {
        console.error('Socket message save error:', err);
      }
    });

    socket.on('typing', ({ roomId, userId, name, isTyping }) => {
      socket.to(roomId).emit('user-typing', { userId, name, isTyping });
    });

    socket.on('disconnect', () => {
      if (currentUserId) {
        delete userSockets[currentUserId];
        console.log(`🔌 Socket disconnected for user ${currentUserId}`);
      }
    });
  });

  // Catch-all
  if (isStandalone) {
    app.all(/.*/, (req, res) => {
      res.status(404).json({ message: 'API Endpoint not found in standalone backend' });
    });

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`🚀 Standalone Backend API Server running at http://localhost:${port}`);
    });
  } else {
    app.all(/.*/, (req, res) => {
      return handle(req, res);
    });

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`🚀 Nexoveda Web Server running at http://localhost:${port} in ${dev ? 'development' : 'production'} mode`);
    });
  }
}

startServer().catch(console.error);

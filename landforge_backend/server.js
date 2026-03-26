require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:8080', 'http://localhost:5173'] }));
app.use(express.json());

// Routes
app.use('/api/auth',        require('./src/routes/auth'));
app.use('/api/properties',  require('./src/routes/properties'));
app.use('/api/verifications', require('./src/routes/verifications'));
app.use('/api/area-reports', require('./src/routes/areaReports'));
app.use('/api/payments',    require('./src/routes/payments'));
app.use('/api/withdrawals', require('./src/routes/withdrawals'));
app.use('/api/wallet',      require('./src/routes/wallet'));
app.use('/api/sui-events',  require('./src/routes/suiEvents'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Connect to MongoDB then start
const PORT = process.env.PORT || 3001;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 LandForge API running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB connection error:', err.message); process.exit(1); });

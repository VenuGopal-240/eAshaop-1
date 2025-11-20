const allowedOrigins = [
  'https://eashaop.com',
  'https://www.eashaop.com',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
];

const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
};

module.exports = corsOptions;

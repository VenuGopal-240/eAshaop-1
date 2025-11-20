// server.js
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const http = require('http');

dotenv.config();
console.log('Loaded CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);

const connectDB = require('./config/db');
connectDB();

const User = require('./models/user');
const Doctor = require('./models/doctorModel');
const Appointment = require('./models/Appointment');

const doctorRoutes = require('./routes/doctorRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const patientRoutes = require('./routes/patientRoutes');
const contactRoutes = require('./routes/contactRoutes');
const apiRoutes = require('./routes/api/index');
const appointmentRoutes = require('./routes/appointmentRoutes');
const reviewRoutes = require('./routes/reviewAndRatingRoutes/reviewRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes/whatsappRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const { notFound, errorHandler } = require('./middlewares/error');
const corsOptions = require('./config/corsConfig');
const { protect } = require("./middlewares/authMiddleware");


const app = express();
const server = http.createServer(app);

const { initSocket } = require('./services/socketService');
const io = initSocket(server);
app.set('io', io);

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use(
  '/api/appointments/razorpay/webhook',
  express.raw({ type: 'application/json' })
);

app.get('/', (req, res) => res.json({ servicename: 'first app module' }));
app.use('/api/doctors', doctorRoutes);
app.use('/api/categories',protect, categoryRoutes);
app.use('/api/prescriptions',protect, prescriptionRoutes);
app.use('/api/patients',protect, patientRoutes);
app.use('/api/contact',protect, contactRoutes);
app.use('/api',protect, apiRoutes);
app.use('/api/appointments',protect, appointmentRoutes);
app.use('/api',protect, reviewRoutes);
app.use('/api/whatsapp',protect, whatsappRoutes);
app.use('/api/notifications',protect, notificationRoutes);

app.use(notFound);
app.use(errorHandler);

const cron = require('node-cron');

cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const fiveMinsLater = new Date(now.getTime() + 5 * 60 * 1000);

    const appointments = await Appointment.find({
      type: 'video',
      jitsiLink: null,
      status: 'booked',
    });

    for (let appt of appointments) {
      const [hourStr, minuteStr] = appt.time.split(':');
      const apptDateTime = new Date(appt.date);
      apptDateTime.setHours(parseInt(hourStr), parseInt(minuteStr), 0, 0);

      if (apptDateTime - now <= 5 * 60 * 1000 && apptDateTime > now) {
        const jitsiLink = `https://meet.jit.si/EashaOP-${appt._id}-${Date.now()}`;
        appt.jitsiLink = jitsiLink;
        await appt.save();

        await User.updateOne(
          { _id: appt.userId },
          { $set: { 'appointments.$[elem].jitsiLink': jitsiLink } },
          { arrayFilters: [{ 'elem.appointmentId': appt._id }] }
        );

        await Doctor.updateOne(
          { _id: appt.doctorId },
          { $set: { 'appointments.$[elem].jitsiLink': jitsiLink } },
          { arrayFilters: [{ 'elem.appointmentId': appt._id }] }
        );

        console.log('Generated Jitsi link for appointment:', appt._id);
      }
    }
  } catch (err) {
    console.error('Error generating Jitsi links:', err);
  }
});

// const swaggerDocs = require('./config/swagger');
// swaggerDocs(app);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err && err.message.includes('Invalid file type')) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
  next();
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    'Vonage API Key loaded:',
    process.env.VONAGE_API_KEY ? 'Yes' : 'No'
  );
});

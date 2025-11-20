// services/socketService.js
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Category = require('../models/categoryModel');
const Doctor = require('../models/doctorModel');
const User = require('../models/user');
const corsOptions = require('../config/corsConfig');

let io;
const activeDoctorStreams = {};

/**
 * Initialize Socket.IO
 * @param {http.Server} server
 */
function initSocket(server) {
  io = new Server(server, {
    cors: corsOptions,
    pingInterval: 10000,
    pingTimeout: 20000,
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('joinDoctorRoom', (doctorId) => {
      socket.join(doctorId);
      console.log(`Doctor ${doctorId} joined room`);
    });

    socket.on('joinUserRoom', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    socket.on('joinCategoryRoom', (categoryId) => {
      socket.join(categoryId);
      console.log(`User joined category room: ${categoryId}`);
    });

    socket.on('joinDoctorProfileRoom', (doctorId) => {
      socket.join(doctorId);
      if (!activeDoctorStreams[doctorId]) {
        activeDoctorStreams[doctorId] = setupDoctorChangeStream(doctorId);
      }
      console.log(`Doctor ${doctorId} profile room joined`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  if (process.env.USE_CHANGE_STREAMS === 'true') {
    setupAppointmentChangeStream();
    setupCategoryChangeStream();
    setupUserChangeStream();
  }

  return io;
}

/**
 * Appointment Change Stream → emits updates to doctors
 */
function setupAppointmentChangeStream() {
  mongoose.connection.once('open', () => {
    const changeStream = Appointment.watch();
    changeStream.on('change', async (change) => {
      const docId = change.documentKey?._id;
      if (!docId) return;

      if (['insert', 'update', 'replace'].includes(change.operationType)) {
        const updatedDoc = await Appointment.findById(docId).lean();
        if (updatedDoc?.doctorId) {
          io.to(updatedDoc.doctorId.toString()).emit('appointmentUpdated', updatedDoc);
        }
      } else if (change.operationType === 'delete') {
        const doctorId = change.fullDocumentBeforeChange?.doctorId;
        if (doctorId) {
          io.to(doctorId.toString()).emit('appointmentDeleted', docId);
        }
      }
    });
  });
}

/**
 * Category Change Stream → emits doctor list updates
 */
function setupCategoryChangeStream() {
  mongoose.connection.once('open', () => {
    const changeStream = Doctor.watch([], { fullDocument: 'updateLookup' });
    changeStream.on('change', (change) => {
      if (['insert', 'update', 'replace', 'delete'].includes(change.operationType)) {
        io.emit('categoryDoctorsUpdated', {
          type: change.operationType,
          time: new Date(),
        });
      }
    });
  });
}

/**
 * User Change Stream → emits profile image updates
 */
function setupUserChangeStream() {
  mongoose.connection.once('open', () => {
    const changeStream = User.watch([], { fullDocument: 'updateLookup' });
    changeStream.on('change', (change) => {
      if (['update', 'replace'].includes(change.operationType)) {
        const updatedUser = change.fullDocument;
        if (change.updateDescription?.updatedFields?.profileImage) {
          io.to(updatedUser._id.toString()).emit('UserprofileImageUpdated', {
            userId: updatedUser._id,
            profileImage: updatedUser.profileImage,
          });
        }
      }
    });
  });
}

/**
 * Doctor Change Stream → emits profile image updates
 * @param {string} doctorId
 * @returns changeStream
 */
function setupDoctorChangeStream(doctorId) {
  const objectId = new mongoose.Types.ObjectId(doctorId);
  const pipeline = [
    { $match: { 'documentKey._id': objectId, operationType: { $in: ['update', 'replace'] } } },
  ];
  const changeStream = Doctor.watch(pipeline, { fullDocument: 'updateLookup' });

  changeStream.on('change', (change) => {
    const updatedDoctor = change.fullDocument;
    const updatedFields = change.updateDescription?.updatedFields || {};
    if (updatedFields.profileImage) {
      io.to(doctorId.toString()).emit('DoctorprofileImageUpdated', {
        DoctorId: doctorId,
        profileImage: updatedDoctor.profileImage,
      });
    }
  });

  return changeStream;
}

/**
 * Emit notification anywhere in app
 * @param {string} userId
 * @param {object} notification
 */
function emitNotification(userId, notification) {
  if (io) {
    io.to(userId.toString()).emit('newNotification', {
      message: notification.message,
      _id: notification._id,
      createdAt: notification.createdAt,
    });
    console.log(`Notification sent to user ${userId}`);
  }
}

module.exports = { initSocket, emitNotification };

const Appointment = require("../models/Appointment");
const Doctor = require("../models/doctorModel");
const User = require("../models/user");
const DoctorAvailability = require("../models/doctorAvailability"); // you already have
const UserNotification = require("../models/userNotification");
const DoctorNotification=require("../models/doctorNotification");
const {sendAppointmentNotifications}=require("../controllers/notificationController")
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");
const { raw } = require("body-parser");
const { response } = require("express");
const moment = require("moment-timezone");

// Helper: Generate Jitsi Meeting Link
function generateJitsiLink(appointmentId) {
  return `https://meet.jit.si/consult_${appointmentId}_${Date.now()}`;
}

// Book Appointment
// exports.bookAppointment = async (req, res) => {
//   try {
//     const { userId, doctorId, date, time, type, dependent } = req.body;

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) return res.status(404).json({ message: "Doctor not found" });

//     const requestedDateStart = new Date(date);
//     requestedDateStart.setHours(0, 0, 0, 0);

//     const requestedDateEnd = new Date(requestedDateStart);
//     requestedDateEnd.setHours(23, 59, 59, 999);

//     const availability = await DoctorAvailability.findOne({
//       doctor: doctorId,
//       date: { $gte: requestedDateStart, $lte: requestedDateEnd },
//     });

//     if (!availability) {
//       return res
//         .status(400)
//         .json({ message: "Doctor is not available on this date" });
//     }

//     const [reqHour, reqMinute] = time.split(":").map(Number);
//     const requestedMinutes = reqHour * 60 + reqMinute;

//     const [startHour, startMinute] = availability.startTime
//       .split(":")
//       .map(Number);
//     const [endHour, endMinute] = availability.endTime.split(":").map(Number);

//     const startMinutes = startHour * 60 + startMinute;
//     const endMinutes = endHour * 60 + endMinute;

//     const now = new Date();
//     if (
//       requestedDateStart.toDateString() === now.toDateString() &&
//       requestedMinutes <= now.getHours() * 60 + now.getMinutes()
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Cannot book an appointment in the past" });
//     }

//     if (requestedMinutes < startMinutes || requestedMinutes > endMinutes) {
//       return res
//         .status(400)
//         .json({ message: "Doctor is not available for this slot" });
//     }

//     const newAppointment = new Appointment({
//       userId,
//       doctorId,
//       type,
//       date: requestedDateStart,
//       time,
//       dependent: dependent || null,
//       status: "booked",
//       jitsiLink: null,
//     });

//     const savedAppointment = await newAppointment.save();

//     const appointmentSubDoc = {
//       appointmentId: savedAppointment._id,
//       userId,
//       doctorId,
//       type,
//       date: savedAppointment.date,
//       time,
//       dependent: savedAppointment.dependent,
//       status: savedAppointment.status,
//       jitsiLink: savedAppointment.jitsiLink,
//     };

//     await User.findByIdAndUpdate(userId, {
//       $push: { appointments: appointmentSubDoc },
//     });
//     await Doctor.findByIdAndUpdate(doctorId, {
//       $push: { appointments: appointmentSubDoc },
//     });

//     res.status(201).json({
//       message: "Appointment booked successfully",
//       appointment: savedAppointment,
//     });
//   } catch (error) {
//     console.error("Book Appointment Error:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// Get User Appointments
exports.getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.params;

    const appointments = await Appointment.find({ userId })
      .populate(
        "doctorId",
        "name education speciality hospitalName hospitalLocation consultationMode email mobile profileImage"
      )
      .lean();

    const now = moment().tz("Asia/Kolkata");

    const doctorIds = [...new Set(appointments.map(a => a.doctorId?._id))];
    const doctorAvailability = await DoctorAvailability.find({
      doctor: { $in: doctorIds },
       date: { $in: appointments.map(a => new Date(a.date)) },
    }).lean();

    const slotMap = {};
    // doctorAvailability.forEach(doc => {
    //   slotMap[doc.doctor] = doc.slotDuration;
    // });
    doctorAvailability.forEach(doc => {
  const dateKey = moment(doc.date).format("YYYY-MM-DD");
  slotMap[`${doc.doctor}_${dateKey}`] = doc.slotDuration;
});

    const onGoing = [];
    const upcoming = [];
    const past = [];

    const formatAppointment = (appt, startTime, endTime) => ({
      appointmentId: appt._id,
      type: appt.type,
      date: appt.date,
      time: appt.time,
      status: appt.status,
      startTime,
      endTime,
      amount: appt.amount,
      doctor: appt.doctorId || null,
      dependent: appt.dependent || null,
      jitsiLink: appt.jitsiLink || null,
    });

    appointments.forEach((appt) => {
            const dateKey = moment(appt.date).format("YYYY-MM-DD");

      
      const slotDuration = slotMap[`${appt.doctorId?._id}_${dateKey}`] || 30;

  const timeFormat = appt.time.includes("AM") || appt.time.includes("PM")
    ? "YYYY-MM-DD hh:mm A"
    : "YYYY-MM-DD HH:mm";
      const startMoment = moment.tz(
        `${moment(appt.date).format("YYYY-MM-DD")} ${appt.time}`,
        // "YYYY-MM-DD hh:mm A",
        timeFormat,
        "Asia/Kolkata"
      );

      const endMoment = moment(startMoment).add(slotDuration, "minutes");

      if (now.isBetween(startMoment, endMoment)) {
        onGoing.push(formatAppointment(appt, startMoment.format("hh:mm A"), endMoment.format("hh:mm A")));
      } else if (startMoment.isAfter(now)) {
        upcoming.push(formatAppointment(appt, startMoment.format("hh:mm A"), endMoment.format("hh:mm A")));
      } else {
        past.push(formatAppointment(appt, startMoment.format("hh:mm A"), endMoment.format("hh:mm A")));
      }
    });

    res.status(200).json({
      totalOngoing: onGoing.length,
      totalUpcoming: upcoming.length,
      totalPast: past.length,
      onGoing,
      upcoming,
      past,
    });

  } catch (error) {
    console.error("Get User Appointments Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Cancel Appointment (Doctor only)
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });
    if (appointment.status === "cancelled")
      return res
        .status(400)
        .json({ message: "Appointment is already cancelled" });

    appointment.status = "cancelled";
    await appointment.save();

    // Free Doctor Slot
    const availability = await DoctorAvailability.findOne({
      doctorId: appointment.doctorId,
      date: appointment.date,
    });

    if (availability) {
      const slot = availability.slots.find((s) => s.time === appointment.time);
      if (slot) {
        slot.isBooked = false;
        await availability.save();
      }
    }

    await User.updateOne(
      { _id: appointment.userId },
      { $set: { "appointments.$[elem].status": "cancelled" } },
      { arrayFilters: [{ "elem.appointmentId": appointment._id }] }
    );

    await Doctor.updateOne(
      { _id: appointment.doctorId },
      { $set: { "appointments.$[elem].status": "cancelled" } },
      { arrayFilters: [{ "elem.appointmentId": appointment._id }] }
    );

    res.status(200).json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Cancel Appointment Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctorId", "name speciality email mobile")
      .populate("userId", "full_name email phone_number");

    res.status(200).json({
      totalAppointments: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get All Appointments Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/appointments/user/:userId

// exports.getUserAppointments = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const appointments = await Appointment.find({ userId })
//       .populate(
//         "doctorId",
//         "name education speciality hospitalName hospitalLocation consultationMode email mobile profileImage"
//       )
//       .lean();

//     const now = moment().tz("Asia/Kolkata"); // Current IST time

//     const formatAppointment = (appt) => ({
//       appointmentId: appt._id,
//       type: appt.type,
//       date: appt.date,
//       time: appt.time,
//       status: appt.status,
//       amount: appt.amount,
//       doctor: appt.doctorId
//         ? {
//           name: appt.doctorId.name,
//           speciality: appt.doctorId.speciality,
//           education: appt.doctorId.education,
//           consultationMode: appt.doctorId.consultationMode,
//           hospitalName: appt.doctorId.hospitalName,
//           hospitalLocation: appt.doctorId.hospitalLocation,
//           email: appt.doctorId.email,
//           mobile: appt.doctorId.mobile,
//           profileImage: appt.doctorId.profileImage,
//         }
//         : null,
//       dependent: appt.dependent || null,
//       jitsiLink: appt.jitsiLink || null,
//     });

//     const upcoming = [];
//     const past = [];

//     appointments.forEach((appt) => {
//       // Combine date + time into full datetime
//       const apptDateTime = moment.tz(
//         `${moment(appt.date).format("YYYY-MM-DD")} ${appt.time}`,
//         "YYYY-MM-DD hh:mm A",
//         "Asia/Kolkata"
//       );

//       if (apptDateTime.isSameOrAfter(now)) {
//         upcoming.push(formatAppointment(appt));
//       } else {
//         past.push(formatAppointment(appt));
//       }
//     });

//     res.status(200).json({
//       totalUpcoming: upcoming.length,
//       totalPast: past.length,
//       upcoming,
//       past,
//     });
//   } catch (error) {
//     console.error("Get User Appointments Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
// GET /api/appointments/doctor/:doctorId
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const now = new Date();

    const userIds = await Appointment.distinct('userId', { doctorId, status: 'booked' });


    let users = await User.find({ _id: { $in: userIds } }).select('-appointments');



    const userAppointments = await Appointment.find({ doctorId, userId: { $in: userIds }, status: 'booked' });

    const doctorAvailability = await DoctorAvailability.findOne({ doctor: doctorId });

    if (!doctorAvailability) {
      return res.status(404).json({ message: "Doctor availability not found" });
    }

    const slotDuration = doctorAvailability.slotDuration;

    users = users.map(user => {
      const appointment = userAppointments.find(app => app.userId.toString() === user._id.toString());
      if (appointment) {
        const start = appointment.time; // assuming time is in "HH:mm" format
        const [hours, minutes] = start.split(":").map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);

        const endDate = new Date(startDate.getTime() + slotDuration * 60000); // add slot duration

        // Format back to "HH:mm"
        const formatTime = date => date.toTimeString().slice(0, 5);

        return {
          _id: user._id,
          profileImage: user.profileImage,
          startTime: formatTime(startDate),
          endTime: formatTime(endDate),
        };
        // return {
        //   ...user.toObject(),
        //   startTime: formatTime(startDate),
        //   endTime: formatTime(endDate),
        // };
      }
      return user;
    });

    const appointmentOngoing = await Appointment.find({
      doctorId,
      date: { $lte: now },
      status: 'booked',
    }).populate("userId", "full_name email phone_number");

    const upcoming = await Appointment.find({
      doctorId: doctorId, // make sure field matches schema
      date: { $gte: now }, // 'date' is the correct field
    }).populate("userId", "full_name email phone_number");
    const ongoing = appointmentOngoing.filter(app => {
      const startDate = app.date; // assuming app.date is a Date object
      const endDate = new Date(startDate.getTime() + slotDuration * 60000);
      return endDate >= now;
    });

    const past = await Appointment.find({
      doctorId: doctorId,
      date: { $lt: now },
    }).populate("userId", "full_name email phone_number");
    const profileImage = await User.findById
    res.status(200).json({
      totalAppointments: past.length,
      upcoming,
      ongoing,
      past,
      users
    });
  } catch (error) {
    console.error("Get Doctor Appointments Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// // Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // ------------------------ Book Appointment ------------------------
// exports.bookAppointment = async (req, res) => {
//   try {
//     const { userId, doctorId, date, time, type, dependent, amount } = req.body;

//     //Validate input
//     if (!userId || !doctorId || !date || !time || !type || !amount)
//       return res.status(400).json({ message: "All fields are required" });

//     if (typeof amount !== "number" || amount <= 0)
//       return res
//         .status(400)
//         .json({ message: "Amount must be a positive number" });

//     // Check user & doctor existence
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) return res.status(404).json({ message: "Doctor not found" });

//     // Check doctor availability for the requested date
//     const requestedDateStart = new Date(date);
//     requestedDateStart.setHours(0, 0, 0, 0); // start of day

//     const requestedDateEnd = new Date(date);
//     requestedDateEnd.setHours(23, 59, 59, 999); // end of day

//     const availability = await DoctorAvailability.findOne({
//       doctor: doctorId,
//       date: { $gte: requestedDateStart, $lte: requestedDateEnd },
//     });

//     if (!availability)
//       return res
//         .status(400)
//         .json({ message: "Doctor is not available on this date" });

//     // Check requested time is within slot
//     const [reqHour, reqMinute] = time.split(":").map(Number);
//     const requestedTime = new Date(requestedDateStart);
//     requestedTime.setHours(reqHour, reqMinute, 0, 0);

//     const [startHour, startMinute] = availability.startTime
//       .split(":")
//       .map(Number);
//     const [endHour, endMinute] = availability.endTime.split(":").map(Number);
//     const startTime = new Date(requestedDateStart);
//     startTime.setHours(startHour, startMinute, 0, 0);
//     const endTime = new Date(requestedDateStart);
//     endTime.setHours(endHour, endMinute, 0, 0);

//     const now = new Date();
//     if (requestedTime < now)
//       return res
//         .status(400)
//         .json({ message: "Cannot book an appointment in the past" });
//     if (requestedTime < startTime || requestedTime > endTime)
//       return res
//         .status(400)
//         .json({ message: "Doctor is not available for this slot" });

//     // Create Razorpay order
//     const order = await razorpay.orders.create({
//       amount: amount * 100, // INR to paise
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     });

//     //Save appointment (status pending)
//     const appointment = await Appointment.create({
//       userId,
//       doctorId,
//       type,
//       date: requestedDateStart,
//       time,
//       dependent: dependent || null,
//       status: "pending",
//       amount,
//       razorpayOrderId: order.id,
//     });

//     res.status(201).json({
//       message:
//         "Razorpay order created. Complete payment to confirm appointment",
//       order,
//       appointmentId: appointment._id,
//     });
//   } catch (error) {
//     console.error("Book Appointment Error:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };


// // ------------------------ Confirm Payment ------------------------
// exports.confirmPayment = async (req, res) => {
//   try {
//     const {
//       appointmentId,
//       razorpayPaymentId,
//       razorpayOrderId,
//       razorpaySignature,
//     } = req.body;

//     if (
//       !appointmentId ||
//       !razorpayPaymentId ||
//       !razorpayOrderId ||
//       !razorpaySignature
//     )
//       return res
//         .status(400)
//         .json({ message: "All payment fields are required" });

//     // Verify signature
//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpayOrderId}|${razorpayPaymentId}`)
//       .digest("hex");

//     if (generatedSignature !== razorpaySignature)
//       return res.status(400).json({ message: "Payment verification failed" });

//     // Update appointment
//     const appointment = await Appointment.findById(appointmentId);
//     if (!appointment)
//       return res.status(404).json({ message: "Appointment not found" });

//     if (appointment.status === "booked")
//       return res.status(400).json({ message: "Appointment already booked" });

//     appointment.status = "booked";
//     appointment.razorpayPaymentId = razorpayPaymentId;
//     await appointment.save();

//     // Add appointment ref to user & doctor
//     const subDoc = {
//       appointmentId: appointment._id,
//       userId: appointment.userId,
//       doctorId: appointment.doctorId,
//       type: appointment.type,
//       date: appointment.date,
//       time: appointment.time,
//       dependent: appointment.dependent,
//       status: appointment.status,
//       jitsiLink: appointment.jitsiLink || null,
//     };

//     await User.findByIdAndUpdate(appointment.userId, {
//       $push: { appointments: subDoc },
//     });
//     await Doctor.findByIdAndUpdate(appointment.doctorId, {
//       $push: { appointments: subDoc },
//     });

//     res.status(200).json({
//       message: "Appointment booked successfully after payment",
//       appointment,  
//     });
//   } catch (err) {
//     console.error("Confirm Payment Error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };



// ✅ Utility: Schedule a notification (for “5 min before appointment”)
const scheduleNotification = (model, data, delayMs) => {
  setTimeout(async () => {
    try {
      await model.create(data);
      console.log("⏰ Scheduled notification sent:", data.message);
    } catch (err) {
      console.error("❌ Error sending scheduled notification:", err);
    }
  }, delayMs);
};


// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ------------------------ Book Appointment ------------------------
// exports.bookAppointment = async (req, res) => {
//   try {
//     const { userId, doctorId, date, time, type, dependent, amount } = req.body;

//     if (!userId || !doctorId || !date || !time || !type || !amount)
//       return res.status(400).json({ message: "All fields are required" });

//     if (typeof amount !== "number" || amount <= 0)
//       return res.status(400).json({ message: "Amount must be a positive number" });

//     const appointmentDate = moment.tz(date, "Asia/Kolkata"); // moment object for date
//     const appointmentDateStr = appointmentDate.format("YYYY-MM-DD"); // "2025-10-09"

//     const appointmentDateTime = moment.tz(`${appointmentDateStr} ${time}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata");

//     // Logging (optional)
//     console.log("Appointment date in IST:", appointmentDateStr);
//     console.log("Appointment time in IST:", appointmentDateTime.format());

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) return res.status(404).json({ message: "Doctor not found" });

//     const dayStart = appointmentDate.clone().startOf("day").toDate(); // 00:00 IST as UTC Date
//     const dayEnd = appointmentDate.clone().endOf("day").toDate();     // 23:59:59 IST as UTC Date

//     const availability = await DoctorAvailability.findOne({
//       doctor: doctorId,
//       date: { $gte: dayStart, $lte: dayEnd },
//     });

//     if (!availability)
//       return res.status(400).json({ message: "Doctor is not available on this date" });

//      const availableStart = moment.tz(`${appointmentDateStr} ${availability.startTime}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata").toDate();
//     const availableEnd = moment.tz(`${appointmentDateStr} ${availability.endTime}`, "YYYY-MM-DD HH:mm", "Asia/Kolkata").toDate();

//     const now = moment().tz("Asia/Kolkata").toDate();

//     if (appointmentDateTime.toDate() < now) {
//       return res.status(400).json({ message: "Cannot book an appointment in the past" });
//     }

//     if (
//       appointmentDateTime.toDate() < availableStart ||
//       appointmentDateTime.toDate() > availableEnd
//     ) {
//       return res.status(400).json({ message: "Doctor is not available for this time slot" });
//     }

//     // Create Razorpay order
//     const order = await razorpay.orders.create({
//       amount: amount * 100, // INR to paise
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     });

//     // Save appointment
//     const appointment = await Appointment.create({
//       userId,
//       doctorId,
//       type,
//       date: appointmentDateStr,
//       time,
//       dependent: dependent || null,
//       status: "pending",
//       amount,
//       razorpayOrderId: order.id,
//     });

//     return res.status(201).json({
//       message: "Razorpay order created. Complete payment to confirm appointment",
//       order,
//       appointmentId: appointment._id,
//     });
//   } catch (error) {
//     console.error("Book Appointment Error:", error);
//     return res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// ------------------------ Confirm Payment (manual) ------------------------
exports.confirmPayment = async (req, res) => {
  try {
    const {
      appointmentId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    if (
      !appointmentId ||
      !razorpayPaymentId ||
      !razorpayOrderId ||
      !razorpaySignature
    )
      return res
        .status(400)
        .json({ message: "All payment fields are required" });

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature)
      return res.status(400).json({ message: "Payment verification failed" });

const appointment = await Appointment.findById(appointmentId)
      .populate("doctorId", "name")
      .populate("userId", "full_name");
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (appointment.status === "booked")
      return res.status(400).json({ message: "Appointment already booked" });

    appointment.status = "booked";
    appointment.razorpayPaymentId = razorpayPaymentId;
    await appointment.save();

    const subDoc = {
      appointmentId: appointment._id,
      userId: appointment.userId,
      doctorId: appointment.doctorId,
      type: appointment.type,
      date: appointment.date,
      time: appointment.time,
      dependent: appointment.dependent,
      status: appointment.status,
      jitsiLink: appointment.jitsiLink || null,
    };

    await User.findByIdAndUpdate(appointment.userId, {
      $push: { appointments: subDoc },
    });
    await Doctor.findByIdAndUpdate(appointment.doctorId, {
      $push: { appointments: subDoc },
    });

    await sendAppointmentNotifications(appointment)
    res.status(200).json({
      message: "Appointment booked successfully after payment",
      appointment,
    });
  } catch (err) {
    console.error("Confirm Payment Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const rawBody = req.body;

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(rawBody);
    console.log("shasum", shasum)

    const digest = shasum.digest("hex");

    const razorpaySignature = req.headers["x-razorpay-signature"];

    if (digest !== razorpaySignature) {
      console.log("Invalid webhook signature");
      return res.status(400).json({ message: "Invalid signature" });
    }

    const webhookData = JSON.parse(rawBody);
    const event = webhookData.event;
    console.log("🔔 Webhook Event:", event);

    if (event === "payment.captured") {
      const paymentEntity = webhookData.payload.payment.entity;

      const appointment = await Appointment.findOne({
        razorpayOrderId: paymentEntity.order_id,
      });

       if (!appointment) {``
        console.log("Appointment not found for order:", paymentEntity.order_id);
        return res.json({ status: "ok" });
      }

      if (appointment.status === "booked") {
        console.log("Appointment already booked:", appointment._id);
        return res.send(req).json({ status: "ok" });
      }

      appointment.status = "booked";
      appointment.razorpayPaymentId = paymentEntity.id;
      await appointment.save();

      const { emitNotification } = require("../services/socketService");

      const userNotif = await UserNotification.create({
        userId: appointment.userId,
        message: {
          text: `Payment successful! Your appointment with doctor ${appointment.doctorId} is confirmed.`,
        },
      });

      const doctorNotif = await DoctorNotification.create({
        doctorId: appointment.doctorId,
        message: {
          text: `New confirmed appointment from user ${appointment.userId}.`,
        },
      });

      emitNotification(appointment.userId, {
        message: "You have a new notification! Please check.",
        notification: userNotif,
      });

      emitNotification(appointment.doctorId, {
        message: "You have a new notification! Please check.",
        notification: doctorNotif,
      });



      const subDoc = {
        appointmentId: appointment._id,
        userId: appointment.userId,
        doctorId: appointment.doctorId,
        type: appointment.type,
        date: appointment.date,
        time: appointment.time,
        dependent: appointment.dependent,
        status: appointment.status,
        jitsiLink: appointment.jitsiLink || null,
      };

      await User.findByIdAndUpdate(appointment.userId, {
        $push: { appointments: subDoc },
      });

      await Doctor.findByIdAndUpdate(appointment.doctorId, {
        $push: { appointments: subDoc },
      });

      console.log("Appointment confirmed via Webhook:", appointment._id);
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.bookAppointment = async (req, res) => {
  try {
    const { userId, doctorId, date, time, type, dependent, amount } = req.body;

    if (!userId || !doctorId || !date || !time || !type || !amount)
      return res.status(400).json({ message: "All fields are required" });

    if (typeof amount !== "number" || amount <= 0)
      return res.status(400).json({ message: "Amount must be a positive number" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

     const requestedDateIST = moment.tz(date, "YYYY-MM-DD", "Asia/Kolkata");

    const startOfDay = requestedDateIST.clone().startOf("day").toDate();
    const endOfDay = requestedDateIST.clone().endOf("day").toDate();

    const requestedTimeIST = moment.tz(
      `${requestedDateIST.format("YYYY-MM-DD")} ${time}`,
      "YYYY-MM-DD HH:mm",
      "Asia/Kolkata"
    );

    const now = moment().tz("Asia/Kolkata");

    if (requestedTimeIST.isBefore(now)) {
      return res.status(400).json({ message: "Cannot book an appointment in the past" });
    }

    const availabilities = await DoctorAvailability.find({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!availabilities.length)
      return res.status(400).json({ message: "Doctor is not available on this date" });

    let matchingSlot = null;

    availabilities.forEach((availability) => {
      const slotStart = moment.tz(
        `${requestedDateIST.format("YYYY-MM-DD")} ${availability.startTime}`,
        "YYYY-MM-DD HH:mm",
        "Asia/Kolkata"
      );

      const slotEnd = moment.tz(
        `${requestedDateIST.format("YYYY-MM-DD")} ${availability.endTime}`,
        "YYYY-MM-DD HH:mm",
        "Asia/Kolkata"
      );

      if (slotEnd.isBefore(slotStart)) slotEnd.add(1, "day"); 

      if (requestedTimeIST.isBetween(slotStart, slotEnd, null, "[)")) {
        matchingSlot = availability;
      }
    });

    if (!matchingSlot)
      return res.status(400).json({ message: "Doctor is not available for this time slot" });

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    const appointment = await Appointment.create({
      userId,
      doctorId,
      type,
      date: requestedDateIST.toDate(),
      time,
      dependent: dependent || null,
      status: "pending",
      amount,
      razorpayOrderId: order.id
    });

    res.status(201).json({
      message: "Razorpay order created. Complete payment to confirm appointment",
      order,
      appointmentId: appointment._id
    });

  } catch (error) {
    console.error("Book Appointment Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};





exports.getDoctorAppointmentsForApp = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const now = new Date();

    const userIds = await Appointment.distinct('userId', { doctorId, status: 'booked' });

    let users = await User.find({ _id: { $in: userIds } }).select('-appointments');
    let totalAmount = 0;

    const userAppointments = await Appointment.find({
      doctorId,
      // userId: { $in: userIds },
      status: 'booked'
    });
    for (let i = 0; i < userAppointments.length; i++) {
      totalAmount += Number(userAppointments[i].amount)
    }


    const doctorAvailability = await DoctorAvailability.findOne({ doctor: doctorId });
    if (!doctorAvailability) {
      return res.status(404).json({ message: "Doctor availability not found" });
    }

    const slotDuration = doctorAvailability.slotDuration;
    const formatTime = date => date.toTimeString().slice(0, 5);

    users = users.map(user => {
      const appointment = userAppointments.find(app => app.userId.toString() === user._id.toString());
      if (appointment) {
        const start = appointment.time;
        const [hours, minutes] = start.split(":").map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
        const endDate = new Date(startDate.getTime() + slotDuration * 60000);
        return {
          _id: user._id,
          profileImage: user.profileImage,
          startTime: formatTime(startDate),
          endTime: formatTime(endDate),
          status: user.status,
          jitsiLink: user.jitsiLink,
          type: user.type,
          gender: user.gender || null,
          lastVisit: formatTime(startDate) || null,
          age: user.dob || null

        };
      }
      return {
        _id: user._id,
        profileImage: user.profileImage,
        startTime: null,
        endTime: null,
        status: user.status,
        jitsiLink: user.jitsiLink,
        type: User.type,
        gender: user.age,
        lastVisit: user.lastVisit,
        age: user.age || null
      };
    });

    let upcoming = await Appointment.find({
      doctorId,
      date: { $gte: now },
    }).populate("userId", "full_name email phone_number");

    let past = await Appointment.find({
      doctorId,
      date: { $lt: now },
    }).populate("userId", "full_name email phone_number");

    let total = await Appointment.find({
      doctorId
    }).populate("userId", "full_name email phone_number");

    const attachUserDetails = (appointments) => {
      return appointments.map(appointment => {
        const obj = appointment.toObject();
        const userId = obj.userId?._id?.toString() || obj.userId?.toString();
        const userMatch = users.find(u => u._id.toString() === userId);

        if (userMatch && typeof obj.userId === 'object') {
          obj.userId.profileImage = userMatch.profileImage || {};
          obj.userId.startTime = userMatch.startTime || null;
          obj.userId.endTime = userMatch.endTime || null;
          obj.userId.status = userMatch.status || null;
          obj.userId.jitsiLink = userMatch.jitsiLink || null;
          obj.userId.type = userMatch.type || null;
          obj.userId.gender = userMatch.gender || null,
            obj.userId.lastVisit = userMatch.startDate || null,
            obj.userId.age = userMatch.age || null

        }
        return obj;
      });
    };

    past = attachUserDetails(past);
    upcoming = attachUserDetails(upcoming);
    total = attachUserDetails(total);


    function isToday(dateString) {
      const date = new Date(dateString);
      const today = new Date();
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    }

    const todayPatient = upcoming.filter(item => isToday(item.date));

    res.status(200).json({
      totalAmount: totalAmount,
      totalUpcoming: upcoming.length,
      totalAppointments: total.length,
      todayPatient : todayPatient.length,
      rating : "3.5",
      upcoming,
      past,
      total
    });

  } catch (error) {
    console.error("Get Doctor Appointments Error:", error);
    res.status(500).json({ message: error.message });
  }
};

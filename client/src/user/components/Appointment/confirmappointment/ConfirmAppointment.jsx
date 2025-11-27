import React, { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Video from "../../../assets/confirmappointmenticons/video.svg";
import Walk from "../../../assets/walking_icon.svg";
import Arrowleft from "../../../assets/confirmappointmenticons/arrow-left.svg";
import Dil from "../../../assets/confirmappointmenticons/dil.svg";
import Star from "../../../assets/confirmappointmenticons/Star.svg";
import { API_BASE_URL } from "../../../../api-config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const consultationTypesMap = {
  Video: { label: "Video Consultation", icon: Video },
  Clinic: { label: "Clinic Visit", icon: Walk },
};

const ConfirmAppointment = () => {
  // const [showPaymentMobile, setShowPaymentMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const locationState =
    location.state || JSON.parse(localStorage.getItem("appointmentData")) || {};

  const { doctor, slot, date, member, amount, consultationType, mainUser } =
    locationState || [];
  console.log(consultationType);
  if (slot && date) {
    const dateObj = new Date(date);
    const [hours, minutes] = slot.split(":").map(Number);

    dateObj.setHours(hours);
    dateObj.setMinutes(minutes);
    dateObj.setSeconds(0);
    dateObj.setMilliseconds(0);

    console.log("Updated date object with slot time:", dateObj);
  }

  // const paymentOptions = ["UPI", "Card"];
  // const upiOptions = [
  //   { img: phonePe, label: "PhonePe" },
  //   { img: gpay, label: "GPay" },
  //   { img: upi, label: "UPI" },
  // ];

  if (!doctor || !slot || !date || !member) {
    return (
      <Container className="p-5" style={{ paddingTop: "150px !important" }}>
        <p>
          Missing appointment data. Please go back and select your slot again.
        </p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Container>
    );
  }

  // ✅ Razorpay SDK loader
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ✅ Payment handler
  // ✅ Payment handler
  const handlePayment = async () => {
    if (isProcessing) return; // Prevent multiple clicks
    setIsProcessing(true);
    try {
      // Load Razorpay SDK
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setIsProcessing(false);

        return;
      }

      // Get logged-in user from localStorage (or your auth context)
      const mainUser = JSON.parse(localStorage.getItem("user"));
      if (!mainUser || !mainUser.id) {
        toast.error("User not logged in!");
        setIsProcessing(false);

        return;
      }

      // Determine if appointment is for main user or dependent
      let userId, dependentData;
      if (member.id) {
        // Member is the main user
        userId = member.id;
        dependentData = null;
      } else {
        // Member is a dependent
        userId = mainUser.id;
        dependentData = {
          name: member.name,
          age: member.age,
          sex: member.sex,
        };
      }

      console.log({
        userId,
        doctorId: doctor._id,
        date,
        time: slot,
        type: consultationType.toLowerCase(),
        amount,
        dependentData,
      });

      // 1️⃣ Create appointment + Razorpay order
      const bookRes = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'authorization': `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({
          userId,
          doctorId: doctor._id,
          date,
          time: slot,
          type: consultationType.toLowerCase(),
          amount,
          dependentData,
        }),
      });

      const bookData = await bookRes.json();
      if (!bookRes.ok) {
        toast.error(bookData.message);
        setIsProcessing(false);

        return;
      }

      const { order, appointmentId } = bookData;

      // 2️⃣ Razorpay checkout options
      const options = {
        key: "rzp_test_RMXMtuD0tkQwlL",
        amount: order.amount,
        currency: order.currency,
        name: "HealthCare App",
        description: "Doctor Appointment Payment",
        order_id: order.id,
        prefill: {
          name: member.name || mainUser.full_name,
          email: member.email || mainUser.email,
          contact: member.phone || mainUser.phone_number,
        },
        handler: async function (response) {
          // 3️⃣ Confirm payment with backend
          const confirmRes = await fetch(
            `${API_BASE_URL}/api/appointments/confirm-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                'authorization': `Bearer ${localStorage.getItem("authToken")}`
              },
              body: JSON.stringify({
                appointmentId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            }
          );

          const confirmData = await confirmRes.json();
          if (confirmRes.ok) {
            toast.success("Payment Successful & Appointment Confirmed!");
            navigate("/user/appointment");
          } else {
            toast.error("Payment verification failed: " + confirmData.message);
          }
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Payment error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container
      fluid
      className="p-4"
      style={{ fontFamily: "Urbanist, sans-serif" }}
    >
      <style>
        {`
          /* Margin top for tablet and above */
          @media (min-width: 768px) {
            .col-left, .col-right {
              margin-top: 80px;
            }
          }
          /* Smaller margin for mobile */
          @media (max-width: 767px) {
            .col-left, .col-right {
              margin-top: 20px;
            }
              .back-button{
              margin-top: 50px;}
          }
        `}
      </style>

      <Row className="justify-content-center">
        {/* Left Column */}
        <Col
          xs={12}
          sm={10}
          md={6}
          className="d-flex justify-content-center col-left"
          style={{ padding: "0 15px" }}
        >
          <div className="back-button" style={{ width: "100%", maxWidth: 566 }}>
            {/* Back Button */}
            <Button
              variant="link"
              className="d-flex align-items-center mb-3 p-0"
              style={{ color: "#00A99D", fontWeight: 500, fontSize: 18, textDecoration: "none" }}
              onClick={() => navigate(-1)}
            >
              <img
                src={Arrowleft}
                alt="Back"
                style={{ width: 24, height: 24, marginRight: 8 }}
              />
              Book appointment
            </Button>

            {/* Doctor Image */}
            <div style={{ textAlign: "center", position: "relative", marginBottom: "80px" }}>
              <img
                src="https://tse4.mm.bing.net/th/id/OIP.FbPafxK8AlAX53Pbit6KsAHaEK?rs=1&pid=ImgDetMain&o=7&rm=3"
                alt="Banner"
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "30px",
                  boxSizing: "border-box",
                }}
              />
              <img
                src={doctor?.profileImage}
                alt={doctor?.name}
                style={{
                  height: "120px",
                  width: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid white",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  position: "absolute",
                  bottom: "-60px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            </div>
            {/* <div className="d-flex justify-content-center mb-3">
              <img
                src={doctor.profileImage}
                alt={doctor.name}
                className="rounded-circle"
                style={{ width: 120, height: 120, objectFit: "cover" }}
              />
            </div> */}

            {/* Doctor Info */}
            <div className="px-2">
              <h5 className="fw-bold d-flex justify-content-between align-items-center mb-1">
                {doctor.name}
                <small className="fw-normal">{doctor.education}</small>
              </h5>
              <p
                className="text-muted d-flex align-items-center mb-1"
                style={{ gap: 8 }}
              >
                <img
                  src={Dil}
                  alt="Specialty"
                  style={{ width: 18, height: 18 }}
                />
                {doctor.speciality}
              </p>
              <div className="d-flex align-items-center gap-1 text-muted mb-3">
                <img
                  src={Star}
                  alt="Rating"
                  style={{ width: 16, height: 16 }}
                />
                <span>{doctor.averageRating}/5</span>
              </div>

              {/* Consultation Info */}
              <div
                className="d-flex align-items-center rounded py-2 mb-3"
                style={{ gap: 15, maxWidth: 297 }}
              >
                <img
                  src={consultationTypesMap[consultationType]?.icon}
                  alt={consultationTypesMap[consultationType]?.label}
                  width={48}
                  height={48}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {consultationTypesMap[consultationType]?.label}
                  </div>
                  <div style={{ fontSize: 13, color: "#6c757d" }}>
                    {new Date(date).toLocaleDateString()} | at {slot} IST
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="mb-4"
                style={{
                  borderRadius: 28,
                  color: "#00A99D",
                  borderColor: "#00A99D",
                  width: "100%",
                  maxWidth: 414,
                  height: 42,
                }}
                onClick={() => navigate(-1)}
              >
                Change slot
              </Button>

              {/* Patient Details */}
              <div className="bg-light p-3 rounded mb-4">
                <h6 className="fw-medium mb-2">Patient details</h6>
                <p className="mb-0 text-muted small" style={{ fontSize: 16 }}>
                  {member.name} | Age: {member.age} | Sex - {member.sex}
                </p>
                <div
                  className="text-decoration-none small mt-2"
                  style={{ color: "#00A99D", cursor: "pointer" }}
                  onClick={() => navigate(-1)}
                >
                  Change patient
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* Right Column */}
        <Col
          xs={12}
          sm={10}
          md={6}
          className="d-flex justify-content-center col-right"
          style={{ padding: "0 15px", marginBottom: '20px' }}

        >
          <div style={{ width: "100%", maxWidth: 410 }}>
            <h4 className="fw-medium mb-2 mt-2">Payment Details</h4>
            <p className="text-muted mb-0">
              Confirm your appointment by checking the amount details below
            </p>

            {/* Amount Details */}
            <div className="bg-white p-3 rounded mb-4">
              <h5 className="fw-medium mb-3">Amount Details</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Consultation Fee</span>
                <span>₹ {amount}.00</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Platform Fee</span>
                <span>₹ 0.00</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Other Taxes</span>
                <span>₹ 0.00</span>
              </div>
              <hr style={{ borderTop: "1px solid #dee2e6" }} />
              <div className="d-flex justify-content-between fw-bold text-dark">
                <span>Grand Total</span>
                <span>₹ {amount}.00</span>
              </div>
            </div>

            {/* Pay & Confirm Button */}
            <Button
              className="w-100"
              style={{
                borderRadius: 6,
                backgroundColor: "#00A99D",
                borderColor: "#00A99D",
                color: "#fff",
                height: 42,
                fontWeight: 500,

              }}
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Proceed to Payment"}{" "}
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ConfirmAppointment;

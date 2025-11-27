import React, { useState, useRef, useEffect } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { API_BASE_URL } from "../../../api-config";
import "./AppointmentFirst.css";

import Profile from "../../assets/confirmappointmenticons/doctor.jpg";
import Call from "../../assets/confirmappointmenticons/call.svg";
import Calender from "../../assets/calendar.svg";
import Arrowleft from "../../assets/confirmappointmenticons/arrow-left.svg";
import AddMemberForm from "../addmemberform/AddMemberForm";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Radio from '@mui/material/Radio';
import ReviewForm from "./ReviewForm";
import CommentSection from "./CommentSection";
import { addDependent, doctorAvailability, getDoctorDetails, userDetails } from "../../../Util/apiRequest";


export default function AppointmentPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedSlot, setSelectedSlot] = useState(() => {
    return sessionStorage.getItem("selectedSlot") || null;
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMemberIndex, setSelectedMemberIndex] = useState(0);
  const [showAddMember, setShowAddMember] = useState(false);
  const [doctor, setDoctor] = useState(null);

  const datePickerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { doctorId, consultationType } = location.state || {};

  // Fetch doctor
  useEffect(() => {
    setDoctor(location.state?.details);
    // if (!doctorId) return;
    const fetchDoctor = async () => {
      try {
        // const res = await axios.get(`${API_BASE_URL}/api/doctors/${doctorId}`);
        const res = await getDoctorDetails(doctorId);
        console.log("Doctor details:", res);
        setDoctor(res);
      } catch (err) {
        console.error("Error fetching doctor:", err);
      }
    };
    fetchDoctor();
    fetchSlots();
    const interval = setInterval(fetchSlots, 60 * 1000);
    return () => clearInterval(interval);
  }, [doctorId]);

  const fetchSlots = async () => {
    try {
      const dateStr = startDate.toLocaleDateString("en-CA");
      // console.log(doctorId, dateStr);
      // const res = await axios.get(
      //   `${API_BASE_URL}/api/doctors/${doctorId}/availability/${dateStr}`
      // );
      const res = await doctorAvailability(doctorId, dateStr)
      console.log("Fetched slots:", res);
      let slots = res.slots || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      slots = slots.filter((slot) => {
        const [hour, minute] = slot.start.split(":").map(Number);
        const slotTime = new Date(startDate);
        slotTime.setHours(hour, minute, 0, 0);
        return startDate.toDateString() === today.toDateString()
          ? slotTime >= new Date()
          : true;
      });

      // slots = slots.slice(0, 8);
      setAvailableSlots(slots);
      setSelectedSlot((prev) => (!prev && slots.length > 0 ? slots[0].start : prev));
    } catch (err) {
      console.error("Error fetching slots:", err);
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  };
  // Fetch available slots
  useEffect(() => {

    if (!doctorId || !startDate) return;

    const fetchSlots = async () => {
      try {
        const dateStr = startDate.toLocaleDateString("en-CA");
        // console.log(doctorId, dateStr)
        // const res = await axios.get(
        //   `${API_BASE_URL}/api/doctors/${doctorId}/availability/${dateStr}`
        // );
        const res = await doctorAvailability(doctorId, dateStr)
        let slots = res.slots || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        slots = slots.filter((slot) => {
          const [hour, minute] = slot.start.split(":").map(Number);
          const slotTime = new Date(startDate);
          slotTime.setHours(hour, minute, 0, 0);
          return startDate.toDateString() === today.toDateString()
            ? slotTime >= new Date()
            : true;
        });

        // slots = slots.slice(0, 8);
        setAvailableSlots(slots);
        setSelectedSlot((prev) => (!prev && slots.length > 0 ? slots[0].start : prev));
      } catch (err) {
        console.error("Error fetching slots:", err);
        setAvailableSlots([]);
        setSelectedSlot(null);
      }
    };

    fetchSlots();
    const interval = setInterval(fetchSlots, 60 * 1000);
    return () => clearInterval(interval);
  }, [doctorId, startDate]);

  // Load user & dependents
  useEffect(() => {
    const fetchUserAndDependents = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) return;

      const mainUser = {
        name: storedUser.full_name || storedUser.name || "Unknown Patient",
        age: storedUser.age || "Not Provided",
        sex: storedUser.sex || storedUser.gender || "Not Provided",
        isUser: true,
        _id: storedUser._id || storedUser.id,
      };

      try {
        // Call backend to fetch dependents
        // const res = await axios.get(`${API_BASE_URL}/api/user/${mainUser._id}`);
        const res = await userDetails(mainUser._id);
        console.log("Fetched user dependents:", res);
        const dependents = (res.userDependent || []).map(dep => ({
          name: dep.full_name,
          age: Math.floor((Date.now() - new Date(dep.dob).getTime()) / 31557600000),
          sex: dep.gender,
          isUser: false,
          _id: dep._id,
        }));

        setMembers([mainUser, ...dependents]);
        setSelectedMemberIndex(0);
      } catch (err) {
        console.error("Error fetching dependents:", err);
        setMembers([mainUser]); // fallback
      }
    };

    fetchUserAndDependents();
  }, []);

  // Add member
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser._id || storedUser.id;
  const handleAddMember = async (memberData) => {
    try {

      if (members.length >= 5) {
        return toast.error("You can add a maximum of 4 dependents per user.");
      }
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = storedUser._id || storedUser.id;

      if (!userId) return toast.error("User not found");

      if (!memberData.address || memberData.address.length < 10) {
        return toast.error("Address must be at least 10 characters long");
      }

      // Convert DOB from "DD-MM-YYYY" to Date object
      const [day, month, year] = memberData.dob.split("-");
      const dobDate = new Date(year, month - 1, day);
      if (isNaN(dobDate.getTime())) {
        return toast.error("Invalid date of birth");
      }

      const payload = {
        userId,
        full_name: memberData.fullName,
        phone_number: memberData.mobileNumber,
        gender: memberData.gender,
        email: memberData.email,
        dob: dobDate,
        relation: memberData.relation,
        address: memberData.address,
        pincode: memberData.pinCode,
      };

      // const res = await axios.post(`${API_BASE_URL}/api/user/dependent`, payload);
      const res = await addDependent(payload);
      console.log("Add dependent response:", res);
      toast.success(res.message);

      const age = Math.floor((Date.now() - dobDate.getTime()) / 31557600000);

      const newMember = {
        name: memberData.fullName,
        age,
        sex: memberData.gender,
        isUser: false,
        _id: res.data.dependentId || null,
      };

      setMembers((prev) => [...prev, newMember]);
      setShowAddMember(false);
    } catch (err) {
      console.error("Error adding dependent:", err);
      toast.error(err.response?.data?.message || "Failed to add dependent");
    }
  };

  // Remove dependent
  // Remove dependent
  const removeDependent = async (index) => {
    const dep = members[index];
    if (!dep || dep.isUser) return;

    try {
      console.log("Removing dependent:", dep);

      const res = await axios.post(
        `${API_BASE_URL}/api/user/dependent`,      // endpoint
        { _id: dep._id },                          // body
        {
          params: { removeDependent: true },       // query params
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,      // add your token
            "Content-Type": "application/json"
          }
        }
      );


      // Update state
      setMembers((prev) => prev.filter((_, i) => i !== index));
      if (selectedMemberIndex === index) setSelectedMemberIndex(0);

      toast.success(res.data.message || "Dependent removed successfully");
    } catch (err) {
      console.error("Error removing dependent:", err);
      toast.error(err.response?.data?.message || "Failed to remove dependent");
    }
  };


  const handleDateChange = (date) => {
    if (!date) return;
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    setStartDate(normalized);
  };

  const handleCalendarClick = () => {
    if (datePickerRef.current) datePickerRef.current.setOpen(true);
  };

  const weekDays = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  });

  useEffect(() => {
    if (selectedSlot) sessionStorage.setItem("selectedSlot", selectedSlot);
  }, [selectedSlot]);

  const selectedMember = members[selectedMemberIndex];

  console.log(doctor)



  return (
    <div
      style={{
        fontFamily: "Urbanist, sans-serif",
        boxSizing: "border-box",
        overflowX: "hidden",
        width: "100%",
        maxWidth: "100%",
        padding: "1rem",
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "24px",
        height: "100vh"
      }}
    >
      <style>
        {`
            @media (min-width: 992px) {
              div[data-layout="doctorGrid"] {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                align-items: flex-start !important;
              }
            }

            @media (max-width: 991px) {
              div[data-layout="doctorGrid"] > div:last-child {
                margin-top: 20px !important;
              }
            }
          `}
      </style>



      <div data-layout="doctorGrid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            marginTop: "80px",
            marginLeft: "10px",
            boxSizing: "border-box",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              background: "none",
              border: "none",
              color: "#00A99D",
              fontWeight: 500,
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            <img
              src={Arrowleft}
              alt="Back"
              style={{ width: "24px", height: "24px", marginRight: "8px" }}
            />
            Doctors
          </button>

          <div style={{ textAlign: "center", position: "relative", marginBottom: "50px" }}>
            <img
              src={doctor?.backgroundImage || "https://img.freepik.com/free-vector/hospital-healthcare-service-sale-banner_23-2150394136.jpg"}
              alt="Banner"
              style={{
                width: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: "10px",
                boxSizing: "border-box",
              }}
            />
            <img
              src={doctor?.profileImage || Profile}
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

          <div>
            <h5 style={{ fontWeight: "700", fontSize: "22px", marginBottom: "5px" }}>
              {doctor?.name}{" "}
              <small style={{ fontWeight: 500, fontSize: "18px" }}>{doctor?.education}</small>
            </h5>
            <p style={{ color: "#6c757d", fontWeight: 500, fontSize: "18px", margin: 0 }}>
              ♡ {doctor?.speciality}
            </p>
            <div style={{ display: "flex", alignItems: "center", color: "#6c757d", fontSize: "18px" }}>
              <span style={{ color: "#FDCB02", marginRight: "4px" }}>★</span>
              {doctor?.averageRating} / 5
            </div>
          </div>

          <div>
            <h6 style={{ fontWeight: "700", fontSize: "18px" }}>About</h6>
            <p style={{ color: "#6c757d", fontSize: "17px" }}>{doctor?.about}</p>

            <h6 style={{ fontWeight: "700", fontSize: "18px" }}>Languages</h6>
            <p style={{ color: "#6c757d", fontSize: "17px" }}>
              {doctor?.languages?.join(", ")}
            </p>

            <h6 style={{ fontWeight: "700", fontSize: "18px" }}>Areas of Expertise</h6>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {doctor?.areaOfInterest?.split(",").map((item) => (
                <span
                  key={item}
                  style={{
                    background: "#f8f9fa",
                    color: "#000",
                    borderRadius: "20px",
                    padding: "8px 15px",
                    fontSize: "14px",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h6 style={{ fontWeight: "700", fontSize: "18px" }}>Education & Training</h6>
            <p style={{ color: "#6c757d", fontSize: "17px", marginBottom: "5px" }}>
              Degree: {doctor?.education} from {doctor?.university}
            </p>
            <p style={{ color: "#6c757d", fontSize: "17px" }}>
              Works at: {doctor?.hospitalName}
            </p>
            <div
              style={{
                backgroundColor: "#f9fafc",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                // padding: "20px",
                marginTop: "30px",
                overflowY: "auto",
                height: "400px",
                fontFamily: "Urbanist, sans-serif",
                position: "relative",
              }}
            >
              <h3
                style={{
                  position: "sticky",
                  top: "0",
                  backgroundColor: "#f9fafc",
                  textAlign: "center",
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#2c3e50",
                  // margin: "0 0 16px 0",
                  letterSpacing: "0.5px",
                  // borderBottom: "2px solid #e0e0e0",
                  padding: "10px 0 8px 0",
                  zIndex: 100,
                }}
              >
                Overall Reviews & Comments
              </h3>

              {/* <div style={{ marginBottom: "20px" }}>
                <ReviewForm  doctorId={doctorId} userId={userId} />
              </div> */}

              <div style={{ borderTop: "1px solid #ddd", paddingTop: "0px" }}>
                <CommentSection doctorId={doctorId} userId={userId} />
              </div>
            </div>



          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            boxSizing: "border-box",
            overflowX: "hidden",
            // marginTop: window.innerWidth > 992 ? "5px" : "100px",
            padding: "0.5rem",
            paddingBottom: "4rem",
            marginTop: "80px"

          }}
        >
          <div style={{ width: "100%", maxWidth: "600px", boxSizing: "border-box" }}>
            <h5 style={{ fontWeight: 500, marginBottom: "1rem" }}>Book Appointment</h5>

            <div>
              {members.map((member, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 15px",
                    border: "1px solid #dee2e6",
                    borderRadius: "50px",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>{member.name}</div>
                    <div style={{ color: "#6c757d", fontSize: "14px" }}>
                      Age - {member.age} | Sex - {member.sex}
                    </div>
                  </div>
                  <Radio
                    checked={selectedMemberIndex === idx}
                    onChange={() => setSelectedMemberIndex(idx)}
                    sx={{
                      color: 'rgb(0, 169, 157)',
                      '&.Mui-checked': {
                        color: 'rgb(0, 169, 157)',
                      },
                      width: 16,
                      height: 16,
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  />

                </div>
              ))}
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowAddMember(true);
              }}
              style={{
                color: "#00A99D",
                fontSize: "0.9rem",
                textDecoration: "none",
                display: "inline-block",
                marginBottom: "1rem",
              }}
            >
              + Add dependent
            </a>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#252525' }}>
                <img
                  src={Calender}
                  alt="calendar"
                  style={{ width: 32, height: 32, cursor: 'pointer' }}
                  onClick={handleCalendarClick}
                />
                <div style={{ fontSize: '14px', fontWeight: 500 }}>
                  {startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <DatePicker
                  ref={datePickerRef}
                  selected={startDate}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  popperPlacement="top-start"
                  showPopperArrow={false}
                  popperClassName="custom-datepicker-popper"
                  calendarClassName="calendar-wrapper"
                  customInput={<div style={{ display: 'none' }} />}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {weekDays.map((day, i) => {
                  const isSelected = day.toDateString() === startDate.toDateString();
                  return (
                    <div
                      key={i}
                      style={{
                        width: 45,
                        textAlign: 'center',
                        backgroundColor: isSelected ? '#00A99D' : 'transparent',
                        color: isSelected ? '#fff' : '#000',
                        padding: '6px 5px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleDateChange(day)}
                    >
                      <div>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day.getDay()]}</div>
                      <div>{day.getDate()}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>
              {availableSlots.length > 0 ? (
                availableSlots.map((slot) => (
                  <div
                    key={slot.start}
                    onClick={() => setSelectedSlot(slot.start)}
                    style={{
                      padding: "6px 15px",
                      borderRadius: "20px",
                      backgroundColor: selectedSlot === slot.start ? "#00A99D" : "#F0F0F0",
                      color: selectedSlot === slot.start ? "#fff" : "#000",
                      cursor: "pointer",
                    }}
                  >
                    {slot.start} - {slot.end}
                  </div>
                ))
              ) : (
                <p style={{ color: "#6c757d" }}>No slots available for this date.</p>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid #00A99D",
                  color: "#00A99D",
                  borderRadius: "50px",
                  padding: "8px 15px",
                  width: "100%",
                }}
              >
                <span>{startDate.toLocaleDateString("en-GB")}</span>
                <span>{selectedSlot || "Select slot"}</span>
              </div>

              <button
                onClick={() => {
                  try {
                    if (!selectedMember) return toast.error("Please select a patient.");
                    if (!selectedSlot) return toast.error("Please select a time slot.");

                    const appointmentDateTime = new Date(startDate);
                    const [hours, minutes] = selectedSlot.split(":").map(Number);
                    appointmentDateTime.setHours(hours, minutes, 0, 0);

                    const appointmentData = {
                      member: selectedMember,
                      slot: selectedSlot,
                      date: appointmentDateTime.toISOString(),
                      doctor,
                      amount: doctor?.consultationFee,
                      consultationType,
                    };

                    localStorage.setItem("appointmentData", JSON.stringify(appointmentData));

                    toast.success(`Selected slot at ${selectedSlot} Redirecting...`, {
                      autoClose: 1000,
                      position: "top-center",
                    });

                    setTimeout(
                      () => navigate("/user/category/confirmappointment", { state: appointmentData }),
                      1000
                    );

                    setAvailableSlots((prev) => prev.filter((s) => s.start !== selectedSlot));
                    setSelectedSlot(null);
                  } catch (err) {
                    console.error("Slot check error:", err);
                    toast.error("Failed to process appointment. Please try again.");
                  }
                }}
                style={{
                  backgroundColor: "#00A99D",
                  color: "white",
                  border: "none",
                  borderRadius: "50px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                Book Slot
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddMember && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1000,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50px",
              left: 0,
              width: "100%",
              height: "100vh",
              zIndex: 1001,
              overflowY: "auto",
            }}
          >
            <AddMemberForm onClose={() => setShowAddMember(false)} onAdd={handleAddMember} />
          </div>
        </>
      )}
    </div>
  );

  return (
    <Container fluid className="p-4 doctor-details-container main-container" style={{ fontFamily: "Urbanist, sans-serif" }}>
      <Row className="doctor-info">
        {/* Left: Doctor Details */}
        <Col xs={12} lg={4} className=" mb-4 mb-lg-0 doctor-details" style={{ width: '100%' }}>
          <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "24px", marginTop: "80px", marginLeft: "40px" }}>
            <button onClick={() => navigate(-1)} className="btn btn-link d-flex align-items-center text-decoration-none mb-3" style={{ color: "#00A99D", fontWeight: 500, fontSize: "18px" }}>
              <img src={Arrowleft} alt="Back" style={{ width: "24px", height: "24px", marginRight: "8px" }} />
              Doctors
            </button>

            <div className="doctor-img-data w-100">
              <div
                className="d-flex justify-content-center w-100 mb-5 position-relative"
                style={{
                  // border: "1px solid black",
                  height: "150px",
                  overflow: "visible",
                }}
              >
                <img
                  src="https://tse4.mm.bing.net/th/id/OIP.FbPafxK8AlAX53Pbit6KsAHaEK?rs=1&pid=ImgDetMain&o=7&rm=3"
                  alt="Banner"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50px" }}
                />

                <div
                  style={{
                    position: "absolute",
                    bottom: "-60px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  <img
                    src={doctor?.profileImage || Profile}
                    alt={doctor?.name}
                    className="rounded-circle"
                    style={{
                      height: "120px",
                      width: "120px",
                      objectFit: "cover",
                      border: "3px solid white",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                    }}
                  />
                </div>
              </div>
              <div className="doctor-data d-flex flex-column gap-2">
                <h5 className="mt-3 mb-0 fw-bold text-[22px]">{doctor?.name} <small className="fw-medium text-[18px]">{doctor?.education}</small></h5>
                <p className="text-muted fw-medium text-[18px] mb-0">♡ {doctor?.speciality}</p>
                <div className="d-flex align-items-center fw-medium text-[18px] gap-1 text-muted">
                  <span style={{ color: "#FDCB02", fontSize: "16px" }}>★</span><span>{doctor?.averageRating} / 5</span>
                </div>
              </div>
            </div>

            {/* <div className="d-flex w-100 justify-content-between mb-3">
              <Button variant="outline" className="w-100 fw-normal text-[18px] call-btn" style={{ backgroundColor: "#EDFFFE", color: "#00A99D", borderRadius: "28px", height: "72px", width: "272px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <img src={Call} alt="call" className="h-8 w-8 text-[18px]" /> <span className="fw-normal text-[20px]">Call</span>
              </Button>
            </div> */}

            <div className="heading w-100">
              <h6 className="fw-bold" style={{ fontSize: "18px" }}>About</h6>
              <p className="text-muted small doctor-about" style={{ fontSize: "17px" }}>{doctor?.about}</p>
              <h6 className="fw-bold" style={{ fontSize: "18px" }}>Languages</h6>
              <p className="text-muted small" style={{ fontSize: "17px" }}>{doctor?.languages?.join(", ")}</p>
              <h6 className="fw-bold" style={{ fontSize: "18px" }}>Areas of Expertise</h6>
              <div className="d-flex flex-wrap gap-3">
                {doctor?.areaOfInterest?.split(",").map((item) => (
                  <span key={item} className="badge bg-light text-dark rounded-pill" style={{ padding: '10px 15px', height: '37px', fontWeight: 400, fontSize: '14px' }}>{item}</span>
                ))}
              </div>
            </div>

            <div className="education-section">
              <h6 className="fw-bold education-heading" style={{ fontSize: "18px" }}>Education & Training</h6>
              <p className="text-muted small mb-1" style={{ fontSize: "17px" }}>Degree: {doctor?.education} from {doctor?.university}</p>
              <p className="text-muted small" style={{ fontSize: "17px" }}>Works at: {doctor?.hospitalName}</p>

            </div>
          </div>
        </Col>

        {/* Right: Appointment */}
        <Col xs={12} lg={8} className="appointment-section d-flex justify-content-center">
          <div className="appointment-div mx-auto" style={{ gap: "24px", marginTop: "80px" }}>
            <h5 className="fw-medium mb-3">Book Appointment</h5>

            {/* Members */}
            <div className="mb-3 dependents-container">
              {members.map((member, idx) => (
                <div key={idx} className="d-flex justify-content-between align-items-center p-3 rounded-pill mb-3 border dependent">
                  <div>
                    <div className="fw-medium">{member.name}</div>
                    <div className="text-muted small">Age - {member.age} | Sex - {member.sex}</div>
                  </div>
                  {!member.isUser && <button onClick={() => removeDependent(idx)}>Remove</button>}
                  <Form.Check type="radio" name="patient" checked={selectedMemberIndex === idx} onChange={() => setSelectedMemberIndex(idx)} />
                </div>
              ))}
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowAddMember(true); }} style={{ color: '#00A99D', fontSize: '0.9rem' }}>Add dependent</a>



            {/* Calendar */}
            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap calendar-days-container">
              <div className="d-flex gap-2">
                {weekDays.map((day, i) => {
                  const isSelected = day.toDateString() === startDate.toDateString();
                  return (
                    <div key={i} className="text-center rounded" style={{ width: 40, backgroundColor: isSelected ? '#00A99D' : 'transparent', color: isSelected ? '#fff' : '#000', padding: '6px 5px', cursor: 'pointer' }} onClick={() => handleDateChange(day)}>
                      <div>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day.getDay()]}</div>
                      <div>{day.getDate()}</div>
                    </div>
                  );
                })}
              </div>

              <div className="d-flex flex-column align-items-center gap-0 text-muted mt-2 mt-sm-0">
                <img src={Calender} alt="calendar" style={{ width: 32, height: 32, cursor: 'pointer' }} onClick={handleCalendarClick} />
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#252525' }}>{startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <DatePicker
                  ref={datePickerRef}
                  selected={startDate}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  popperPlacement="top-start"
                  showPopperArrow={false}
                  popperClassName="custom-datepicker-popper"
                  calendarClassName="calendar-wrapper"
                  customInput={<div style={{ display: 'none' }} />}
                />
              </div>
            </div>

            {/* Slots */}
            <div className="d-flex flex-wrap gap-3 mb-3 slot-section">
              {availableSlots.length > 0 ? (
                availableSlots.map(slot => (
                  <div key={`${slot.start}-${slot.end}`} className="px-3 py-2 rounded-pill slot-time" style={{ backgroundColor: selectedSlot === slot.start ? "#00A99D" : "#F0F0F0", color: selectedSlot === slot.start ? "white" : "black" }} onClick={() => setSelectedSlot(slot.start)}>
                    {slot.start} - {slot.end}
                  </div>
                ))
              ) : <p className="text-muted">No slots available for this date.</p>}
            </div>

            <div className="d-flex align-items-center gap-2 mb-3 book-button" style={{ flexWrap: "nowrap" }}>
              <div className="d-flex align-items-center gap-2 px-3 py-2 border rounded-pill w-100 book-time" style={{ color: '#00A99D', border: '1px solid #00A99D' }}>
                <span>{startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <div style={{ width: 1, height: 20, backgroundColor: '#00A99D' }} />
                <span>{selectedSlot || "Select slot"}</span>
              </div>

              <Button
                style={{
                  backgroundColor: "#00A99D",
                  borderColor: "#00A99D",
                  borderRadius: 999,
                  padding: "6px 10px",
                  flexShrink: 0,
                }}
                onClick={() => {
                  try {
                    if (!selectedMember) return toast.error("Please select a patient.");
                    if (!selectedSlot) return toast.error("Please select a time slot.");

                    const appointmentDateTime = new Date(startDate);
                    const [hours, minutes] = selectedSlot.split(":").map(Number);
                    appointmentDateTime.setHours(hours, minutes, 0, 0);

                    const appointmentData = {
                      member: selectedMember,
                      slot: selectedSlot,
                      date: appointmentDateTime.toISOString(),
                      doctor,
                      amount: doctor?.consultationFee,
                      consultationType,
                    };

                    localStorage.setItem("appointmentData", JSON.stringify(appointmentData));

                    toast.success(`Selected slot at ${selectedSlot} Redirecting...`, {
                      autoClose: 1000,
                      position: "top-center",
                    });

                    setTimeout(
                      () => navigate("/user/category/confirmappointment", { state: appointmentData }),
                      1000
                    );

                    setAvailableSlots((prev) => prev.filter((s) => s.start !== selectedSlot));
                    setSelectedSlot(null);
                  } catch (err) {
                    console.error("Slot check error:", err);
                    toast.error("Failed to process appointment. Please try again.");
                  }
                }}
              >
                Book slot
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {showAddMember && (
        <>
          <div className='outerAddmember' style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }} />
          <div style={{ position: 'fixed', top: 50, left: 0, width: '100vw', height: '100vh', zIndex: 1001, overflowY: 'auto' }}>
            <AddMemberForm onClose={() => setShowAddMember(false)} onAdd={handleAddMember} />
          </div>
        </>
      )}
    </Container>
  );
}

import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import stethoscope from "../../assets/icons/stethoscope.png";
import walkingIcon from "../../assets/walking_icon.svg";
import videoIcon from "../../assets/confirmappointmenticons/video.svg";
import calendarIcon from "../../assets/icons/calendar.png";
import profile from "../../assets/icons/profile.png";
import styles from "../AppointmentPage/Appointments.module.css";
import { API_BASE_URL } from "../../../api-config";
import { getAppointmentByUserId } from "../../../Util/apiRequest";

const Appointments = () => {
  const [activeTab, setActiveTab] = useState("virtual");
  const [showPopup, setShowPopup] = useState(false);
  // const [cancelTarget, setCancelTarget] = useState(null);
  const [appointments, setAppointments] = useState({ upcoming: [], onGoing: [], past: [] });
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate();

  const userId = localStorage.getItem("userId");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {

    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const mobile = window.innerWidth < 992;
    setIsMobile(mobile);
    //setIsOpen(!mobile);
  }, []);

  // ✅ Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      const userId = localStorage.getItem("userId");

      try {
        const res = await getAppointmentByUserId(userId);
        // const res = await axios.get(
        //   `${API_BASE_URL}/api/appointments/user/${userId}`
        // );
        console.log("Fetched appointments:", res, userId);
        setAppointments({
          onGoing: res?.onGoing || [],
          upcoming: res?.upcoming || [],
          past: res?.past || [],
        });
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchAppointments();
  }, [userId]);

  // const handleCancelClick = (appointmentId) => {
  //   setCancelTarget(appointmentId);
  //   setShowPopup(true);
  // };

  // const confirmCancel = async () => {
  //   try {
  //     await axios.put(
  //       `${API_BASE_URL}/api/appointments/cancel/${cancelTarget}`
  //     );
  //     setAppointments((prev) => ({
  //       ...prev,
  //       upcoming: prev.upcoming.filter(
  //         (a) => a.appointmentId !== cancelTarget
  //       ),
  //     }));
  //     alert("Appointment cancelled successfully!");
  //   } catch (err) {
  //     console.error("Cancel error:", err);
  //     alert("Failed to cancel appointment.");
  //   } finally {
  //     setShowPopup(false);
  //   }
  // };

  const renderCard = (appointment, isPast = false) => {
    console.log("Doctor data:", appointment.doctor);

    const { appointmentId, doctor, date, time, status, type, jitsiLink = null } = appointment;
    const isCancelled = status === "cancelled";
    const isJoined = status === "booked";
    const isVideo = type === "video";

    const canJoin = isVideo && isJoined && !!jitsiLink;

    const handleJoinClick = () => {
      if (jitsiLink) {
        window.open(jitsiLink, "_blank"); // Open Jitsi link in new tab
      }
    };

    return (
      <div className="col-md-4 mb-3 mt-3" key={appointmentId}>
        <div
          className={`${styles.secWrapper} p-3 border h-100`}
          style={{
            borderRadius: "18px",
            borderColor: "#F7F7F7",
            minHeight: "230px",
          }}
        >
          <div style={{ opacity: isCancelled ? 0.5 : 1 }}>
            {/* Doctor Info */}
            <div
              className="d-flex justify-content-between align-items-center mb-2"
              style={{ fontSize: "18px" }}
            >
              <div>
                <div className="fw-bold">{doctor?.name || "Unknown Doctor"}</div>
                <div
                  className="d-flex align-items-center"
                  style={{ fontSize: "14px", color: "#888" }}
                >
                  <img
                    src={stethoscope}
                    alt="stethoscope"
                    width={14}
                    className="me-1"
                  />
                  {doctor?.speciality || "Speciality not available"}
                </div>
              </div>
              <div
                className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                style={{ height: "55px", width: "55px" }}
              >
                <img
                  src={doctor?.profileImage || profile}
                  alt="doctor"
                  className="rounded-circle"
                  style={{ height: "45px", width: "45px", objectFit: "cover" }}
                />
              </div>
            </div>

            {/* Consultation Type */}
            <div
              className="d-flex align-items-center mb-2"
              style={{ fontSize: "0.9rem", color: "#666" }}
            >
              <img
                src={type === "video" ? videoIcon : walkingIcon}
                alt="consultation"
                width={20}
                className="me-2"
              />
              {type === "video" ? "Virtual consultation" : "Clinic visit"}
            </div>


            {/* Hospital Info (clinic visits only) */}
            {type === "clinic" && (doctor?.hospitalName || doctor?.hospitalLocation) && (
              <div
                className="d-flex flex-column mb-2"
                style={{ fontSize: "0.85rem", color: "#666" }}
              >
                {doctor?.hospitalName ? (
                  <span className="mb-1">
                    <strong>Hospital Name:</strong> {doctor.hospitalName}
                  </span>
                ) : (
                  <span className="mb-1">
                    <strong>Hospital Name:</strong> Not available
                  </span>
                )}

                {doctor?.hospitalLocation ? (
                  <span className="mb-0" style={{ lineHeight: "1.5" }}>
                    <strong>Location:</strong> {doctor.hospitalLocation}
                  </span>
                ) : (
                  <span className="mb-0" style={{ lineHeight: "1.5" }}>
                    <strong>Location:</strong> Not available
                  </span>
                )}
              </div>
            )}

            {/* Date & Time */}
            <div
              className="d-flex align-items-center mb-3"
              style={{ fontSize: "0.9rem", color: "#666" }}
            >
              <img src={calendarIcon} alt="calendar" width={16} className="me-2" />
              {new Date(date).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}{" "}
              | {time}
            </div>
          </div>

          {/* Buttons */}
          {isPast ? (
            <div className="d-flex justify-content-end">
              {/* <button
                className="btn"
                style={{
                  backgroundColor: "#00a9a4",
                  color: "#fff",
                  borderRadius: "28px",
                }}
              >
                Reschedule
              </button> */}
            </div>
          ) : isCancelled ? (
            <div className="text-end">
              <span style={{ color: "#f70820ff" }}>Cancelled</span>
            </div>
          ) : (
            <div className="d-flex justify-content-end gap-3">
              {/* Show Cancel only for clinic */}
              {/* {type === "clinic" && (
                <button
                  className="btn text-muted p-0"
                  onClick={() => handleCancelClick(appointmentId)}
                >
                  Cancel
                </button>
              )} */}

              {/* Show Join only for virtual */}
              {isVideo && (
                <button
                  className="btn"
                  style={{
                    backgroundColor: "#00a9a4",
                    color: "#fff",
                    borderRadius: "28px",
                    padding: "6px 16px",
                  }}
                  disabled={!canJoin}
                  onClick={handleJoinClick}
                >
                  {canJoin ? "Join" : "Waiting for link..."}                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <p className="text-center mt-5">Loading appointments...</p>;





  return (
    <>
      <div style={{
        fontFamily: "Urbanist, sans-serif",
        // marginTop: "120px",
        paddingTop: "115px",
        // marginLeft: "335px",
        // maxWidth: "1108px",
        marginLeft: isMobile ? "10px" : "110px",
      }}>
        <div className="flex-grow-1 px-3">
          {/* <h5 className={`${styles.headerOne} mb-3`} style={{ fontSize: "24px" }}>
            Upcoming appointments
          </h5> */}

          {/* Toggle Buttons */}
          <div
            className={`${styles.btnContainer} d-inline-flex flex-row mb-4 p-1`}
            style={{
              border: "1px solid #00A99D",
              borderRadius: "28px",
              backgroundColor: "#fff",
            }}
          >
            <button
              className={`btn d-flex align-items-center rounded-pill px-3 py-2 ${activeTab === "virtual" ? "text-white" : "text-dark"
                }`}
              style={{
                backgroundColor: activeTab === "virtual" ? "#00a9a4" : "#fff",
                border: "none",
              }}
              onClick={() => setActiveTab("virtual")}
            >
              <img src={videoIcon} alt="video" width={20} className="me-2" />
              Virtual Consultant
            </button>

            <button
              className={`btn d-flex align-items-center rounded-pill px-3 py-2 ${activeTab === "clinic" ? "text-white" : "text-dark"
                }`}
              style={{
                backgroundColor: activeTab === "clinic" ? "#00a9a4" : "#fff",
                border: "none",
              }}
              onClick={() => setActiveTab("clinic")}
            >
              <img src={walkingIcon} alt="walk" width={20} className="me-2" />
              Clinic visit
            </button>
          </div>

          <h5 className={`mt-3 mb-3`} style={{ fontSize: "24px" }}>
            Ongoing  appointments
          </h5>

          {/* <div className={`${styles.rowContainer} row`}>
            {appointments.onGoing.length > 0 ? (
              appointments.onGoing
                .filter(
                  (a) =>
                    a.status === "booked" &&
                    (a.type === "video" && activeTab === "virtual") ||
                    (a.type === "clinic" && activeTab === "clinic")
                )
                .map((appt) => renderCard(appt, false,true))
            ) : (
              <p>No ongoing appointments</p>
            )}
          </div> */}
          {(() => {
            const filteredOngoing = (appointments.onGoing || []).filter(
              (a) =>
                a.status === "booked" &&
                ((a.type === "video" && activeTab === "virtual") ||
                  (a.type === "clinic" && activeTab === "clinic"))
            );

            return (
              <div className={`${styles.rowContainer} row`}>
                {filteredOngoing.length > 0 ? (
                  filteredOngoing.map((appt) => renderCard(appt, false, true))
                ) : (
                  <p>No ongoing appointments</p>
                )}
              </div>
            );
          })()}




          <h5 className={`mt-3 mb-3`} style={{ fontSize: "24px" }}>
            Upcoming appointments
          </h5>

          {/* Upcoming Cards */}
          <div className={`${styles.rowContainer} row`}>
            {/* {appointments.upcoming.length > 0 ? (
              appointments.upcoming
                .filter(
                  (a) =>
                    a.status === "booked" &&
                    (a.type === "video" && activeTab === "virtual") ||
                    (a.type === "clinic" && activeTab === "clinic")
                )
                .map((appt) => renderCard(appt, false))
            ) : (
              <p>No upcoming appointments</p>
            )} */}

            {(() => {
              const filteredUpcoming = (appointments.upcoming || []).filter(
                (a) =>
                  a.status === "booked" &&
                  (
                    (a.type === "video" && activeTab === "virtual") ||
                    (a.type === "clinic" && activeTab === "clinic")
                  )
              );

              return filteredUpcoming.length > 0 ? (
                filteredUpcoming.map((appt) => renderCard(appt, false))
              ) : (
                <p>No upcoming appointments</p>
              );
            })()}

          </div>

          {/* Previous Appointments */}
          <h5 className="mb-3 mt-3" style={{ fontSize: "24px" }}>
            Previous appointments
          </h5>
          {/* <div className="row">
            {appointments.past.length > 0 ? (
appointments.past
  .filter(
    (a) =>
       a.status==="booked"&&
      (a.type === "video" && activeTab === "virtual") ||
      (a.type === "clinic" && activeTab === "clinic")
  )
  .map((appt) => renderCard(appt, true))
            ) : (
              <p>No past appointments</p>
            )}
          </div> */}
          {(() => {
            const filteredPast = (appointments.past || []).filter(
              (a) =>
                a.status === "booked" &&
                ((a.type === "video" && activeTab === "virtual") ||
                  (a.type === "clinic" && activeTab === "clinic"))
            );

            return (
              <div className="row">
                {filteredPast.length > 0 ? (
                  filteredPast.map((appt) => renderCard(appt, true))
                ) : (
                  <p>No past appointments</p>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Popup Confirmation Modal */}
      {showPopup && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
        >
          <div
            className="bg-white p-4 rounded shadow position-relative"
            style={{ width: "450px", height: "250px", textAlign: "center" }}
          >
            <button
              onClick={() => setShowPopup(false)}
              style={{
                position: "absolute",
                top: "0px",
                right: "20px",
                border: "none",
                fontSize: "30px",
                color: "#252525",
                cursor: "pointer",
                background: "transparent",
              }}
              aria-label="Close"
            >
              &times;
            </button>

            <h4 className="mb-4 mt-4 fw-bold">Cancel Appointment</h4>
            <p>Are you sure you want to cancel this appointment?</p>

            <div className="d-flex justify-content-center gap-3 mt-4">
              <button
                className="btn"
                style={{
                  border: "2px solid #00A99D",
                  backgroundColor: "transparent",
                  color: "#00A99D",
                  borderRadius: "28px",
                }}
                onClick={() => setShowPopup(false)}
              >
                No, keep appointment
              </button>

              <button
                className="btn btn-danger"
                style={{ borderRadius: "28px" }}
              // onClick={confirmCancel}
              >
                Yes, cancel appointment
              </button>
            </div>
          </div>
          <Outlet />
        </div>
      )}
    </>
  );
};

export default Appointments;

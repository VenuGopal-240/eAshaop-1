import React, { useEffect, useState } from "react";
import { FiSearch, FiMic, FiX } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import Cardiology from "../../../assets/cardiologist/cardiology.png";
import Category from "../../../assets/DBIcons/dental.svg"
import Doctoricon from "../../../assets/doctoricon.svg";
// import profile from "../../../assets/cardiologist/profileone.png";
// import specialityimage from "../../../assets/cardiologist/life.png";
import arrowright from "../../../assets/cardiologist/arrowRight.png"
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../../api-config";
import './MainContent.css'
// import socket from "../../../../common/socket";

import Filter from '../../../assets/filter-icon.svg'
import "../../../components/Doctor Specialist/cardiologist/MainContent.css"
import Search from '../../../assets/confirmappointmenticons/search.svg'
import Mic from '../../../assets/cardiologist/microphone.svg'
import video from '../../../assets/confirmappointmenticons/video.svg'
import walk from '../../../assets/walking_icon.svg'
import Star from '../../../assets/icons/star.png'
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import './MainContent.css';
import socket from "../../../../commonComponents/socket";
import { getDoctorsByCategoryBy_uuid } from "../../../../Util/apiRequest";


// const mockDoctors = Array(9).fill({
//   name: "Dr. Nithish Jagannatham",
//   speciality: "Cardiologist",
//   experience: "12 Years experience",
//   rating: "3.2 / 5",
//   fee: "500",
//   slot: "Today 12:40pm",
//   profile: profile,
//   specialityicon: specialityimage,
// });

const MainContent = ({ selectedFilters, setSelectedFilters, clearAllFilters, onToggleSidebar, categorySlug }) => {
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [selected, setSelected] = useState(
    sessionStorage.getItem("selectedConsultation") || ""
  );
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1439);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allDoctors, setAllDoctors] = useState([]);

  useEffect(() => {
    if (!uuid) return;

    async function fetchDoctors() {
      setLoading(true);
      try {
        const url = `${API_BASE_URL}/api/categories/${uuid}/doctors`;
        const res = await fetch(url, {
          method: 'GET', headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${localStorage.getItem("authToken")}`
          },
        });
        if (!res.ok) throw new Error("Failed to fetch doctors");
        const data = await res.json();
        // const data = getDoctorsByCategoryBy_uuid(uuid);
        console.log("Fetched doctors for category:", data);
        setAllDoctors(data.doctors || []);
        setDoctors(data.doctors || []); // show all initially
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setAllDoctors([]);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();

    socket.on("connect", () => {
      console.log("✅ Socket connected with ID:", socket.id);

      // ✅ Join the category room once connected
      socket.emit("joinCategoryRoom", uuid, () => {
        console.log("📡 Joined category room for:", uuid);
      });
    });

    // ✅ Handle connection errors
    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    // ✅ Handle disconnections
    socket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
    });

    // ✅ Handle category update events
    socket.on("categoryDoctorsUpdated", (data) => {
      console.log("📬 Category update received:", data);
      // Re-fetch the doctors list
      fetchDoctors();
    });

    return () => {
      socket.off("categoryDoctorsUpdated");
      socket.disconnect();
      console.log("🔌 Socket disconnected (component unmounted)");
    };

  }, [uuid]);



  // Client-side filter when selected toggle changes
  useEffect(() => {
    if (!selected) {
      setDoctors(allDoctors);
    } else {
      let mode = selected === "video" ? "Video Consultation" : "Clinic Visit";

      const filtered = allDoctors.filter(
        (doc) => doc.consultationMode === mode || doc.consultationMode === "Both"
      );
      setDoctors(filtered);
    }
  }, [selected, allDoctors]);




  useEffect(() => {
    function handleResize() {
      setIsMobileView(window.innerWidth <= 1439);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRemoveFilter = (category, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: prev[category].filter((v) => v !== value),
    }));
  };

  const handleSelect = (type) => {
    const newValue = selected === type ? "" : type;
    setSelected(newValue);
    localStorage.setItem("selectedConsultationType", newValue);
  };

  if (loading) return <p>Loading doctors...</p>;


  return (
    <div className="p-4 main-contents" style={{ flex: 1, }}>
      {/* ... your existing header, search, toggles etc. remain unchanged ... */}
      <div
        className="mb-2 d-flex text-decoration-none navigations"
        style={{ color: "#00A99D" }}>
        <span>
          <Link to="/user/category" className="text-decoration-none">
            <span style={{ color: '#8E8E8E', fontSize: '18px' }} className="me-2">Category</span>
          </Link></span>
        <span className="me-2" style={{ width: '18px', height: '18px', marginTop: '7px' }}><img src={arrowright} /></span>
        <span style={{ textDecoration: "underline", fontSize: '1.12rem' }}>Dental</span>
      </div>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className=" d-none  align-items-center gap-3 text">
          <img src={Category} alt="Cardiology Icon" width={52} height={52} />
          <div>
            <h2 className="mb-1">{categorySlug?.replace(/-/g, " ")}</h2>
            <p className="text-muted mb-0 d-flex" style={{ fontSize: '1.12rem' }}>
              <img src={Doctoricon} height={18} width={18} className="me-1" alt="Doctor" />
              {doctors.length === 1 ? "Doctor" : "Doctors"} {doctors.length}
            </p>
          </div>
        </div>
        <div className="d-flex align-items-center gap-3 position-relative filters-with-search" style={{ width: "370px" }}>
          {/* Hamburger icon - only on mobile */}
          <button
            className="btn filters d-flex border border-gray-300"
            style={{ background: "transparent", border: "1px solid #F7F7F7", borderRadius: "28px", padding: "10px 24px 10px 10px", }}
            onClick={onToggleSidebar}
          >
            <img src={Filter} height={18} width={18} />
            <span className="ms-2">Filters</span>
          </button>
          {/* Search Icon (Left) */}
          <div className="position-relative flex-grow-1 ">
            <input
              type="text"
              placeholder="Find doctor"
              className="form-control mb-2 mt-1 w-100 searchbar outline-none outline-gray-300"
              style={{
                paddingLeft: "45px",
                paddingRight: "40px",
                paddingTop: "18px",
                paddingBottom: "18px",
                color: "#8E8E8E",
                borderRadius: "23px",
                // border: "1px solid #F7F7F7",
                // outline: "1px solid grey",
                boxShadow: "none",
                height: "45px"
              }}
            />

            <img src={Search} alt="Search Icon"
              className="position-absolute start-0 ms-3"
              style={{
                top: "50%",
                transform: "translateY(-50%) translateY(-2px)", 
                color: "#aaa",
                width: "24px",
                height: "24px",
              }}
            />

            <img src={Mic} alt="Mic Icon"
              className="position-absolute end-0 me-3"
              style={{
                top: "50%",
                transform: "translateY(-50%) translateY(-1px)",
                color: "#aaa",
                width: "24px",
                height: "24px"
              }}
            />
          </div>
        </div>

      </div>

      {/* Toggle Buttons */}
      <div className="d-flex justify-content-center mt-3 mb-3 outer-toggle">
        <div
          className="p-2 rounded-pill d-flex align-items-center bg-white toggle-buttons-container"
          style={{ border: "1px solid #00A99D" }}
        >
          <button
            style={{
              backgroundColor: selected === "video" ? "#00A99D" : "#ffffff",
              color: selected === "video" ? "white" : "#8E8E8E",
            }}
            className="btn fw-semibold px-4 py-2 rounded-pill d-flex align-items-center"
            onClick={() => setSelected("video")}
          >
            <span className="me-2"><img src={video} height={24} width={24} className="toggle-images" /></span>
            Video Consultant
          </button>
          <button
            style={{
              backgroundColor: selected === "clinic" ? "#00A99D" : "#ffffff",
              color: selected === "clinic" ? "white" : "#8E8E8E",
            }}
            className="btn1 fw-semibold  rounded-pill d-flex align-items-center"
            onClick={() => setSelected("clinic")}
          >
            <span className="clinic-visit me-1 ps-4"><img src={walk} height={14} width={24} className="toggle-images" /></span>
            Clinic Visit
          </button>
        </div>
      </div>

      {/* Selected Filters */}
      {/* Selected Filters */}
      <div className="d-flex flex-wrap align-items-center mb-4">
        {/* Show Clear Filters button only if total selected filters >= 2 */}
        {Object.values(selectedFilters).flat().length >= 2 && (
          <span
            className="badge rounded-pill text-bg-light me-2 mb-2 d-inline-flex align-items-center px-3 py-2"
            style={{
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
            onClick={clearAllFilters}
          >
            Clear filters
            <FiX className="ms-2" />
          </span>
        )}

        {/* Render individual selected filter badges */}
        {Object.entries(selectedFilters).map(([category, values]) =>
          values.map((value, idx) => (
            <span
              key={`${category}-${value}-${idx}`}
              className="badge rounded-pill text-bg-light me-2 mb-2 d-inline-flex align-items-center px-3 py-2"
              style={{ fontSize: "0.87rem" }}
            >
              {value}
              <FiX
                className="ms-2 cursor-pointer"
                role="button"
                onClick={() => handleRemoveFilter(category, value)}
              />
            </span>
          ))
        )}
      </div>


      {/* Doctor Cards */}


      <div className="row">
        {doctors.length === 0 && <p>No doctors available for this consultation type.</p>}

        {doctors.map((doc, index) => (
          <div key={index} className="col-md-4 col-sm-6 mb-4">
            <div className="card shadow-sm rounded-4 border-0 h-100">
              <div className="card-body px-4 py-4 d-flex flex-column justify-content-between h-100">

                {isMobileView ? (
                  <>
                    {/* Profile image and rating side-by-side */}
                    <div className="d-flex align-items-center mb-2 justify-content-between">
                      <div
                        className="doctor-profile rounded-circle overflow-hidden bg-light d-flex justify-content-center align-items-center p-2"
                        style={{ width: 40, height: 40 }}
                      >
                        <img
                          src={doc.profileImage}
                          alt={doc.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div
                        style={{ fontSize: "0.87rem" }}
                        className="d-flex align-items-center"
                      >
                        <img
                          src={Star}
                          height={16}
                          width={16}
                          style={{ color: "#FFC300", marginRight: 6 }}
                          alt="star"
                        />
                        {doc.averageRating}
                      </div>
                    </div>

                    {/* Doctor name and speciality below */}
                    <div className="ms-1">
                      <p className="fw-bold mb-1 doctor-name" style={{ fontSize: "18px" }}>
                        {doc.name}
                      </p>
                      <div
                        style={{ color: "#00A99D", fontSize: "14px" }}
                        className="d-flex speciality mb-3"
                      >
                        <img
                          src={Category}
                          className="me-1"
                          alt="Speciality" style={{ width: '15px', height: '15px' }}
                        />
                        {doc.speciality} <span className="ms-1"> | {doc.experience} years</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Desktop: rating on top */}
                    <div className="doctor-rating d-flex justify-content-end mb-2">
                      <div style={{ fontSize: "0.87rem" }} className="d-flex">
                        <img
                          src={Star}
                          height={16}
                          width={16}
                          style={{ color: "#FFC300" }}
                          alt="star"
                        />{" "}
                        {doc.averageRating}
                      </div>
                    </div>
                    {/* Desktop: profile + name + speciality row */}
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="doctor-profile rounded-circle overflow-hidden bg-light d-flex justify-content-center align-items-center p-2"
                        style={{ width: 60, height: 60 }}
                      >
                        <img
                          src={doc.profileImage}
                          alt={doc.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div className="ms-3">
                        <p className="fw-bold mb-1 doctor-name" style={{ fontSize: "18px" }}>
                          {doc.name}
                        </p>
                        <div
                          style={{ color: "#00A99D", fontSize: "14px" }}
                          className="d-flex speciality"
                        >
                          <img
                            src={Category}
                            className="me-1"
                            alt="Speciality" style={{ width: '25px', height: '25px' }}
                          />
                          {doc.speciality} <span className="ms-1"> | {doc.experience} Years</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* The rest of your card: consultation fee, slot, and book button */}
                <div
                  className="d-flex justify-content-around align-items-center rounded-pill mb-3 py-1 px-2 fee-details"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #E7E7E7",
                  }}
                >
                  <div className="consultation-fee-box">
                    <div className="fw-bold" style={{ fontSize: "18px" }}>
                      <span className="fw-light" style={{ fontSize: "16px" }}>₹</span><span className="fee">{doc.consultationFee}</span>
                      <span className=" ms-2 fw-normal" style={{ fontSize: "14px" }}>Consultation fee</span>
                    </div>
                  </div>
                  <div className="vertical-line"
                    style={{
                      width: "1px",
                      height: "40px",
                      backgroundColor: "#E0E0E0",
                    }}
                  ></div>
                  <div className="text-start next-slot-box" style={{ fontSize: "14px" }}>
                    <div>Next slot</div>
                    <div>12:00</div>
                  </div>
                </div>

                <button
                  className="btn w-100 rounded-pill"
                  style={{ backgroundColor: "#00B2A9", color: "white", fontSize: '14px' }}
                  onClick={() => {
                    if (!selected) {
                      toast.warning("Please select consultation type before booking a slot", {
                        position: "top-right",
                        autoClose: 3000,
                      });
                      return;
                    }
                    navigate("/user/category/bookappointment", {
                      state: {
                        doctorId: doc._id,
                        consultationType: selected === "video" ? "Video" : "Clinic",
                        selectedType: selected // 🔥 keep the selected mode for when you come back
                      }
                    });

                  }}
                >
                  Book a slot
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainContent;

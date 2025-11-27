import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link } from "react-router-dom";
import styles from "../../pages/ProfilePage/SecurityPanel.module.css";
import { API_BASE_URL } from "../../../api-config";

function SecurityAndLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [userData,setUserData] = useState({
    full_name: "",
    password: ""
  });

  // Sidebar toggle states
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 992);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);


  // Fetch user data from backend
  useEffect(() => {
  const fetchUserData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.id) {
        console.error("No user ID found in localStorage");
        return;
      }
      const userId = storedUser.id;
      const token = localStorage.getItem("authToken"); // optional

      const response = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user data");

      const data = await response.json();
      setUserData({
        full_name: data.user?.full_name || "",
        password: "********", // hide actual password
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  fetchUserData();
}, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile); 
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`${styles.mainWrapper} w-100`}>
      <style>
        {`
        .custom-input:focus {
         outline: none !important;
         box-shadow: none !important;
        }
        `}
      </style>

      {/* Sidebar Toggle Button (only for mobile/tablet ≤ 991px) */}
      {isMobile && (
        <button
          className="btn btn-link p-0 menu"
          style={{
            position: "fixed",
            top: "80px",
            left: "15px",
            zIndex: 1050,
          }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? "Close" : ""}
        </button>
      )}

      {/* Main Container */}
      <div
        className={`container d-flex flex-column align-items-start`}
        style={{
          width: isMobile ? "100%" : "617px",
          paddingTop: isMobile ? "70px" : "70px",
          marginLeft: isMobile ? "0" : "430px",
          fontFamily: "Urbanist, sans-serif",
          // marginTop:isMobile?'80px':'30px'
        }}
      >
        <h2 className={` ${styles.secHeader}  mb-3 mt-5`} style={{ fontWeight: "500" }}>
          Security and Login
        </h2>
        <p className="mb-4" style={{ fontWeight: "400", fontSize: "1.12rem" }}>
          Manage Credentials
        </p>

        <div className={`${styles.secContainer} d-flex flex-column gap-3`}>
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="form-label"
              style={{ fontSize: "1.12rem" }}
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              className="form-control rounded-pill custom-input"
              style={{
                border: "1px solid #8E8E8E",
                padding: "10px 24px",
                width: isMobile ? "100%" : "617px",
              }}
              value={userData.full_name}
              readOnly
            />
          </div>

          {/* Password */}
          <div className="mb-3" style={{ position: "relative" }}>
            <label
              htmlFor="password"
              className="form-label"
              style={{ fontSize: "1.12rem" }}
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={userData.password}
              className="form-control rounded-pill custom-input"
              style={{
                border: "1px solid #8E8E8E",
                padding: "10px 24px",
                width: isMobile ? "100%" : "617px",
              }}
              readOnly
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                top: "73%",
                right: "25px",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666",
              }}
            >
              {showPassword ? <FiEye size={24} /> : <FiEyeOff size={24} />}
            </span>
          </div>
        </div>

        <Link
          to="/user/change-password"
          className="mt-4 text-decoration-none d-inline-block"
          style={{
            color: "#00A99D",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          Change password
        </Link>
      </div>
    </div>
  );
}

export default SecurityAndLogin;

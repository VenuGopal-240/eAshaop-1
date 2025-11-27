import React, { useEffect, useState } from 'react';
import logo from '../../assets/eAshalogo.png';
import dp from '../../assets/bookreading.png';
import notification from '../../assets/notification.svg'
import { useNavigate } from 'react-router-dom';
import styles from "../../pages/ProfilePage/Profile.module.css"
import { FiLogOut, FiMenu, FiX } from "react-icons/fi"
import { API_BASE_URL } from '../../../api-config';
import Sidebar from '../../components/categorypage/Sidebar';
import { useLocation } from 'react-router-dom';
import dashboard from "../../assets/icons/dashboard.svg";
import doctor from "../../assets/icons/doctor.svg";

import appointments from "../../assets/icons/appointments.svg";
import medications from "../../assets/icons/medications.svg";
import lab from "../../assets/icons/lab.svg";
import reports from "../../assets/icons/reports.svg";
import pharmacy from "../../assets/icons/pharmacy.svg";
import close from "../../assets/icons/close.svg";
import open from "../../assets/icons/open.svg";
import { ImCross } from "react-icons/im";
// <<<<<<< HEAD
import User from "../../assets/icons/profile.png";
import Security from "../../assets/icons/pharmacy.svg";
import Legal from "../../assets/icons/home-hashtag.png";
// import Payment from "../../assets/icons/Money Bag.png";
// import Family from "../../assets/icons/people.png";
// import socket from '../../../common/socket';
// =======
import './Topbar.css';
import { io } from "socket.io-client";
import socket from '../../../commonComponents/socket';
import { userDetails } from '../../../Util/apiRequest';
// import socket from '../../../commonComponents/socket';
// --- Simple toast popup function
// --- Enhanced toast popup function ---
const showToast = (message, options = {}) => {
  const {
    background = "#00a99d", // default teal background
    color = "white",
    position = "bottom-right",
    duration = 4000, // 4 seconds by default
  } = options;

  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.zIndex = "9999";
  toast.style.padding = "12px 18px";
  toast.style.borderRadius = "8px";
  toast.style.background = background;
  toast.style.color = color;
  toast.style.fontSize = "14px";
  toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.4s ease, transform 0.4s ease";

  // --- Positioning ---
  if (position.includes("bottom")) {
    toast.style.bottom = "20px";
  } else {
    toast.style.top = "20px";
  }
  if (position.includes("right")) {
    toast.style.right = "20px";
  } else {
    toast.style.left = "20px";
  }

  // --- Animation (slide in) ---
  toast.style.transform = "translateY(20px)";
  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  }, 100);

  // Animate out and remove
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    setTimeout(() => toast.remove(), 400);
  }, duration);
};

// const socket = io("http://localhost:5000", {
//   transports: ["websocket"],
//   reconnection: true,
//   reconnectionAttempts: Infinity,
//   reconnectionDelay: 2000,
// });



// >>>>>>> 70494b2c659823a4e959a7996e6f861a63dc7eb5

const Topbar = ({ toggleSidebar: propToggleSidebar, isMobile: propIsMobile } = {}) => {
  const [calculatedIsMobile, setCalculatedIsMobile] = useState(window.innerWidth < 992);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedIds, setExpandedIds] = useState([]);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    const handleResize = () => setCalculatedIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // const toggleSidebar = propToggleSidebar;
  // const isMobile = propIsMobile !== undefined ? propIsMobile : calculatedIsMobile;
  const [profileImage, setProfileImage] = useState();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    // console.log("Stored user from localStorage:", storedUser);
    userDetails(storedUser.id)
      // fetch(`${API_BASE_URL}/api/user/${storedUser.id}`)
      // .then((res) => res.json()) // parse JSON
      .then((data) => {
        console.log("Fetched user data:", data);
        if (data?.user?.profileImage?.cloudinaryUrl) {
          setProfileImage(data?.user?.profileImage?.cloudinaryUrl);
        }
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
      })


    socket.emit("joinUserRoom", storedUser.id);

    socket.on("UserprofileImageUpdated", (data) => {


      if (data.userId === storedUser.id) {
        const newImage = data.profileImage.cloudinaryUrl || data.profileImage;

        setProfileImage(newImage);


        const updatedUser = {
          ...storedUser,
          profileImage: { cloudinaryUrl: newImage },
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    });


    return () => {
      socket.off("UserprofileImageUpdated");
    };

  }, []);

  // --- Fetch notifications
  const fetchNotifications = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const storedRole = localStorage.getItem("role"); // 'user' or 'doctor'
      const userId = storedUser?.id;

      if (!userId || !storedRole) {
        console.warn("No userId or role found in localStorage — skipping fetch.");
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/notifications/${storedRole}/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        console.log("Fetched notifications:", data.notifications.length);
      } else {
        console.error("Failed to fetch notifications:", data.message);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  // useEffect(() => {
  //   fetchNotifications(); // Initial fetch on mount
  // }, []);


  // --- Real-time notifications via Socket.IO
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id;
    if (!userId) return;



    const joinRoomAndFetch = () => {
      socket.emit("joinUser", userId);
      console.log("Joined user room after connect/reconnect:", userId);
      // fetchNotifications(); // Fetch notifications on connect/reconnect
    };

    // If socket is already connected, join and fetch immediately
    if (socket.connected) {
      joinRoomAndFetch();
    }

    socket.on("connect", joinRoomAndFetch);
    socket.on("reconnect", joinRoomAndFetch);

    socket.on("newNotification", (data) => {
      const messageText =
        typeof data.message === "string"
          ? data.message
          : data.message?.text || "You have a new notification! Please check.";

      // ✅ Show toast safely
      showToast(messageText, {
        background: "#00a99d",
        position: "bottom-right",
        duration: 5000,
      });

      // if (messageText.includes("You have a new notification")) {
      //   return; // STOP here (do not add to dropdown)
      // }

      // ✅ Normalize data structure for your state
      const newNotif = {
        _id: data._id || Date.now(),
        message: {
          text: messageText,
          link: data.message?.link || null,
        },
        isRead: false,
      };

      setNotifications((prev) => [newNotif, ...prev]);
    });


    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socket.off("newNotification");
      socket.off("connect_error");
      socket.off("connect", joinRoomAndFetch);
      socket.off("reconnect", joinRoomAndFetch);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      // fetchNotifications();
    }, 500); // delay 0.5s
    return () => clearTimeout(timer);
  }, []);



  // --- Unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- Mark as read
  const handleMarkRead = async (id) => {
    const role = localStorage.getItem("role"); // 'user' or 'doctor'

    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read?type=${role}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (res.ok) {
        console.log(" Marked as read:", data.notification);

        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setExpandedIds((prev) => [...prev, id]);

      } else {
        console.error(" Error:", data.message);
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // --- Toggle dropdown
  const handleBellClick = () => setShowDropdown((prev) => !prev);




  const [toggleState, setToggleState] = useState(false);

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/user/profile')
  }

  const handleLogout = async () => {
    try {
      // ✅ Call backend logout API
      const response = await fetch(`${API_BASE_URL}/api/user/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        // ✅ Clear tokens or localStorage if you store them there
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        console.error("Logout failed:", data.message);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  console.log(toggleState);


  const [isOpen, setIsOpen] = useState(window.innerWidth >= 992);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [selected, setSelected] = useState(null);

  // const navigate = useNavigate();
  const location = useLocation();
  const isLabCards = location.pathname === "/lab";

  // --- Menu items
  const menuItems = [
    { icon: dashboard, label: "Dashboard", path: "/user/dashboard" },
    { icon: doctor, label: "Doctors", path: "/user/category" },
    { icon: appointments, label: "Appointments", path: "/user/appointment" },
    { icon: medications, label: "Medications", path: "/user/medication" },
    { icon: lab, label: "Lab", path: "/user/lab" },
    { icon: reports, label: "Reports & Scanning's", path: "/user/reportone" },
    { icon: pharmacy, label: "Pharmacy", path: "/user/pharmacy" },
  ];

  // --- Sync selected item with current route
  useEffect(() => {
    const found = menuItems.find((item) => item.path === location.pathname);
    if (found) {
      setSelected(found.label);
    }
  }, [location.pathname]);

  // --- Resize handling
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
    setIsOpen(!mobile);
  }, []);

  // --- Track viewport width
  const [vw, setVw] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // --- Breakpoints & widths
  const MOBILE_BP = 992;
  const LAPTOP_BP = 1200;
  let sidebarWidth;
  if (!isOpen) {
    sidebarWidth = "110px";
  } else if (isMobile) {
    sidebarWidth = "260px";
  } else if (vw <= LAPTOP_BP) {
    sidebarWidth = isLabCards ? "360px" : "257px";
  } else {
    sidebarWidth = isLabCards ? "360px" : "300px";
  }

  const sidebarWidthNum = parseInt(sidebarWidth || "250", 10) || 250;
  const activeLineLeft = isMobile
    ? "222px"
    : isOpen
      ? `${Math.max(41, sidebarWidthNum - 30)}px`
      : "41px";

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };
  const validPaths = [
    "/user/profile",
    "/user/profile/security-and-login",
    "/user/profile/payment-and-billing",
    "/user/profile/legal",
  ];
  const [random, setRandom] = useState(false);
  useEffect(() => {
    if (validPaths.includes(location?.pathname)) {
      setRandom(true);
    }
  }, []);
  // const sidebarOptions = [
  //   { label: "Dashboard", icon: dashboard, path: "/user/dashboard" },
  //   { label: "User details", icon: User, path: "/user/profile" },
  //   { label: "Security and Login", icon: Security, path: "/user/profile/security-and-login" },
  //   { label: "Payment and Billing", icon: Payment, path: "/user/profile/payment-and-billing" },
  //   // { label: "Family Members", icon: Family, path: "/user/profile/family-members" },
  //   { label: "Legal", icon: Legal, path: "/user/profile/legal" },
  // ];
  return (
    <div
      className={` ${styles.topBarContainer}  w-100 d-flex justify-content-between align-items-center px-3 px-lg-4 py-2 border-bottom bg-white`}
      style={{ border: '1px solid #F7F7F7', position: 'fixed', zIndex: 1050 }}
    >
      <div
        className="d-flex align-items-center"
        style={{
          marginLeft: isMobile ? "16px" : "25px",
        }}
      >
        {isMobile && (
          <>
            {!random && (
              <>
                {!toggleState ? (
                  <FiMenu
                    size={24}
                    style={{ cursor: "pointer", marginRight: "15px" }}
                    onClick={() => setToggleState(true)}
                    title="Menu"
                  />
                ) : (
                  <ImCross
                    size={18}
                    onClick={() => setToggleState(false)}
                    style={{ cursor: "pointer", marginRight: "18px" }}
                  />
                )}

                <div
                  onClick={() => setToggleState(false)}
                  style={{
                    position: "fixed",
                    top: "76px",
                    left: 0,
                    width: "100%",
                    height: "100vh",
                    backgroundColor: toggleState
                      ? "rgba(0, 0, 0, 0.3)"
                      : "rgba(0, 0, 0, 0)",
                    zIndex: 998,
                    pointerEvents: toggleState ? "auto" : "none",
                    transition: "background-color 0.4s ease",
                  }}
                ></div>

                <div
                  style={{
                    position: "fixed",
                    top: "76px",
                    left: 0,
                    width: "65%",
                    height: "100vh",
                    backgroundColor: "#fff",
                    zIndex: 999,
                    padding: "0px 0px",
                    paddingLeft: "20px",
                    paddingRight: "20px",
                    paddingTop: "5px",
                    overflowY: "auto",
                    boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
                    transition:
                      "transform 0.4s ease-in-out, opacity 0.4s ease-in-out",
                    transform: toggleState
                      ? "translateX(0)"
                      : "translateX(-100%)",
                    opacity: toggleState ? 1 : 0,
                    // borderTopRightRadius: "12px",
                    borderBottomRightRadius: "12px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ol className="list-unstyled">
                    {menuItems.map((item, index) => (
                      <li
                        key={index}
                        onClick={() => {
                          navigate(item.path);
                          setToggleState(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "12px 0",
                          cursor: "pointer",
                          fontSize: "16px",
                          color: "#333",
                          backgroundColor:
                            location.pathname === item.path
                              ? "rgba(0,169,157,0.08)"
                              : "transparent",
                          borderRadius: "10px",
                          transition:
                            "background-color 0.3s ease, transform 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(0,169,157,0.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            location.pathname === item.path
                              ? "rgba(0,169,157,0.08)"
                              : "transparent";
                        }}
                      >
                        <img
                          src={item.icon}
                          alt={item.label}
                          style={{
                            width: "24px",
                            height: "24px",
                            marginRight: "12px",
                            marginLeft: "12px",
                            filter:
                              location.pathname === item.path
                                ? "invert(49%) sepia(99%) saturate(443%) hue-rotate(132deg) brightness(95%) contrast(93%)"
                                : "grayscale(100%) opacity(0.8)",
                            transition: "filter 0.3s ease",
                          }}
                        />
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </>
            )}
          </>
        )}


        <img
          src={logo}
          alt="Logo"
          className="img-fluid hover:cursor-pointer"
          style={{
            width: "72px",
            height: "60px",
            marginRight: "40px",
            marginLeft: random ? "40px" : ""
          }}
          onClick={() => {
            navigate("/user/dashboard");
          }}
        />
      </div>



      <div className="d-flex align-items-center ms-auto">

        <FiLogOut
          size={22}
          style={{ cursor: "pointer", color: "#dc3545", marginRight: '15px' }}
          onClick={handleLogout}
          title="Logout"
        />

        {/*  Notification Bell */}
        <div style={{ position: "relative", marginRight: "15px" }} ref={dropdownRef}>
          <img
            src={notification}
            alt="Notification"
            style={{ width: '22px', height: '22px', cursor: "pointer" }}
            onClick={() => setShowDropdown((prev) => !prev)}
          />

          {/*  Unread Count Badge */}
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                background: "red",
                color: "white",
                borderRadius: "50%",
                fontSize: "10px",
                width: "16px",
                height: "16px",
                textAlign: "center",
                lineHeight: "16px",
              }}
            >
              {unreadCount}
            </span>
          )}

          {/* Dropdown */}
          {showDropdown && (
            <div
              className="notification-dropdown"
              // ref={dropdownRef}
              style={{
                position: "absolute",
                top: "30px",
                right: "0",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                zIndex: 2000,
                overflow: "hidden", // Prevent header from scrolling
              }}
            >
              {/* --- HEADER (Fixed) --- */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px",
                  borderBottom: "1px solid #eee",
                  position: "sticky",
                  top: 0,
                  background: "#fff",
                  zIndex: 10,
                }}
              >
                <strong>Notifications</strong>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    onClick={async () => {
                      const role = localStorage.getItem("role");
                      const user = JSON.parse(localStorage.getItem("user"));
                      const id = user?.id;
                      if (!id || !role) return;

                      try {
                        const res = await fetch(
                          `${API_BASE_URL}/api/notifications/mark-all-read?type=${role}`,
                          {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              userId: role === "user" ? id : undefined,
                              doctorId: role === "doctor" ? id : undefined,
                            }),
                          }
                        );
                        if (res.ok) {
                          setNotifications((prev) =>
                            prev.map((n) => ({ ...n, isRead: true }))
                          );
                        }
                      } catch (err) {
                        console.error("Error marking all read:", err);
                      }
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#007bff",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    Mark all as read
                  </button>
                  <span
                    onClick={() => setShowDropdown(false)}
                    style={{
                      cursor: "pointer",
                      color: "#555",
                      fontSize: "16px",
                      marginRight: "5px",
                    }}
                  >
                    ✕
                  </span>
                </div>
              </div>

              {/* --- SCROLLABLE LIST --- */}
              <div
                className="notification-list"
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  scrollbarWidth: "none", // Firefox
                }}
              >
                {notifications.length > 0 ? (
                  notifications.map((note) => (
                    <div
                      key={note._id}
                      style={{
                        backgroundColor: note.isRead ? "#f9f9f9" : "#00a99d", // ✨ Change unread color here
                        padding: "10px",
                        borderRadius: "8px",
                        margin: "8px 10px",
                        border: "1px solid #eee",
                      }}
                    >
                      <p style={{ margin: 0, fontSize: "14px", color: "#333" }}>
                        {expandedIds.includes(note._id) ? (
                          <>
                            {note.message.text}{" "}
                            {note.message.link && (
                              <a
                                href={note.message.link}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(note.message.link);
                                }}
                                style={{ color: "#00A99D", textDecoration: "underline", marginRight: "10px" }}
                              >
                                Click here
                              </a>
                            )}
                            <span
                              onClick={() =>
                                setExpandedIds((prev) =>
                                  prev.filter((id) => id !== note._id)
                                )
                              }
                              style={{ color: "#007bff", cursor: "pointer" }}
                            >
                              less
                            </span>
                          </>
                        ) : note.message.text.length > 40 ? (
                          <>
                            {note.message.text.slice(0, 40)}...
                            <span
                              onClick={() => handleMarkRead(note._id)}
                              style={{ color: "#007bff", cursor: "pointer" }}
                            >
                              more
                            </span>
                          </>
                        ) : (
                          <>
                            {note.message.text}{" "}
                            {note.message.link && (
                              <a
                                href={note.message.link}
                                onClick={(e) => {
                                  e.preventDefault(); // stop browser reload
                                  e.stopPropagation();

                                  const link = note.message.link || "";

                                  // ✅ Handle absolute and relative links safely
                                  if (link.startsWith("http")) {
                                    const url = new URL(link);
                                    navigate(url.pathname); // only navigate to path part
                                  } else {
                                    navigate(link); // relative path
                                  }
                                }}
                                style={{ color: "#00A99D", textDecoration: "underline" }}
                              >
                                Click here ...
                              </a>

                            )}
                          </>
                        )}
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: "center", color: "#888", padding: "10px" }}>
                    No notifications
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Image */}

        <img
          src={profileImage}
          alt="User1"
          className="rounded-circle hover:cursor-pointer"
          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
          onClick={handleClick}
        />
      </div>
    </div>
  );
};

export default Topbar;

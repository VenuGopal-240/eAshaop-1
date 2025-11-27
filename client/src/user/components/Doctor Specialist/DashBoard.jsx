import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import generalHealthCare from "../../assets/DBIcons/generalHealthCare.svg";
import cardiologist from "../../assets/DBIcons/cardiologist.svg";
import orthopedic from "../../assets/DBIcons/orthopedic.svg";
import neurologist from "../../assets/DBIcons/neurologist.svg";
import ophthalmology from "../../assets/DBIcons/ophthalmology.svg";
import ent from "../../assets/DBIcons/ent.svg";
import dental from "../../assets/DBIcons/dental.svg";
import womenHealth from "../../assets/DBIcons/womenHealth.svg";
import childHealth from "../../assets/DBIcons/childHealth.svg";
import skin from "../../assets/DBIcons/skin.svg";
import mentalHealth from "../../assets/DBIcons/mentalHealth.svg";
import doctor from "../../assets/icons/doctor.svg";
import styles from "../../components/Doctor Specialist/DashBoard.module.css";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../api-config";
import { getCatagories } from "../../../Util/apiRequest";


const staticCategories = [
  { name: "General healthcare", icon: generalHealthCare, path: "general-healthcare", uuid: "UqkGTNQTOD" },
  { name: "Cardiologist", icon: cardiologist, path: "cardiologist", uuid: "bD1KuA_6pr" },
  { name: "Orthopedic", icon: orthopedic, path: "orthopedic", uuid: "oybWOH7Ok8" },
  { name: "Neurologist", icon: neurologist, path: "neurologist", uuid: "r1ArfRKaU_" },
  { name: "Ophthalmology", icon: ophthalmology, path: "ophthalmology", uuid: "whHEP4Ba-m" },
  { name: "ENT", icon: ent, path: "ent", uuid: "4A31RiqS_M" },
  { name: "Dentist", icon: dental, path: "dental", uuid: "u3bp-C0G4f" },
  { name: "Women health", icon: womenHealth, path: "women-health", uuid: "EGGSWzg5RE" },
  // { name: "Child health", icon: childHealth, path: "child-health" },
  { name: "Skin & Beauty", icon: skin, path: "skin-&-beauty", uuid: "_jCoVKpbHK" },
  { name: "Mental health", icon: mentalHealth, path: "mental-health", uuid: "QWonnSUTJw" },
];

const Dashboard = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // const res = await fetch(`${API_BASE_URL}/api/categories`);
        // const backendCategories = await res.json();
        const backendCategories = await getCatagories()
        // 🔹 Merge backend data into static categories
        const merged = staticCategories.map((cat) => {
          const backendCat = backendCategories.find((b) => b.uuid === cat.uuid);

          return {
            ...cat,
            uuid: backendCat?.uuid || null,
            doctorCount: backendCat?.doctorCount || 0,
            // message: backendCat?.message || null,
          };
        });

        setCategories(merged);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "auto";
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // const handleCategoryClick = (path) => {
  //   navigate(`/user/category/${path}`);
  // };

  const handleCategoryClick = (uuid, name, doctorCount) => {
    // Show toast if no doctors
    if (!uuid || doctorCount === 0) {
      toast.info(`No doctors available for ${name}`);
      return;
    }

    // Navigate to the category page by UUID
    navigate(`/user/category/${uuid}`, { state: { categoryName: name } });
  };


  return (
    <div style={{
      marginLeft: isMobile ? "10px" : "100px",
      // marginTop: "53px",
      overflowX: "hidden",
      // width: "calc(100%)",
      backgroundColor: "#ffffff",
      minHeight: "100vh",
      paddingTop: "93px"
    }}>
      <h1 className={styles.heading} style={{ textAlign: "center", fontSize: "30px" }}>Doctor Specialist</h1>

      <div className="container-fluid px-3">
        <div
          className="row g-3"
          style={{
            display: "flex",
            flexWrap: "wrap",
            // justifyContent: "center",
            margin: "10px",
          }}
        >
          {categories.map((cat, index) => (
            <div
              key={index}
              className="col-12 col-sm-6 col-md-4 d-flex justify-content-center"
              onClick={() => handleCategoryClick(cat.uuid, cat.name, cat.doctorCount)}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  padding: "15px",
                  width: "100%",
                  // minWidth:"380px",
                  height: "100%",
                  transition: "transform 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div className="d-flex align-items-center">
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      marginRight: "12px",
                      // display: "flex",
                      // alignItems: "center",
                      // justifyContent: "center",
                    }}
                  >
                    <img
                      src={cat.icon}
                      alt={cat.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                  <div>
                    <div
                      className="fw-bold"
                      style={{
                        fontSize: "18px",
                        color: "#333",
                      }}
                    >
                      {cat.name}
                    </div>
                    <div className="d-flex align-items-center mt-1">
                      <img
                        src={doctor}
                        alt="Doctor"
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "6px",
                        }}
                      />
                      <small
                        className="text-muted"
                        style={{ fontSize: "14px", color: "#666" }}
                      >
                        Doctors {cat.doctorCount}
                      </small>
                    </div>
                    {cat.message && (
                      <small style={{ color: "red", fontSize: "13px" }}>
                        {cat.message}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* <div className={`row ${styles.rowContainer}`} style={{margin:10}}>
        {categories.map((cat, index) => (
          <div
            key={index}
            className={`${styles.colContainer} col-12 col-sm-6 col-md-4 mb-3`}
            onClick={() => handleCategoryClick(cat.uuid, cat.name, cat.doctorCount)}
          >
            <div className={styles.cardBox}>
              <div className="d-flex align-items-center">
                <div className={styles.iconBox}>
                  <img src={cat.icon} alt={cat.name} className={styles.catIcon} />
                </div>
                <div>
                  <div className="fw-bold" style={{ fontSize: "18px" }}>
                    {cat.name}
                  </div>
                  <div className="d-flex align-items-center mt-1">
                    <img
                      src={doctor}
                      alt="Doctor"
                      style={{ width: "16px", height: "16px", marginRight: "6px" }}
                    />
                    <small className="text-muted" style={{ fontSize: "14px" }}>
                      Doctors {cat.doctorCount}
                    </small>
                  </div>
                  {cat.message && (
                    <small className="text-danger">{cat.message}</small>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default Dashboard;

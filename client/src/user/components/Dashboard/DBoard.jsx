
import React, { useState, useEffect, useContext } from "react";
import eAdd from "../../assets/add.png";
import HeartIcon from "../../assets/icons/Heart.png";
import BloodIcon from "../../assets/icons/blood.png";
import StepsIcon from "../../assets/icons/legfist.png";
import RunningIcon from "../../assets/icons/run.png";
import CyclingIcon from "../../assets/icons/cyckling.png";
import ParacetamolIcon from "../../assets/icons/paracetamol.png";
import SyrupIcon from "../../assets/icons/syrup.png";
import { BellIcon, CalendarDays, StarsIcon } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import docImage from "../../assets/icons/doc.png";
import DownArrow from "../../assets/icons/downarrow.png";
import trendUp from "../../assets/icons/trend-up.png";
import healthcare from "../../assets/icons/healtcare.png";
import Stethoscope from "../../assets/icons/stethoscope.png";
import profile from "../../assets/icons/profile.png";
import rating from "../../assets/icons/star.png";
import steth from "../../assets/icons/steth.png";
import maps from "../../assets/icons/Maps.png";

import eashalog from "../../assets/eashalog.png";
import bookread from "../../assets/bookreading.png";
import { useNavigate } from "react-router-dom";
import styles from './DBoard.module.css';
import axios from "axios";
import { API_BASE_URL } from "../../../api-config";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { ChevronRight, ChevronLeft } from "lucide-react"; // or use any icon you prefer
import Notification from "../Notification/Notification";
import { MyContext } from "../../../App";

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { getAllDoctors, userDetails } from "../../../Util/apiRequest";



// Top of file (or outside component)
const promotedDoctors = [
  {
    name: "Dr. Neha Sharma",
    speciality: "Cardiologist",
    profileImage: docImage,
    hospital: "Fortis Hospital",
    experience: 12,
    fee: 800,
    rating: 4.9,
  },
  {
    name: "Dr. Rahul Mehta",
    speciality: "Neurologist",
    profileImage: docImage,
    hospital: "Apollo Hospital",
    experience: 10,
    fee: 900,
    rating: 4.7,
  },
  {
    name: "Dr. Anjali Verma",
    speciality: "Dermatologist",
    profileImage: docImage,
    hospital: "Max Healthcare",
    experience: 8,
    fee: 750,
    rating: 4.8,
  },
  {
    name: "Dr. Rahul Mehta",
    speciality: "Neurologist",
    profileImage: docImage,
    hospital: "Apollo Hospital",
    experience: 10,
    fee: 900,
    rating: 4.7,
  },
  {
    name: "Dr. Anjali Verma",
    speciality: "Dermatologist",
    profileImage: docImage,
    hospital: "Max Healthcare",
    experience: 8,
    fee: 750,
    rating: 4.8,
  }, {
    name: "Dr. Rahul Mehta",
    speciality: "Neurologist",
    profileImage: docImage,
    hospital: "Apollo Hospital",
    experience: 10,
    fee: 900,
    rating: 4.7,
  },
  {
    name: "Dr. Anjali Verma",
    speciality: "Dermatologist",
    profileImage: docImage,
    hospital: "Max Healthcare",
    experience: 8,
    fee: 750,
    rating: 4.8,
  },
  {
    name: "Dr. Rahul Mehta",
    speciality: "Neurologist",
    profileImage: docImage,
    hospital: "Apollo Hospital",
    experience: 10,
    fee: 900,
    rating: 4.7,
  },
  {
    name: "Dr. Anjali Verma",
    speciality: "Dermatologist",
    profileImage: docImage,
    hospital: "Max Healthcare",
    experience: 8,
    fee: 750,
    rating: 4.8,
  },
  {
    name: "Dr. Rahul Mehta",
    speciality: "Neurologist",
    profileImage: docImage,
    hospital: "Apollo Hospital",
    experience: 10,
    fee: 900,
    rating: 4.7,
  },
  {
    name: "Dr. Anjali Verma",
    speciality: "Dermatologist",
    profileImage: docImage,
    hospital: "Max Healthcare",
    experience: 8,
    fee: 750,
    rating: 4.8,
  },
];


const NextArrow = ({ onClick }) => {
  return (
    <div
      className="absolute top-[35%] right-[-20px] z-10 cursor-pointer bg-white p-2 rounded-full shadow"
      onClick={onClick}
    >
      <ChevronRight className="text-[#013A63] w-6 h-6" />
    </div>
  );
};

const PrevArrow = ({ onClick }) => {
  return (
    <div
      className="absolute top-[35%] left-[-20px] z-10 cursor-pointer bg-white p-2 rounded-full shadow"
      onClick={onClick}
    >
      <ChevronLeft className="text-[#013A63] w-6 h-6" />
    </div>
  );
};



const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: 2,
  slidesToScroll: 1,
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />,
  autoplay: true,
  autoplaySpeed: 4000,
  responsive: [
    {
      breakpoint: 768,
      settings: { slidesToShow: 1 },
    },
  ],
};



const statsData = [
  {
    title: "Heart rate",
    value: "80.2",
    subvalue: "BPM",
    icon: HeartIcon,
    // trend: true,
  },
  { title: "Blood pressure", value: "120/75", icon: BloodIcon, },
  {
    title: "Most activities",
    value: "7",
    subvalue: "Hours",
    icon: BloodIcon,
    // trend: true,
  },
  { title: "", value: "8,300", icon: StepsIcon },
  { title: "", value: "2", subvalue: "Hours", icon: RunningIcon },
  { title: "", value: "6", subvalue: "KM", icon: CyclingIcon },
];

const activityData = [
  {
    title: "Most activities",
    value: "7",
    subvalue: "Hours",
    icon: BloodIcon,
    trend: true,
  },
  { title: "", value: "8,300", icon: StepsIcon },
  { title: "", value: "2", subvalue: "Hours", icon: RunningIcon },
  { title: "", value: "6", subvalue: "KM", icon: CyclingIcon },
];

const images = [eAdd, eAdd, eAdd, eAdd, eAdd];

const reminders = [
  {
    icon: ParacetamolIcon,
    name: "Paracetamol 325 mg",
    dose: "1 Pill",
    time: "9:20 am, Today",
  },
  {
    icon: ParacetamolIcon,
    name: "Paracetamol 325 mg",
    dose: "1 Pill",
    time: "9:20 am, Today",
  },
  {
    icon: SyrupIcon,
    name: "Pagdol P",
    dose: "Syrup 5ml",
    time: "9:20 am, Today",
  },
  {
    icon: SyrupIcon,
    name: "Pagdol P",
    dose: "Syrup 5ml",
    time: "9:20 am, Today",
  },
  {
    icon: SyrupIcon,
    name: "Pagdol P",
    dose: "Syrup 5ml",
    time: "9:20 am, Today",
  },
  {
    icon: SyrupIcon,
    name: "Pagdol P",
    dose: "Syrup 5ml",
    time: "9:20 am, Today",
  },
];

const prescriptions = [
  { title: "Prescription - 1", subtitle: "Dr. Jackob Jones" },
  { title: "Prescription - 2", subtitle: "Dr. Jackob Jones" },
  { title: "CT Scan", subtitle: "KIMS Hospital, Hyderabad, Telangana." },
  { title: "Blood Test", subtitle: "Shylaja Lab, Hyderabad, Telangana." },
  { title: "MRI", subtitle: "Shylaja Lab, Hyderabad, Telangana." },
];

// const doctors = Array(3).fill({
//   name: "Dr. Clara Bennett",
//   spec: "Pulmonologist",
//   slots: "56 slots available",
//   rating: "4.2",
//   next: "Next slot today at 12:40pm",
// });

function DBoard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [shownIndex, setShownIndex] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [showComingSoon, setShowComingSoon] = useState(true);
  const [soltType, setSoltType] = useState(false);


  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    console.log("Stored User from localStorage:", storedUser);

    if (!storedUser?.id) {
      console.warn("No user found in localStorage, skipping fetch.");
      setLoading(false);
      return;
    }
    const userId = localStorage.getItem("userId");

    const fetchAppointments = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/appointments/user/${userId}`
        );
        console.log("response from backend", res)
        setAppointments({
          upcoming: res.data.upcoming || [],
          past: res.data.past || [],
        });
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    // Show stored user immediately
    setUser(storedUser);

    // Fetch latest user data from backend
    // fetch(`${API_BASE_URL}/api/user/${storedUser.id}`)
    //   .then((res) => res.json()) // parse JSON
    userDetails(storedUser.id)
      .then((data) => {
        // console.log("Fetched user from API:", data);
        // backend should return { user: {...} } or just {...}
        setUser(data.user || data || storedUser);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
      })
      .finally(() => setLoading(false));

    // if (userId) fetchAppointments();

  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchAppointments = async () => {
      try {
      const e = await fetchAppointments(userId);

      setAppointments({
        upcoming: e.data.upcoming || [],
        past: e.data.past || [],
      });
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
    };
    // fetchAppointments();
    getAllDoctors()
    // fetch(`${API_BASE_URL}/api/doctors/all`)
    //   .then((res) => res.json())
      .then((data) => {
        console.log("Fetched doctors:", data);

        // Make sure data.doctors exists and is an array
        if (Array.isArray(data.doctors)) {
          setDoctors(data.doctors.slice(0, 25)); // ✅ Get top 3 doctors
          console.log(doctors)
        } else {
          setDoctors([]); // fallback
        }
      })

      .catch((err) => {
        console.error("Error fetching doctors:", err);
        setDoctors([]);
      });
  }, []);

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



  const [selectedOption, setSelectedOption] = useState("video_consultation");
  const [openDialog, setOpenDialog] = useState(false);
  const [doctorDetails, setDoctorDetails] = useState();
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const conformSlotType = () => {
    console.log("SELE", selectedOption);

    navigate("/user/category/bookappointment", {
      state: {
        doctorId: doctorDetails.id,
        consultationType: selectedOption == "video_consultation" ? "Video" : "Clinic",
        selectedType: selectedOption,
        details: doctorDetails
      }
    })
  }

  const navigateTheDoctorPage = (d) => {
    if (d?.consultationMode === "Both") {
      setOpenDialog(true);
      // navigate("/user/category/bookappointment", {
      //   state: {
      //     doctorId: d.id,
      //     consultationType: selectedOption === "video" ? "Video" : "Clinic",
      //     selectedType: selectedOption,
      //     details: d
      //   }
      // })
    }
    else {
      setSelectedOption(d?.consultationMode);
      navigate("/user/category/bookappointment", {
        state: {
          doctorId: d.id,
          consultationType: selectedOption === "video_consultation" ? "Video" : "Clinic",
          selectedType: d?.consultationMode,
          details: d
        }
      })
    }
    console.log(selectedOption);
    setDoctorDetails(d);
    console.log(d?.consultationMode);
  }
  const { showNotification, setShowNotification } = useContext(MyContext);

  const notifications = [
    { header: "Coming Soon", title: "Update coming soon!" },
    // { header: "New Feature", title: "Stay tuned for exciting updates!" },
    // { header: "Maintenance", title: "Scheduled maintenance tonight." },
    // { header: "Notice", title: "We’ll be back with improvements!" },
  ];

  return (
    <>

      <Notification showNotification={showNotification} setShowNotification={setShowNotification} notifications={notifications} />

      <div className={`${styles.dMainContainer} flex justify-end`}>
        <div className={`${styles.dContainer} flex w-[1080px] mt-5 gap-10 `} style={{
          marginLeft: isMobile ? "10px" : "100px",
          marginTop: "53px",
          overflowX: "hidden",
          width: "calc(100%)",
          backgroundColor: "#ffffff",
          // minHeight: "100vh",
        }}>

          <div className={`container max-w-7xl mt-5 pt-6 space-y-6`}>
            <div className="grid grid-cols-[1fr] justify-between items-center">
              <div className={`${styles.dboardContainer}`} style={{ marginTop: "1rem" }} >
                <h1 className="dboard-header font-urbanist font-bold text-[24px] leading-[120%] text-[#013A63]">
                  {loading ? "Loading..." : user ? `Hey, ${user.full_name}!` : "User not found"}
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-[#252525] font-urbanist font-normal text-[18px] leading-[120%]">
                    Your health is in safe hands
                  </p>
                  <span>
                    <img src={healthcare} alt="" className="inline-block pb-3" />
                  </span>
                </div>


              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="sec-header font-medium leading-[120%] text-[#252525] text-[24px]">
                  Upcoming appointments
                </h2>
                <button
                  // className="text-[#494949] text-[18px] font-normal hover:cursor-pointer hover:underline"
                  className="{`${styles.viewallBtn}text-[16px] md:text-[18px] font-medium text-[#00A99D] hover:underline transition"

                  onClick={() => {
                    navigate("/user/appointment");
                  }}
                >
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {appointments.upcoming?.map((a, i) => {
                  const isShown = shownIndex === i;
                  const dateObj = new Date(a.date);
                  const formattedDate = dateObj.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={i}
                      className="bg-white p-3 rounded-md border flex flex-col justify-between text-sm"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="text-[#333]">
                              <strong>Doctor Name:</strong> {a.doctor.name}
                            </p>
                            <p className="text-[#555]">
                              <strong>Speciality:</strong> {a.doctor.speciality}
                            </p>
                            <p className="text-[#555]">
                              <strong>Consultation Mode:</strong> {a.doctor.consultationMode}
                            </p>
                            <p className="text-[#555]">
                              <strong>Hospital:</strong> {a.doctor.hospitalName}
                            </p>
                          </div>

                          <div className="h-[45px] w-[45px] rounded-full flex items-center justify-center bg-[#F7F7F7]">
                            <img
                              src={a.doctor.profileImage}
                              alt="Doctor"
                              className="h-[28px] w-[28px]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center mt-2 gap-2">
                          <CalendarDays className="w-5 h-5 text-gray-400" />
                          {/* <p className="text-[#555]"> */}
                          <strong>Date:</strong> {formattedDate} | <strong>Time:</strong> {a.time}
                          {/* </p> */}
                        </div>
                      </div>


                      <div className="mt-3 flex justify-end">
                        <button
                          className="text-[#494949] text-[18px] font-normal hover:cursor-pointer hover:underline"
                          onClick={() => {
                            navigate("/user/appointment");
                          }}
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  );

                })}
              </div>


              {showContent && (
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-[350px_2fr] items-center p-4 bg-white rounded-lg border">
                  <div className="w-[350px] h-[135px]">
                    <h2 className="text-[24px] font-medium leading-[120%] text-[#252525]">
                      KIMS Hospitals
                    </h2>
                    <p className="text-[18px] font-normal text-[#8E8E8E]">
                      1-8-31/1, Minister Road Krishna Nagar Colony, Ramgopalpet,
                      Begumpet, Secunderabad, Telangana 500003
                      <br />
                      <span>4.5 km | 24min</span>
                    </p>
                  </div>

                  <div>
                    <img src={maps} alt="" className="w-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div
                className="relative bg-[rgba(0,0,0,0.6)] rounded-lg border border-gray-100 
                      flex flex-col h-auto md:h-[300px] max-h-[60vh] overflow-hidden "
              >
                <div className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-10">
                  <h2 className="text-[22px] md:text-[24px] font-semibold text-[#252525]">
                    Lab tests & Prescriptions
                  </h2>
                  <button style={{ cursor: showComingSoon ? 'not-allowed' : "pointer" }} className="text-[16px] md:text-[18px] font-medium text-[#00A99D] hover:underline transition">
                    View all
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto relative">
                  {showComingSoon && (
                    <div
                      className="absolute inset-0 w-full h-100vh  
                         flex flex-col items-center justify-center z-50 overflow-y-auto"
                    >
                      <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#009084" }} >
                        Coming Soon!
                      </h1>
                      <p className="text-white text-base md:text-xl text-center px-4 pb-4">
                        We're preparing this section for launch. Please check back later.
                      </p>
                    </div>
                  )}
                  {prescriptions.map((p, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center px-4 py-3  "
                    >
                      <div>
                        <p className="text-[18px] text-[#252525] font-medium">{p.title}</p>
                        <p className="text-[15px] text-[#6B7582] font-normal">{p.subtitle}</p>
                      </div>
                      <img
                        src={DownArrow}
                        alt="Download"
                        className="w-[44px] h-[44px] p-[8px] hover:cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="bg-white rounded-lg border border-gray-100 
                    flex flex-col h-auto md:h-[600px] max-h-[60vh] overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-10">
                  <h2 className="text-[22px] md:text-[24px] font-semibold text-[#252525]">
                    My Doctor
                  </h2>
                  <button
                    className="text-[16px] md:text-[18px] font-medium text-[#00A99D] hover:underline transition"
                    onClick={() => navigate("/user/category")}
                  >
                    View all
                  </button>
                </div>
                {openDialog && (
                  <div className="fixed inset-0 flex items-center justify-center  bg-opacity-40 z-[1000] " >
                    <div className=" rounded-2xl  w-[350px] p-6" style={{ backgroundColor: "#94f6eeff" }}>
                      <h4 className="text-lg font-semibold mb-4 text-secondary-800" style={{ color: "#000000ff" }}>
                        Select Consultation Type
                      </h4>
                      <FormControl>
                        <RadioGroup
                          aria-labelledby="demo-radio-buttons-group-label"
                          defaultValue="female"
                          name="radio-buttons-group"
                        >
                          <FormControlLabel name="consultation" value="video_consultation" checked={selectedOption === "video_consultation"} onChange={handleOptionChange} control={<Radio />} label="Video Consultation" />
                          <FormControlLabel value="clinic_visit" checked={selectedOption === "clinic_visit"} onChange={handleOptionChange} control={<Radio />} label="Clinic Visit" />
                        </RadioGroup>
                      </FormControl>
                      <div className="flex justify-end mt-2 space-x-3">
                        <button
                          onClick={() => setOpenDialog(false)}
                          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 m-1"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={conformSlotType}
                          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 m-1"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex-1 overflow-y-auto">
                  {doctors.map((d, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-center sm:justify-start w-full sm:w-[30%]">
                        <img
                          src={d.profileImage || docImage}
                          alt={d.name}
                          className="w-[90px] h-[90px] rounded-xl object-cover"
                        />
                      </div>

                      <div className="flex-1 w-full sm:w-[70%] flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex gap-2 items-center">
                              <span className="bg-green-100 text-[#06A343] py-[3px] px-[8px] rounded-[6px] text-[13px] font-medium">
                                {d.consultationMode || "Clinic Visit"}
                              </span>
                              <span className="flex items-center gap-1 text-[13px] text-[#494949]">
                                <img src={rating} alt="rating" className="h-[14px] w-[14px]" />
                                {d.averageRating || "4.5"} / 5
                              </span>
                            </div>
                          </div>

                          <h3 className="text-[17px] md:text-[18px] font-semibold text-[#252525]">
                            Dr. {d.name}
                          </h3>

                          <div className="flex items-start gap-2 mt-1">
                            <img src={steth} alt="Stethoscope" className="h-4 w-4 mt-[2px]" />
                            <p className="text-[14px] text-[#494949]">{d.speciality}</p>
                          </div>

                          <p className="text-[13px] text-[#494949] mt-1">
                            Experience: <span className="font-medium">{d.experience}</span> years | Fee:{" "}
                            <span className="font-medium">₹{d.consultationFee}</span>
                          </p>
                        </div>

                        <div className="mt-3 sm:mt-0 flex w-full sm:justify-end">
                          <button
                            className="w-full sm:w-auto bg-[#00A99D] text-white py-2 px-5 rounded-full text-[14px] md:text-[15px] font-medium hover:bg-[#009084] active:scale-95 transition-transform"
                            onClick={() => navigateTheDoctorPage(d)}
                          >
                            Book a slot
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

    </>
  );
}

export default DBoard;

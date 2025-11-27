// import React, { useState, useEffect } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import axios from "axios";
// import { API_BASE_URL } from "../../../api-config";
// // This component encapsulates the UI for the bookings list.
// const statusStyles = {
//   pending: { backgroundColor: "#facc15", color: "#fff" },
//   completed: { backgroundColor: "#22c55e", color: "#fff" },
//   cancelled: { backgroundColor: "#ef4444", color: "#fff" },
// };

// const LatestBookings = ({ bookings }) => {
//   return (
//     <div className="bg-white rounded-2xl border border-[#F7F7F7] p-4 w-full">
//       <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 break-words">
//         Latest Bookings
//       </h2>
//       <div className="space-y-4">
//         {bookings.map((b, i) => (
//           <div key={i} className="flex items-center justify-between w-full">
//             <div className="flex items-center gap-3 w-full max-w-[70%]">
//               <img
//                 src="https://randomuser.me/api/portraits/women/44.jpg"
//                 alt={b.userId?.full_name}
//                 className="w-10 h-10 rounded-full object-cover"
//               />
//               <div className="whitespace-normal break-words">
//                 <p className="text-xs sm:text-sm md:text-base font-medium break-words">
//                   {b.userId?.full_name || "Unknown"}
//                 </p>
//                 <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">
//                   {b.date} at {b.time}
//                 </p>
//               </div>
//             </div>
//             <span
//               className="px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs md:text-sm font-medium capitalize"
//               style={statusStyles[b.status]}
//             >
//               {b.status}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // --- CHART DATA ---
// const dataSets = {
//   days: [
//     { name: "1", earnings: 2000 },
//     { name: "2", earnings: 3500 },
//     { name: "3", earnings: 2800 },
//     { name: "4", earnings: 4000 },
//     { name: "5", earnings: 3000 },
//     { name: "6", earnings: 4200 },
//     { name: "7", earnings: 3900 },
//   ],
//   week: [
//     { name: "Mon", earnings: 12000 },
//     { name: "Tue", earnings: 15000 },
//     { name: "Wed", earnings: 10000 },
//     { name: "Thu", earnings: 20000 },
//     { name: "Fri", earnings: 18000 },
//     { name: "Sat", earnings: 22000 },
//     { name: "Sun", earnings: 17000 },
//   ],
//   month: [
//     { name: "Week 1", earnings: 60000 },
//     { name: "Week 2", earnings: 65000 },
//     { name: "Week 3", earnings: 58000 },
//     { name: "Week 4", earnings: 70000 },
//   ],
//   year: [
//     { name: "Jan", earnings: 60000 },
//     { name: "Feb", earnings: 55000 },
//     { name: "Mar", earnings: 58000 },
//     { name: "Apr", earnings: 60000 },
//     { name: "May", earnings: 55000 },
//     { name: "Jun", earnings: 60000 },
//     { name: "Jul", earnings: 55000 },
//     { name: "Aug", earnings: 60000 },
//     { name: "Sep", earnings: 60000 },
//     { name: "Oct", earnings: 60000 },
//     { name: "Nov", earnings: 60000 },
//     { name: "Dec", earnings: 60000 },
//   ],
// };

// // --- MAIN DASHBOARD COMPONENT ---
// const Dashboard = () => {
//   const [selectedRange, setSelectedRange] = useState("week");
//   const [isActive, setIsActive] = useState(true);
//   const [bookings, setBookings] = useState([]);
//   const [totalAppointments, setTotalAppointments] = useState(0);
//   const [totalEarnings, setTotalEarnings] = useState(0);
//   useEffect(() => {
//     try {
//       console.log("in call of appointment fecthing");
//       const doctorId = localStorage.getItem("doctorId");
//       console.log(doctorId);

//       if (doctorId) {
//         const fetchBookings = async () => {
//           const response = await axios.get(
//             `${API_BASE_URL}/api/appointments/doctor/${doctorId}`
//           );
//            const { upcoming = [], past = [] } = response.data;
//           console.log(response.data);
//           setBookings(response.data.upcoming || []);
//           setTotalAppointments(response.data.upcoming.length + response.data.past.length);
//            // Calculate total earnings from completed/booked past appointments
//         const earnings = past
//           .filter((appointment) =>
//             ["booked", "completed"].includes(appointment.status?.toLowerCase())
//           )
//           .reduce((sum, appt) => sum + (Number(appt.amount) || 0), 0);

//         setTotalEarnings(earnings);
//         };
//         fetchBookings();
//       }
//     } catch (error) {
//       console.error("Error fetching bookings:", error);
//     }
//   }, []);

//   return (
//     <div className="overflow-y-hidden">
//       <div className="ml-0 md:pl-[80px] lg:pl-[260px] xl:pl-[327px] mt-[75px] md:mt-[75px] lg:mt-[80px] font-urbanist px-4 sm:px-6 max-w-full overflow-hidden">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
//           <h1 className="text-xl sm:text-2xl md:text-3xl font-bold break-words">
//             Dashboard Overview
//           </h1>
//         </div>

//         {/* Toggle Switch below heading on its own line */}
//         <div className="mt-3 flex items-center gap-3">
//           <span className="text-sm font-medium">Status:</span>
//           <label className="relative inline-flex items-center cursor-pointer">
//             <input
//               type="checkbox"
//               checked={isActive}
//               onChange={() => setIsActive(!isActive)}
//               className="sr-only peer"
//             />
//             <div
//               className={`w-12 h-6 rounded-full transition-colors duration-300 ${
//                 isActive ? "bg-[#00A99D]" : "bg-gray-300"
//               } peer-checked:bg-[#00A99D]`}
//             ></div>
//             <div
//               className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 ${
//                 isActive ? "translate-x-6" : "translate-x-0"
//               }`}
//             ></div>
//           </label>
//           <span className="text-sm font-medium">
//             {isActive ? "Active" : "Inactive"}
//           </span>
//           <a
//             href="https://meet.jit.si/d6b3a8a3-128c-4f61-baef-f22e2713db51"
//             target="_blank"
//             rel="noopener noreferrer"
//             style={{
//               padding: "10px 20px",
//               backgroundColor: "#00A99D",
//               color: "#fff",
//               borderRadius: "8px",
//               textDecoration: "none",
//               marginLeft: "30px",
//               fontWeight: "500",
//             }}
//           >
//             <button>Join Call</button>
//           </a>
//         </div>

//         {/* FLEX LAYOUT */}
//         <div className="flex flex-col xl:flex-row gap-6 mt-6">
//           {/* LEFT CONTENT */}
//           <div className="flex-1 space-y-6 w-full">
//             {/* Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 w-full max-w-full">
//              <div className="rounded-xl shadow-sm flex flex-col justify-center px-6 py-4 bg-[#00A99D] text-white w-full">
//   <h2 className="text-sm sm:text-base md:text-lg font-medium break-words">
//     Total Earnings
//   </h2>
//   <p className="text-xl sm:text-2xl md:text-3xl font-bold break-words">
//     ₹{totalEarnings.toLocaleString()}
//   </p>
//   <p className="text-xs sm:text-sm mt-1 italic text-white/80">
//     From completed appointments
//   </p>
// </div>


//               <div className="rounded-xl shadow-sm flex items-center justify-between px-4 py-3 border border-[#F7F7F7] bg-white w-full">
//                 <div className="flex flex-col justify-center w-full">
//                   <h2 className="text-xs sm:text-sm md:text-base font-medium text-gray-700 leading-none break-words">
//                     Total Appointments
//                   </h2>
//                   <p className="text-lg sm:text-xl md:text-2xl font-bold text-black leading-tight break-words">
//                     {totalAppointments}
//                   </p>
//                   <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 leading-none">
//                     Last 30 days
//                   </p>
//                 </div>
//                 <img
//                   src="https://img.icons8.com/ios-filled/50/appointment-reminders.png"
//                   alt="Appointments"
//                   className="w-8 sm:w-10 h-8 sm:h-10 flex-shrink-0"
//                 />
//               </div>
//             </div>

//             {/* Earnings Chart */}
//             <div className="w-full">
//               <div className="flex justify-between items-center mb-3">
//                 <h2 className="text-lg sm:text-xl md:text-2xl font-semibold break-words">
//                   Earning Summary
//                 </h2>
//                 <select
//                   className="border border-gray-300 rounded-md px-3 py-1 text-xs sm:text-sm md:text-base"
//                   value={selectedRange}
//                   onChange={(e) => setSelectedRange(e.target.value)}
//                 >
//                   <option value="days">Today</option>
//                   <option value="week">This Week</option>
//                   <option value="month">This Month</option>
//                   <option value="year">This Year</option>
//                 </select>
//               </div>
//               <div className="border border-[#0077771A] rounded-xl h-64 p-4 bg-white w-full max-w-full overflow-hidden">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={dataSets[selectedRange]}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar
//                       dataKey="earnings"
//                       fill="#0077771A"
//                       barSize={30}
//                       radius={[6, 6, 0, 0]}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             {/* UPDATED: Latest Bookings (stacked below for small desktops) */}
//             <div className="w-full xl:hidden max-h-[70vh] overflow-y-auto space-y-6 mt-4">
//               <LatestBookings bookings={bookings} />
//             </div>
//           </div>

//           {/* UPDATED: Latest Bookings (right side for xl+ screens) */}
//           <div className="hidden xl:block w-full xl:w-80 max-h-[70vh] overflow-y-auto space-y-6">
//             <LatestBookings bookings={bookings} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
// import socket from "../../../common/socket";
import socket from '../../../commonComponents/socket';
import { API_BASE_URL } from "../../../api-config";

// --- Latest Bookings Component ---
const statusStyles = {
  pending: { backgroundColor: "#facc15", color: "#fff" },
  completed: { backgroundColor: "#22c55e", color: "#fff" },
  cancelled: { backgroundColor: "#ef4444", color: "#fff" },
};

const LatestBookings = ({ bookings }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#F7F7F7] p-4 w-full">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 break-words">
        Latest Bookings
      </h2>
      <div className="space-y-4">
        {bookings.map((b, i) => (
          <div key={i} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 w-full max-w-[70%]">
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt={b.userId?.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="whitespace-normal break-words">
                <p className="text-xs sm:text-sm md:text-base font-medium break-words">
                  {b.userId?.full_name || "Unknown"}
                </p>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">
                  {b.date} at {b.time}
                </p>
              </div>
            </div>
            <span
              className="px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs md:text-sm font-medium capitalize"
              style={statusStyles[b.status]}
            >
              {b.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Chart Data ---
const dataSets = {
  days: [...Array(7)].map((_, i) => ({ name: `${i + 1}`, earnings: 2000 + i * 300 })),
  week: [
    { name: "Mon", earnings: 12000 },
    { name: "Tue", earnings: 15000 },
    { name: "Wed", earnings: 10000 },
    { name: "Thu", earnings: 20000 },
    { name: "Fri", earnings: 18000 },
    { name: "Sat", earnings: 22000 },
    { name: "Sun", earnings: 17000 },
  ],
  month: [
    { name: "Week 1", earnings: 60000 },
    { name: "Week 2", earnings: 65000 },
    { name: "Week 3", earnings: 58000 },
    { name: "Week 4", earnings: 70000 },
  ],
  year: [
    { name: "Jan", earnings: 60000 },
    { name: "Feb", earnings: 55000 },
    { name: "Mar", earnings: 58000 },
    { name: "Apr", earnings: 60000 },
    { name: "May", earnings: 55000 },
    { name: "Jun", earnings: 60000 },
    { name: "Jul", earnings: 55000 },
    { name: "Aug", earnings: 60000 },
    { name: "Sep", earnings: 60000 },
    { name: "Oct", earnings: 60000 },
    { name: "Nov", earnings: 60000 },
    { name: "Dec", earnings: 60000 },
  ],
};

// --- Main Component ---
const Dashboard = () => {
  const [selectedRange, setSelectedRange] = useState("week");
  const [isActive, setIsActive] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const doctorId = localStorage.getItem("doctorId");
    if (!doctorId) return;

    console.log("Dashboard mounted for doctorId:", doctorId);

    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/appointments/doctor/${doctorId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          }
        });
        const { upcoming = [], past = [] } = res.data;

        setBookings(upcoming);
        setTotalAppointments(upcoming.length + past.length);

        const earnings = past
          .filter(appt => ["booked", "completed"].includes(appt.status?.toLowerCase()))
          .reduce((sum, appt) => sum + (Number(appt.amount) || 0), 0);

        setTotalEarnings(earnings);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };

    // Initial fetch
    fetchBookings();

    // Join the doctor room
    socket.emit("joinDoctorRoom", doctorId, (ack) => {
      console.log("Joined Doctor Room:", ack);
    });

    // Refetch bookings on updates
    socket.on("appointmentUpdated", () => {
      fetchBookings();
    });

    socket.on("appointmentDeleted", () => {
      fetchBookings();
    });

    socket.on("appointmentInserted", () => {
      fetchBookings();
    });

    // Cleanup on unmount
    return () => {
      socket.off("appointmentUpdated");
      socket.off("appointmentDeleted");
      socket.off("appointmentInserted");
      // socket.disconnect();
    };
  }, []);

  return (
    // <div className="overflow-y-hidden">
    <div className="w-full overflow-x-hidden">
      <div className="ml-0 md:pl-[80px] lg:pl-[260px] xl:pl-[327px] mt-[75px] px-4 sm:px-6 font-urbanist">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Dashboard Overview</h1>
        </div>

        {/* Toggle + Call */}
        <div className="mt-3 flex items-center gap-x-3 sm:gap-x-5">
          {/* Status Toggle Content */}
          <div className="flex items-center gap-x-2 sm:gap-x-3">
            <span className="text-sm font-medium">Status:</span>
            {/* Toggle is smaller on mobile */}
            <label className="relative inline-block w-10 h-5 sm:w-12 sm:h-6">
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => setIsActive(!isActive)}
                className="sr-only peer"
              />
              <div className="w-full h-full rounded-full bg-gray-300 transition-colors duration-300 peer-checked:bg-[#00A99D]" />
              <div
                className="absolute left-0.5 top-0.5 w-4 h-4 sm:left-1 sm:top-1 sm:w-4 sm:h-4 bg-white rounded-full shadow transition-transform duration-300 
                           peer-checked:translate-x-[18px] sm:peer-checked:translate-x-6"
              />
            </label>
            {/* Text container is narrower on mobile */}
            <span className="text-sm font-medium w-14 sm:w-16">{isActive ? "Active" : "Inactive"}</span>
          </div>

          {/* Join Call Button Content */}
          <a
            href="https://meet.jit.si/d6b3a8a3-128c-4f61-baef-f22e2713db51"
            target="_blank"
            rel="noopener noreferrer"
            className="
            bg-[#00A99D] text-white rounded-lg font-medium whitespace-nowrap
            text-sm px-3 py-1.5
            sm:px-4 sm:py-2
        "
            style={{ textDecoration: "none" }}
          >
            Join Call
          </a>
        </div>

        {/* Layout */}
        <div className="flex flex-col xl:flex-row gap-6 mt-6">
          {/* Left Panel */}
          <div className="flex-1 space-y-6 w-full">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div className="rounded-xl shadow-sm px-6 py-4 bg-[#00A99D] text-white w-full">
                <h2 className="text-sm sm:text-base md:text-lg font-medium">Total Earnings</h2>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">
                  {/* ₹{totalEarnings.toLocaleString()} */}
                </p>
                <p className="text-xs sm:text-sm mt-1 italic text-white/80">
                  From completed appointments
                </p>
              </div>

              <div className="rounded-xl shadow-sm flex items-center justify-between px-4 py-3 border border-[#F7F7F7] bg-white w-full">
                <div className="flex flex-col">
                  <h2 className="text-xs sm:text-sm md:text-base font-medium text-gray-700">
                    Total Appointments
                  </h2>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-black">
                    {totalAppointments}
                  </p>
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">
                    Last 30 days
                  </p>
                </div>
                <img
                  src="https://img.icons8.com/ios-filled/50/appointment-reminders.png"
                  alt="Appointments"
                  className="w-8 sm:w-10 h-8 sm:h-10"
                />
              </div>
            </div>

            {/* Chart */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Earning Summary</h2>
                <select
                  className="border border-gray-300 rounded-md px-3 py-1 text-xs sm:text-sm"
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value)}
                >
                  <option value="days">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div className="border border-[#0077771A] rounded-xl h-64 p-4 bg-white w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataSets[selectedRange]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="earnings"
                      fill="#0077771A"
                      barSize={30}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bookings (mobile view) */}
            <div className="w-full xl:hidden max-h-[70vh] overflow-y-auto space-y-6 mt-4">
              <LatestBookings bookings={bookings} />
            </div>
          </div>

          {/* Bookings (sidebar on XL) */}
          <div className="hidden xl:block w-full xl:w-80 max-h-[70vh] overflow-y-auto space-y-6">
            <LatestBookings bookings={bookings} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

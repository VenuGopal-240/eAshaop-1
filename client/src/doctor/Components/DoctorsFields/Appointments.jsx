import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../api-config";
import styled, { css } from "styled-components"; // <-- Import
import Select from "react-select";
// import socket from "../../../common/socket";
import socket from '../../../commonComponents/socket';

const PAGE_SIZE = 10;

// ========================================================================
//  STYLED COMPONENTS (Replaces your <style> tag)
// ========================================================================

const Container = styled.div`
  max-width: 1100px;
  margin: 40px auto;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
  color: #333;

  @media (max-width: 768px) {
    padding: 15px;
    margin-top: 100px; 
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #222;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
  display: inline-block;
`;

const AppointmentSection = styled.section`
  margin-bottom: 40px;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const StyledInput = styled.input`
  padding: 10px 14px;
  font-size: 1rem;
  border: 1.5px solid #ccc;
  border-radius: 6px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 6px rgba(0, 123, 255, 0.4);
  }

  &[type="text"] {
    flex-grow: 1;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

// A dynamic button component
const Button = styled.button`
  padding: 8px 16px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  text-align: center;
  transition: background-color 0.2s;
  white-space: nowrap; // Prevents text wrap

  /* Default/Primary styles */
  background-color: #007bff;
  &:hover {
    background-color: #0056b3;
  }

  /* Variant styles */
  ${(props) =>
    props.variant === "danger" &&
    css`
      background-color: #dc3545;
      &:hover {
        background-color: #c82333;
      }
    `}

  ${(props) =>
    props.variant === "secondary" &&
    css`
      background-color: #6c757d;
      &:hover {
        background-color: #5a6268;
      }
    `}

  /* Disabled state */
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    opacity: 0.7;
    &:hover {
      background-color: #ccc;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  border-radius: 8px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
  min-width: 700px;
  background-color: #fff;

  thead tr {
    background-color: #f9fafb;
    text-align: left;
    font-weight: 600;
  }

  th,
  td {
    padding: 14px 16px;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background-color: #f0f4f8;
  }

  .no-data {
    text-align: center;
    padding: 30px 0;
    color: #777;
  }

  .capitalize {
    text-transform: capitalize;
  }
`;


// const getStatusColor = (status) => {
//   switch (status) {
//     case "join":
//       return "#0d6efd"; // Blue
//     case "cancel":
//     case "cancelled":
//       return "#dc3545"; // Red
//     case "completed":
//       return "#28a745"; // Green
//     default:
//       return "#6c757d"; // Gray
//   }
// };

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "join":
    case "joined":
      return "#4CAF50"; // green
    case "cancel":
    case "cancelled":
      return "#F44336"; // red
    case "completed":
      return "#2196F3"; // blue
    default:
      return "#9E9E9E"; // gray
  }
};


const StyledSelectWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 120px;

  &::after {
    content: "▼";
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.7rem;
    color: white;
    pointer-events: none;
  }
`;


const StyledSelect = styled.select`
 width: 100%;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1.5px solid #ccc;
  font-size: 0.9rem;
  background-color: ${({ status }) => getStatusColor(status)};
  cursor: pointer;
  transition: border-color 0.2s ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  color: white;

  &:hover {
    border-color: #007bff;
  }

  &:disabled {
    background-color: #f2f2f2;
    color: #999;
    cursor: not-allowed;
  }
`;


const PaginationControls = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;

  span {
    font-size: 1rem;
    min-width: 100px;
    text-align: center;
  }

  ${Button} {
    min-width: 80px;
  }

  @media (max-width: 768px) {
    gap: 10px;
    span {
      font-size: 0.85rem;
      min-width: 80px;
    }
    ${Button} {
      min-width: 60px;
      padding: 6px 10px;
      font-size: 0.85rem;
    }
  }
`;

// For ongoing section only
const OngoingTableWrapper = styled(TableWrapper)`
  min-height: 250px !important; // adjust height as needed
  overflow-y: auto;
`;


// ========================================================================
//  YOUR REACT COMPONENT
// ========================================================================

const Appointments = () => {
  const [ongoingAppointments, setOngoingAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [cancellingIds, setCancellingIds] = useState([]);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

  const doctorId = localStorage.getItem("doctorId");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/appointments/doctor/${doctorId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`
          }
        }
        );
        setOngoingAppointments(response.data.ongoing || []);
        setUpcomingAppointments(response.data.upcoming || []);
        setPastAppointments(response.data.past || []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchAppointments();
    }
  }, [doctorId]);

  const handleAction = async (appointment, action) => {
    const appointmentId = appointment._id;

    if (action === "cancel") {
      try {
        setCancellingIds((prev) => [...prev, appointmentId]);
        await axios.patch(`${API_BASE_URL}/api/appointments/${appointmentId}/cancel`);
        setOngoingAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentId ? { ...appt, status: "cancelled" } : appt
          )
        );
        setUpcomingAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentId ? { ...appt, status: "cancelled" } : appt
          )
        );
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        alert("Failed to cancel appointment.");
      } finally {
        setCancellingIds((prev) => prev.filter((id) => id !== appointmentId));
      }
    } else if (action === "completed") {
      try {
        await axios.patch(`${API_BASE_URL}/api/appointments/${appointmentId}/complete`);
        setOngoingAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentId ? { ...appt, status: "completed" } : appt
          )
        );
        setUpcomingAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentId ? { ...appt, status: "completed" } : appt
          )
        );
      } catch (error) {
        console.error("Error completing appointment:", error);
        alert("Failed to mark appointment as completed.");
      }
    } else if (action === "join") {
      if (appointment.jitsiLink) {
        window.open(appointment.jitsiLink, "_blank");
      } else {
        alert("Jitsi link not available.");
      }
    }
  };



  const filterData = (appointments) =>
    appointments.filter((appointment) => {
      const user = appointment.userId || {};
      const matchesSearch =
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment._id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = filterDate ? appointment.date === filterDate : true;

      return matchesSearch && matchesDate;
    });

  const paginateData = (data, page) => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return data.slice(startIndex, startIndex + PAGE_SIZE);
  };

  // --- renderTable function (uses StyledTable) ---
  const renderTable = (appointments, showCancel = false) => (
    <StyledTable>
      <thead>
        <tr>
          <th>Full Name</th>
          <th>Phone</th>
          <th>Date</th>
          <th>Time</th>
          <th>Type</th>
          <th>Amount</th>
          {showCancel && <th>Action</th>}
        </tr>
      </thead>
      <tbody>
        {appointments.length > 0 ? (
          appointments.map((appt) => {
            const user = appt.userId || {};
            const isCancelling = cancellingIds.includes(appt._id);
            return (
              <tr key={appt._id}>
                <td>{user.full_name || "N/A"}</td>
                <td>{user.phone_number || "N/A"}</td>
                <td>{appt.date || "—"}</td>
                <td>{appt.time || "—"}</td>
                <td className="capitalize">{appt.type || "—"}</td>
                <td>₹{appt.amount || 0}</td>
                <td>
                  <Select
                    options={[
                      { value: "join", label: "Join", color: "#4CAF50" },
                      { value: "cancel", label: "Cancel", color: "#F44336" },
                      { value: "completed", label: "Completed", color: "#2196F3" },
                    ]}

                    defaultValue={{
                      value: appt.status,
                      label:
                        appt.status?.charAt(0).toUpperCase() +
                        appt.status?.slice(1).toLowerCase(),
                      color: getStatusColor(appt.status),
                    }}
                    onChange={(opt) => handleAction(appt, opt.value)}
                    isDisabled={
                      appt.status === "cancelled" ||
                      appt.status === "completed" ||
                      isCancelling
                    }
                    isSearchable={false}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: getStatusColor(state?.selectProps?.value?.value || appt.status),
                        color: "white",
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "none",
                        minWidth: 130,
                        "&:hover": { cursor: "pointer" },
                      }),
                      singleValue: (base, state) => ({
                        ...base,
                        color: "white",
                        fontWeight: 500,
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: "#fff",
                        borderRadius: 8,
                        overflow: "hidden",
                        zIndex: 5,
                      }),
                      option: (base, { data, isFocused }) => ({
                        ...base,
                        backgroundColor: isFocused ? data.color : "#fff",
                        color: isFocused ? "white" : data.color,
                        fontWeight: 500,
                        cursor: "pointer",
                      }),
                      dropdownIndicator: (base) => ({
                        ...base,
                        color: "white",
                      }),
                      indicatorSeparator: () => ({ display: "none" }),
                    }} />
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={showCancel ? 7 : 6} className="no-data">
              No appointments found.
            </td>
          </tr>
        )}
      </tbody>
    </StyledTable>
  );

  // --- renderPagination (simpler, styles are in PaginationControls) ---
  const renderPagination = (currentPage, setPage, totalItems) => {
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);

    return (
      <PaginationControls>
        <Button
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </Button>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <Button
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </Button>
      </PaginationControls>
    );
  };

  useEffect(() => {
    setUpcomingPage(1);
    setPastPage(1);
  }, [searchTerm, filterDate]);

  const filteredUpcoming = filterData(upcomingAppointments);
  const paginatedUpcoming = paginateData(filteredUpcoming, upcomingPage);

  useEffect(() => {
    if (!doctorId) {
      console.log("🚫 No doctorId, skipping socket connection");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/appointments/doctor/${doctorId}`
        );
        setOngoingAppointments(response.data.ongoing || []);
        setUpcomingAppointments(response.data.upcoming || []);
        setPastAppointments(response.data.past || []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };


    console.log("🔌 Initializing socket connection for doctor id:", doctorId);

    // Join doctor's personal room
    console.log("➡️ Emitting joinDoctorRoom event");
    // 
    socket.emit("joinDoctorRoom", doctorId);


    // Listen for real-time updates
    const onUpdated = (updatedAppointment) => {
      console.log("📡 Received appointmentUpdated event:", updatedAppointment);
      fetchAppointments();

      // // Check if this appointment already exists in upcomingAppointments
      // setUpcomingAppointments((prev) => {
      //   const exists = prev.some((appt) => appt._id === updatedAppointment._id);
      //   if (exists) {
      //     // Update existing appointment
      //     return prev.map((appt) =>
      //       appt._id === updatedAppointment._id ? updatedAppointment : appt
      //     );
      //   } else {
      //     // Add new appointment (always upcoming)
      //     return [updatedAppointment, ...prev];
      //   }
      // });

      // // Also update ongoingAppointments if it exists there
      // setOngoingAppointments((prev) =>
      //   prev.map((appt) =>
      //     appt._id === updatedAppointment._id ? updatedAppointment : appt
      //   )
      // );
    };


    const onDeleted = (deletedId) => {
      console.log("🗑 Received appointmentDeleted event for id:", deletedId);
      fetchAppointments();
      // setOngoingAppointments((prev) => prev.filter((appt) => appt._id !== deletedId));
      // setUpcomingAppointments((prev) => prev.filter((appt) => appt._id !== deletedId));
    };

    socket.on("appointmentUpdated", onUpdated);
    socket.on("appointmentDeleted", onDeleted);

    // Listen to connection/disconnection
    // socket.on("connect", () => {
    //   console.log("✅ Socket connected with id:", socket.id);
    // });

    // socket.on("disconnect", (reason) => {
    //   console.log("⚠️ Socket disconnected:", reason);
    // });

    // socket.on("connect_error", (err) => {
    //   console.error("❌ Socket connection error:", err);
    // });

    // Cleanup
    return () => {
      console.log("🧹 Cleaning up socket listeners");
      socket.off("appointmentUpdated", onUpdated);
      socket.off("appointmentDeleted", onDeleted);
      // socket.off("connect");
      // socket.off("disconnect");
      // socket.off("connect_error");
    };
  }, [doctorId]);

  //   useEffect(() => {
  //   if (!doctorId) return;
  //   console.log("In socket connetion for doctor id",doctorId)

  //   // Join doctor's personal room
  //   socket.emit("joinDoctorRoom", doctorId);

  //   // Listen for real-time updates
  //   socket.on("appointmentUpdated", (updatedAppointment) => {
  //     setOngoingAppointments((prev) =>
  //       prev.map((appt) =>
  //         appt._id === updatedAppointment._id ? updatedAppointment : appt
  //       )
  //     );
  //     setUpcomingAppointments((prev) =>
  //       prev.map((appt) =>
  //         appt._id === updatedAppointment._id ? updatedAppointment : appt
  //       )
  //     );
  //   });

  //   socket.on("appointmentDeleted", (deletedId) => {
  //     setOngoingAppointments((prev) =>
  //       prev.filter((appt) => appt._id !== deletedId)
  //     );
  //     setUpcomingAppointments((prev) =>
  //       prev.filter((appt) => appt._id !== deletedId)
  //     );
  //   });

  //   // Cleanup
  //   return () => {
  //     socket.off("appointmentUpdated");
  //     socket.off("appointmentDeleted");
  //   };
  // }, [doctorId]);

  // --- Main component render (uses styled components) ---
  return (
    <>
      {/* No <style> tag needed! */}
      <Container>
        <h3>Appointments</h3>

        <ControlsContainer>
          <StyledInput
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <StyledInput
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <Button
              variant="danger"
              onClick={() => setFilterDate("")}
              title="Clear Date Filter"
            >
              Clear Date
            </Button>
          )}
        </ControlsContainer>

        <AppointmentSection>
          <SectionTitle>Ongoing</SectionTitle>
          <OngoingTableWrapper>
            {/* <TableWrapper> */}
            {loading ? <p>Loading...</p> : renderTable(ongoingAppointments, true)}
            {/* </TableWrapper> */}
          </OngoingTableWrapper>
        </AppointmentSection>

        <AppointmentSection>
          <SectionTitle>Upcoming</SectionTitle>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <TableWrapper>
                {renderTable(paginatedUpcoming, true)}
              </TableWrapper>
              {renderPagination(
                upcomingPage,
                setUpcomingPage,
                filteredUpcoming.length
              )}
            </>
          )}
        </AppointmentSection>
      </Container>
    </>
  );
};

export default Appointments;
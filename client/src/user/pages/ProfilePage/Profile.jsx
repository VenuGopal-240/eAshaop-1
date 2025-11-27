
import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button, Badge } from "react-bootstrap";
import Boy from "../../assets/user.png";
import styles from "../../pages/ProfilePage/Profile.module.css";
import { API_BASE_URL } from "../../../api-config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoaderOverlay from "../../../commonComponents/FadeLoader";
import ProfileImageCropper from "./ImageCrop";
import { saveUserDetails, userDetails } from "../../../Util/apiRequest";

function useIsMobileOrTablet() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobileOrTablet(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobileOrTablet;
}

export default function UserDetailsPanel() {
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    gender: "",
    aadhaar_number: "",
    address: "",
    language_preferred: "",
    height: "",
    weight: "",
    health_conditions: [],
    age: "",
  });

  const [profileImage, setProfileImage] = useState(Boy);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const isMobileOrTablet = useIsMobileOrTablet();
  const refs = Array.from({ length: 9 }, () => useRef(null));
  const [healthTags, setHealthTags] = useState([]);


  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    if (isNaN(birthDate)) return ""; // ✅ Prevents NaN if invalid date
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--; // birthday hasn't occurred yet this year
    }
    return age;
  };


  // ✅ Fetch user data from backend
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.id) return;
    userDetails(storedUser.id)
      // fetch(`${API_BASE_URL}/api/user/${storedUser.id}`)
      //   .then((res) => res.json())
      .then((data) => {
        console.log("User data from API:", data.user);  // ✅ Add this
        console.log("DOB from backend:", data.user?.dob); // ✅ Add this

        if (data?.user) {
          const calculatedAge = calculateAge(data.user.dob);
          console.log("Calculated age:", calculatedAge);
          setFormData((prev) => ({ ...prev, ...data.user, age: calculatedAge, }));
          setHealthTags(data.user.health_conditions || []);
          if (data.user.profileImage?.cloudinaryUrl) {
            setProfileImage(data.user.profileImage.cloudinaryUrl);
          }
        }
      })
      .catch((err) => console.error("Error fetching user:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageClick = () => fileInputRef.current?.click();
  const handleEnterKey = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextField = refs[index + 1]?.current;
      if (nextField) nextField.focus();
    }
  };

  const handleSave = async () => {

    // ✅ Frontend validations
    if (formData.address.trim().length < 3) {
      toast.error("Address must be at least 3 characters.");
      return;
    }
    if (!formData.gender) {
      toast.error("Please select a gender.");
      return;
    }
    if (formData.height && (formData.height < 20 || formData.height > 400)) {
      toast.error("Height must be between 20 and 400 cm.");
      return;
    }
    if (formData.weight && (formData.weight < 1 || formData.weight > 500)) {
      toast.error("Weight must be between 1 and 500 kg.");
      return;
    }
    if (formData.aadhaar_number && !/^\d{12}$/.test(formData.aadhaar_number)) {
      toast.error("Aadhaar number must be 12 digits.");
      return;
    }
    if (!formData.language_preferred) {
      toast.error("Please select a preferred language.");
      return;
    }

    setLoading(true);

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const payload = {
        address: formData.address,
        language_preferred: formData.language_preferred,
        height: formData.height,
        weight: formData.weight,
        health_conditions: healthTags,
        gender: formData.gender,
        aadhaar_number: formData.aadhaar_number,
      };

      try {
        await saveUserDetails(storedUser.id, payload);
        toast.success("Profile updated successfully!");
      } catch (err) {
        toast.error(err.data?.message || err.message || "Update failed");
      }

    } catch (error) {
      console.error("Update error:", error);
      toast.error("Something went wrong while updating profile.");
    } finally {
      setLoading(false); // 👈 Hide loader
    }
  };
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const storedUser = JSON.parse(localStorage.getItem("user"));

    const formDataObj = new FormData();
    formDataObj.append("profileImage", file);

    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/api/user/update-profile-image/${storedUser.id}`, // ✅ PUT route
        {
          method: "PUT",
          body: formDataObj,
        }
      );
      if (!res.ok) throw new Error("Failed to upload image");
      const data = await res.json();
      setProfileImage(data.imageUrl); // ✅ update state

      const updatedUser = { ...storedUser, profileImage: { cloudinaryUrl: data.imageUrl } };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile image updated successfully!"); // ✅ better UX

    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Image upload failed!");
    } finally {
      setLoading(false); // 👈 hide loader
    }
  };


  const handleAddHealthTag = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      e.preventDefault();
      setHealthTags([...healthTags, e.target.value.trim()]);
      e.target.value = "";
    }
  };

  const handleRemoveHealthTag = (index) => {
    setHealthTags(healthTags.filter((_, i) => i !== index));
  };



  if (loading) return <LoaderOverlay loading={true} />;
  return (
    <>
      <LoaderOverlay loading={loading} />

      <Container
        fluid
        className="px-3 px-md-5"
        style={{
          fontFamily: "Urbanist, sans-serif",
          paddingRight: "0px",
          // marginTop: "20px",
          marginBottom: "30px"
        }}
      >
        <Row className={`${styles.rowContainer}`}>
          <Col md={{ span: 9, offset: 3 }} className={` ${styles.colContainer} pt-[6.5rem]`}>

            {/* ✅ Mobile & Tablet Profile Image with Change Photo */}
            {/* {isMobileOrTablet && (
              <div
                className="d-flex justify-content-end align-items-end mb-1 px-2"
                style={{ marginTop: "-20px", paddingLeft: "0px" }}
              >
                <div
                  className="rounded-circle border d-flex align-items-center justify-content-center"
                  style={{ width: 72, height: 72 }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      overflow: "hidden",
                    }}
                  >
                   
                    <img
                      src={profileImage}
                      alt="Profile Icon"
                      width={72}
                      height={72}
                      style={{ display: "block", objectFit: "cover" }}
                    />

                   
                    <div
                      onClick={handleImageClick}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        height: "50%",
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        color: "#fff",
                        fontWeight: "500",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Change photo
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>
              </div>
            )} */}
            {isMobileOrTablet && (
              <ProfileImageCropper />
              // <div
              //   className="d-flex justify-content-center align-items-center"
              // >
              //   <div
              //     className="rounded-circle border d-flex align-items-center justify-content-center"
              //     style={{ width: 72, height: 72 }}
              //   >
              //     <div
              //       style={{
              //         position: "relative",
              //         width: "72px",
              //         height: "72px",
              //         borderRadius: "50%",
              //         overflow: "hidden",
              //       }}
              //     >

              //       <img
              //         src={profileImage}
              //         alt="Profile Icon"
              //         width={72}
              //         height={72}
              //         style={{ display: "block", objectFit: "cover" }}
              //       />
              //       <div
              //         onClick={handleImageClick}
              //         style={{
              //           position: "absolute",
              //           bottom: 0,
              //           left: 0,
              //           width: "100%",
              //           height: "50%",
              //           backgroundColor: "rgba(0, 0, 0, 0.2)",
              //           display: "flex",
              //           alignItems: "center",
              //           justifyContent: "center",
              //           fontSize: "10px",
              //           color: "#fff",
              //           fontWeight: "500",
              //           textDecoration: "underline",
              //           cursor: "pointer",
              //         }}
              //       >
              //         Change photo
              //       </div>
              //       <input
              //         type="file"
              //         accept="image/*"
              //         ref={fileInputRef}
              //         onChange={handleImageChange}
              //         style={{ display: "none" }}
              //       />
              //     </div>
              //   </div>
              // </div>
            )}


            {/* ✅ Desktop Save button - hide on mobile/tablet */}
            {/* {!isMobileOrTablet && (
              <div className="d-flex justify-content-end mb-3">
                <Button
                  className="rounded-pill px-4"
                  style={{
                    backgroundColor: "#00A99D",
                    border: "none",
                    height: "37px",
                  }}
                  onClick={handleSave}   // ✅ Add this

                >
                  Save Changes
                </Button>
              </div>
            )} */}

            {!isMobileOrTablet && (
              <ProfileImageCropper />
              // <div
              //   className="d-flex justify-content-center align-items-center"
              // // style={{ minHeight: "100vh" }} // makes it take full page height
              // >
              //   <div className="d-flex align-items-center">
              //     <div
              //       className="rounded-circle border d-flex align-items-center justify-content-center"
              //       style={{
              //         width: 88,
              //         height: 80,
              //         backgroundColor: "#F8F8F8",
              //         overflow: "hidden",
              //         cursor: "pointer",
              //       }}
              //       onClick={handleImageClick}
              //     >
              //       <img
              //         src={profileImage}
              //         alt="User Icon"
              //         style={{ width: "100%", height: "100%", objectFit: "cover" }}
              //       />
              //     </div>

              //     <input
              //       type="file"
              //       accept="image/*"
              //       ref={fileInputRef}
              //       onChange={handleImageChange}
              //       style={{ display: "none" }}
              //     />
              //   </div>
              // </div>
            )}


            {/* ✅ Form starts */}
            <Form>
              <div className="d-flex flex-md-row align-items-md-center mb-4" style={{ paddingleft: "40px" }}>
                {/* Desktop profile image - hide on mobile/tablet */}


                <div className="ms-md-4 w-96 mt-3 mt-md-0">
                  <Row>
                    <Col xs={8} md={4} className="mb-3">
                      <Form.Label className="mb-1">Full Name</Form.Label>
                      <Form.Control
                        className="rounded-pill"
                        value={formData.full_name}
                        readOnly
                        style={{ height: "48px" }}
                        ref={refs[0]}
                        onKeyDown={(e) => handleEnterKey(e, 0)}
                      />
                    </Col>
                    <Col xs={4} md={4} className="mb-3">
                      <Form.Label className="mb-1">Age</Form.Label>
                      <Form.Control
                        className="rounded-pill"
                        value={formData.age || ""}
                        readOnly
                        style={{ height: "48px" }}
                        ref={refs[1]}
                        onKeyDown={(e) => handleEnterKey(e, 1)}
                      />
                    </Col>
                    <Col xs={12} md={4} className="mb-3">
                      <Form.Label className="mb-1">Gender</Form.Label>
                      <div
                        className="d-flex rounded-pill border overflow-hidden w-100"
                        style={{ height: "48px" }}
                      >
                        {["Male", "Female", "Others"].map((g) => (
                          <Button
                            key={g}
                            variant="light"
                            // onClick={() => setGender(g)}
                            onClick={() => handleChange("gender", g)}
                            style={{
                              backgroundColor:
                                formData.gender.toLowerCase() === g.toLowerCase() ? "#00A99D" : "white",
                              color: formData.gender.toLowerCase() === g.toLowerCase() ? "white" : "#252525",


                              //  backgroundColor: formData.gender === g.toLowerCase() ? "#00A99D" : "white",
                              //  color: formData.gender === g.toLowerCase() ? "white" : "#252525",
                              border: "none",
                              flex: 1,
                              fontWeight: "500",
                              borderRadius: "28px",
                            }}
                          >
                            {g}
                          </Button>
                        ))}
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>

              {/* More form fields */}
              <Row className="mb-4">
                <Col xs={12} md={4} className="mb-3">
                  <Form.Label className="mb-1">Phone Number</Form.Label>
                  <Form.Control
                    placeholder="+91"
                    className="rounded-pill"
                    value={formData.phone_number}
                    readOnly
                    style={{ height: "48px" }}
                    ref={refs[2]}
                    onKeyDown={(e) => handleEnterKey(e, 2)}
                  />
                </Col>
                <Col xs={12} md={4} className="mb-3">
                  <Form.Label className="mb-1">Aadhaar Number</Form.Label>
                  <Form.Control
                    value={formData.aadhaar_number}
                    onChange={(e) => handleChange("aadhaar_number", e.target.value)}
                    className="rounded-pill"
                    style={{ height: "48px" }}
                    ref={refs[3]}
                    onKeyDown={(e) => handleEnterKey(e, 3)}
                  />
                </Col>
                <Col xs={12} md={4} className="mb-3">
                  <Form.Label className="mb-1">Address</Form.Label>
                  <Form.Control
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="rounded-pill"
                    style={{ height: "48px" }}
                    ref={refs[4]}
                    onKeyDown={(e) => handleEnterKey(e, 4)}
                  />
                </Col>
              </Row>

              <Row className="mb-4">
                <Col xs={12} md={4} className="mb-3">
                  <Form.Label className="mb-1">Language Preferred</Form.Label>
                  <Form.Select
                    value={formData.language_preferred}
                    onChange={(e) => handleChange("language_preferred", e.target.value)}
                    className="rounded-pill"
                    style={{ height: "48px" }}
                    ref={refs[5]}
                    onKeyDown={(e) => handleEnterKey(e, 5)}
                  >
                    <option value="">Select Language</option>
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Telugu</option>
                  </Form.Select>
                </Col>
              </Row>

              <h5 className="mb-3 mt-4">Personal Information</h5>
              <Row className="mb-4">
                <Col xs={6} md={4} className="mb-3">
                  <Form.Label className="mb-1">Height</Form.Label>
                  <Form.Control
                    value={formData.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                    className="rounded-pill"
                    style={{ height: "48px" }}
                    ref={refs[6]}
                    onKeyDown={(e) => handleEnterKey(e, 6)}
                    placeholder="in cms"
                  />
                </Col>
                <Col xs={6} md={4} className="mb-3">
                  <Form.Label className="mb-1">Weight</Form.Label>
                  <Form.Control
                    value={formData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    className="rounded-pill"
                    style={{ height: "48px" }}
                    ref={refs[7]}
                    onKeyDown={(e) => handleEnterKey(e, 7)}
                    placeholder="in kgs"
                  />
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="mb-1">Existing Health Conditions</Form.Label>
                <Form.Control
                  className="rounded-pill"
                  placeholder="e.g. BP, measles, influenza"
                  style={{ width: "100%", maxWidth: "470px", height: "48px" }}
                  ref={refs[8]}
                  onKeyDown={handleAddHealthTag}
                />
                <div className={` ${styles.healthtagsContainer} d-flex gap-2 mt-3 flex-wrap justify-content-start`}>
                  {healthTags.map((tag, index) => (
                    <Badge
                      key={index}
                      bg="none"
                      text="dark"
                      className="rounded-pill px-3 py-3 border"
                      style={{
                        minWidth: "110px",
                        height: "48px",
                        fontWeight: 400,
                        fontSize: "16px",
                        backgroundColor: "#F0F0F0",
                      }}
                    >
                      {tag}{" "}
                      <span
                        style={{ cursor: "pointer", marginLeft: 8 }}
                        onClick={() => handleRemoveHealthTag(index)}
                      >
                        ✕
                      </span>
                    </Badge>
                  ))}
                  {!isMobileOrTablet && (
                    <div className="d-flex justify-content-end mb-3">
                      <Button
                        className="rounded-pill px-4"
                        style={{
                          backgroundColor: "#00A99D",
                          border: "none",
                          height: "37px",
                        }}
                        onClick={handleSave}   // ✅ Add this

                      >
                        Save Changes
                      </Button>
                    </div>
                  )}

                </div>

              </Form.Group>

              {/* Mobile/Tablet Save Button */}
              {isMobileOrTablet && (
                <div className="text-center mt-4">
                  <Button
                    className={`${styles.btnIcon} rounded-pill px-3`}
                    style={{
                      backgroundColor: "#00A99D",
                      border: "none",
                      height: "58px",
                      width: "307px",
                    }}
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </Form>

          </Col>
        </Row>
      </Container>
    </>
  );
}

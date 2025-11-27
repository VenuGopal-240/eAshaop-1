import React, { useState, useRef, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./CropImage"
import { API_BASE_URL } from "../../../api-config";
import { toast } from "react-toastify";
import LoaderOverlay from "../../../commonComponents/FadeLoader";
import { Button } from "@mui/material";
import { userDetails } from "../../../Util/apiRequest";

const ProfileImageCropper = () => {
  const [profileImage, setProfileImage] = useState();
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    if (isNaN(birthDate)) return "";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.id) return;

    userDetails(storedUser.id)
      // fetch(`${API_BASE_URL}/api/user/${storedUser.id}`)
      //   .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          const calculatedAge = calculateAge(data.user.dob);
          console.log("Calculated age:", calculatedAge);
          // setFormData((prev) => ({ ...prev, ...data.user, age: calculatedAge, }));
          // setHealthTags(data.user.health_conditions || []);
          if (data.user.profileImage?.cloudinaryUrl) {
            setProfileImage(data.user.profileImage.cloudinaryUrl);
          }
        }
      })
      .catch((err) => console.error("Error fetching user:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleImageClick = () => fileInputRef.current?.click();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(selectedImage, croppedAreaPixels);

      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const file = new File([blob], "cropped_profile.jpg", { type: blob.type });

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const formDataObj = new FormData();
      formDataObj.append("profileImage", file);

      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/api/user/update-profile-image/${storedUser.id}`,
          {
            method: "PUT",
            body: formDataObj,
            "authorization": `Bearer ${localStorage.getItem("authToken")}`
          }
        );

        if (!res.ok) throw new Error("Failed to upload image");

        const data = await res.json();
        setProfileImage(data.imageUrl);

        const updatedUser = {
          ...storedUser,
          profileImage: { cloudinaryUrl: data.imageUrl },
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast.success("Profile image updated successfully!");
      } catch (err) {
        console.error("Image upload error:", err);
        toast.error("Image upload failed!");
      } finally {
        setLoading(false);
      }

      setShowCropper(false);
    } catch (e) {
      console.error("Crop error:", e);
    }
  };


  const handleCancel = () => {
    setShowCropper(false);
    setSelectedImage(null);
  };
  if (loading) return <LoaderOverlay loading={true} />;
  return (
    <>
      <LoaderOverlay loading={loading} />
      <div className="d-flex justify-content-center align-items-center">
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

        {showCropper && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "300px",
                height: "300px",
                background: "#333",
              }}
            >
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              style={{
                width: "50%",
                marginTop: 16,
                cursor: "pointer",
              }}
            />

            <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Save
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </>

  );
};

export default ProfileImageCropper;

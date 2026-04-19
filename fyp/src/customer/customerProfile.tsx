import { useState } from "react";
import "./customerProfile.css";

const CustomerProfile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateMalaysiaPhone = (phone: string) => {
    return /^(\+60|60|0)1[0-9]{8,9}$/.test(phone);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = () => {
    setError("");
  
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
  
    if (!validateEmail(email)) {
      setError("Invalid email format.");
      return;
    }
  
    if (phone && !validateMalaysiaPhone(phone)) {
      setError("Invalid Malaysia phone number.");
      return;
    }
  
    alert("Profile saved!");
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure to delete profile?")) {
      alert("Profile deleted");
    }
  };

  return (
    <div className="profile-container">
      <h1>Profile</h1>

      <div className="image-section">
        <div className="profile-image">
          {image ? <img src={image} alt="profile" /> : <span>👤</span>}
        </div>

        <label className="image-btn">
          Change image
          <input type="file" hidden onChange={handleImageChange} />
        </label>
      </div>

      <div className="form-section">
        <div className="form-row">
          <label>Name</label>
          {/* <div> */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          {/* </div> */}
        </div>

        <div className="form-row">
          <label>Email</label>
          {/* <div> */}
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          {/* </div> */}
        </div>

        <div className="form-row">
          <label>Phone number</label>
          {/* <div> */}
            <span>+60</span>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="123456789"
            />
          {/* </div> */}
        </div>

        <div className="form-row">
          <label>Gender</label>
          {/* <div className="gender-options"> */}
            {["Male", "Female", "Prefer not to say"].map((g) => (
              <button
                key={g}
                className={gender === g ? "active" : ""}
                onClick={() => setGender(g)}
              >
                {g}
              </button>
            ))}
          {/* </div> */}
        </div>

      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="button-group">
        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
        <button className="delete-btn" onClick={handleDelete}>
          Delete
        </button>
      </div>

    </div>
  );
};

export default CustomerProfile;
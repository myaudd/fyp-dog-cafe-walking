import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./customerProfile.css";

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [customerID, setCustomerID] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
  
    if (!storedUser) return;
  
    const user = JSON.parse(storedUser);
  
    if (user.role !== "customer") return;
  
    const customer = user.data;
  
    setCustomerID(customer.customerid);
    setName(customer.customername || "");
    setEmail(customer.customeremail || "");
    setPhone(customer.customerphonenumber || "");
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateMalaysiaPhone = (phone: string) => {
    return /^1[0-9]{8,9}$/.test(phone);
  };

  const handleSave = async () => {
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

    const { error } = await supabase
      .from("customer")
      .update({
        customername: name,
        customeremail: email,
        customerphonenumber: phone,
      })
      .eq("customerid", customerID);

    if (error) {
      console.error(error);
      setError("Failed to update profile.");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);

      user.data.customername = name;
      user.data.customeremail = email;
      user.data.customerphonenumber = phone;

      localStorage.setItem("user", JSON.stringify(user));
    }

    alert("Profile saved!");
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure to delete profile?")) return;

    const { error } = await supabase
      .from("customer")
      .delete()
      .eq("customerid", customerID);

    if (error) {
      console.error(error);
      return;
    }

    alert("Profile deleted");
    navigate("/");
  };

  return (
    <div className="profile-container">
      <h1>Profile</h1>

      <div className="form-group">
        <div className="form-row">
          <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
        </div>

        <div className="form-row">
          <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
        </div>

        <div className="form-row">
          <label>Phone number</label>
            <span>+60</span>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="123456789"
            />
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
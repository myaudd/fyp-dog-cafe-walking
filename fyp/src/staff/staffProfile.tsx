import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const StaffProfile = () => {
    const navigate = useNavigate();
    const [staffID, setStaffID] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
  
        if (!storedUser) return;
    
        const user = JSON.parse(storedUser);
    
        if (user.role !== "staff") return;
    
        const staff = user.data;

        setStaffID(staff.staffid);
        setName(staff.staffname || "");
        setEmail(staff.staffemail || "");
    }, []);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
        
        const { error } = await supabase
          .from("staff")
          .update({
            staffname: name,
            staffemail: email,
          })
          .eq("staffid", staffID);
    
        if (error) {
          console.error(error);
          setError("Failed to update profile.");
          return;
        }
    
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
    
          user.data.satffname = name;
          user.data.staffemail = email;
    
          localStorage.setItem("user", JSON.stringify(user));
        }
    
        alert("Profile saved!");
      };
    
    return (
        <div className="container">
            <h1>Profile</h1>

            <div className="form">
                <div className="detail">
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="detail">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                
                {error && <p className="error-text">{error}</p>}

                <div className="button">
                    <button className="save-btn" onClick={handleSave}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaffProfile;
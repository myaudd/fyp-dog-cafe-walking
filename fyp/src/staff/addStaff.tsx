import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const AddStaff = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Staff");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      };
    
      const handleSubmit = async () => {
        setError("");

        if (!name || !email || !password || !role) {
            setError("All fields are required");
            return;
        }

        if (!validateEmail(email)) {
            setError("Invalid email format");
            return;
        } 

        try {
            const {error} = await supabase
                .from("staff")
                .insert([
                    {
                        staffname: name,
                        staffemail: email,
                        staffpassword: password,
                        staffrole: role,
                    },
                ]);

            if (error) {
                setError(error.message);
                return;
            }
            alert("Staff added successfully");
            navigate("/staff/staffManageProfile");
        } catch (err) {
            setError("Something went wrong");
        }
    };

    return (
        <div className="container">
            <h1>Add a New Staff</h1>
  
            <div className="form-group">
                <label>Name</label>
                <input
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
  
                <label>Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
  
                <label>Password</label>
                <input
                    type="password"
                    placeholder="Enter pasword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <label>Role</label>
                <select className="role-option"
                    value={role}
                    onChange={(e) =>
                        setRole(e.target.value as "Staff" | "Manager")
                    }
                >
                    <option value="Staff">Staff</option>
                    <option value="Manager">Manager</option>
                </select>
                
                {error && <p className="error-text">{error}</p>}
        
                <button className="add-button" onClick={handleSubmit}>
                    Add
                </button>
            </div>
        </div>
    );
};

export default AddStaff;
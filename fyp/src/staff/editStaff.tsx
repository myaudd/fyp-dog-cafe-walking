import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const EditStaff = () => {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const [staffID, setStaffID] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("S");
    const [error, setError] = useState("");

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    useEffect(() => {
        const fetchStaff = async () => {
            if (!id) return;
            const { data, error } = await supabase
                .from("staff")
                .select(`
                    staffid,
                    staffname,
                    staffemail,
                    staffpassword,
                    staffrole
                `)
                .eq("staffid", id)
                .single();
            if (error) {
                console.error(error);
                return;
            }
            setStaffID(data.staffid);
            setName(data.staffname);
            setEmail(data.staffemail);
            setPassword(data.staffpassword);
            setRole(data.staffrole);
        };
        fetchStaff();
    }, [id]);

    const handleSave = async () => {
        setError("");
    
        if (!name || !email || !password || !role) {
            setError("All fields are required.");
            return;
        }
    
        if (!validateEmail(email)) {
            setError("Invalid email format");
            return;
        }
        
        const { error } = await supabase
            .from("staff")
            .update({
                staffname: name,
                staffemail: email,
                staffpassword: password,
                staffrole: role,
            })
          .eq("staffid", staffID);
    
        if (error) {
          console.error(error);
          setError("Failed to update profile.");
          return;
        }
    
        alert("Profile saved!");
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure to delete profile?")) return;
    
        const { error } = await supabase
          .from("staff")
          .delete()
          .eq("staffid", staffID);
    
        if (error) {
          console.error(error);
          return;
        }
    
        alert("Profile deleted");
        navigate("/staff/staffManageProfile");
    };    

    return (
        <div className="container">
            <h1>Add a New Staff</h1>
  
            <div className="form-group">
                <label>Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
  
                <label>Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
  
                <label>Password</label>
                <input
                    type="password"
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
                    
                <div className="button-group">
                    <button className="save-button" onClick={handleSave}>
                        Save
                    </button>
                    <button className="delete-button" onClick={handleDelete}>
                        Delete 
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditStaff;
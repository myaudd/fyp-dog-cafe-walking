import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");

    if (!username || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      const { data: customer} = await supabase
        .from("customer")
        .select("*")
        .eq("customername", username)
        .maybeSingle();
  
      if(customer) {
        if (customer.customerpassword !== password) {
          setError("Incorrect password.");
          return;
        }

        const user = {
          role: "customer",
          data: customer
        };

        localStorage.setItem("user", JSON.stringify(user));

        alert("Customer log in successful!");

        navigate("/customer/customerHome");
        return;
      }

      const { data: staff} = await supabase
        .from("staff")
        .select("*")
        .eq("staffname", username)
        .maybeSingle();

      if (staff) {
        if (staff.staffpassword !== password) {
          setError("Incorrect password.");
          return;
        }

        const user = {
          role: "staff",
          data: staff
        };

        localStorage.setItem("user", JSON.stringify(user));

        alert("Staff log in successful!");

        navigate("/staff/staffHome");
        return;
      }

      setError("User not found.");

    } catch (err) {
      setError("Something went wrong.");
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      
      <div className="form-group">
        <label>Username</label>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <button className="login-button" onClick={handleSubmit}>
        Log in
      </button>
    </div>
  );
};

export default Login;
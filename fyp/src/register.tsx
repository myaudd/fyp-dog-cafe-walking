import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "./supabaseClient";
import "./register.css";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    setError("");

    if (!username || !email || !password) {
      setError("All fields are required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Invalid email format.");
      return;
    }

    try {
      const { error } = await supabase
        .from("customer")
        .insert([
          {
            customername: username,
            customeremail: email,
            customerpassword: password,
          },
        ]); //an array with one object (row)

      if (error) {
        if (error.message.includes("customername")) {
          setError("Username already taken.");
        } else {
          setError(error.message);
        }
        return;
      }
      
      alert("Registration successful!");
      navigate("/");
    } catch (err) {
      setError("Something went wrong.");
    }
  };

  return (
    <div className="register-container">
      <h1>Register</h1>

      <div className="form-group">
        <label>Username</label>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <button className="register-button" onClick={handleSubmit}>
        Create an account
      </button>
    </div>
  );
};

export default Register;
import { Routes, Route, useNavigate } from "react-router-dom";
import './App.css'
import Login from "./login";
import Register from "./register";
import CustomerHome from "./customer/customerHome";
import CustomerProfile from "./customer/customerProfile";
import ResidentDogProfile from "./customer/residentDogProfile";
import BookResidentDog from "./customer/bookResidentDog";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Welcome to Dog Café Walking Management System!</h1>

      <div className="button-container">
        <button onClick={() => navigate("/login")}>
          Log In
        </button>

        <button onClick={() => navigate("/register")}>
          Register
        </button>
      </div>
    </div>
  );
};


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/customer/customerHome" element={<CustomerHome />} />
      <Route path="/customer/customerProfile" element={<CustomerProfile />} />
      <Route path="/dog/:dogId" element={<ResidentDogProfile />} />
      <Route path="/bookResidentDog/:dogId" element={<BookResidentDog />} />
    </Routes>
  );
}

export default App;

import { Routes, Route, useNavigate } from "react-router-dom"; //to navigate user between pages
import './App.css'
import Login from "./login";
import Register from "./register";
import CustomerHome from "./customer/customerHome";
import CustomerProfile from "./customer/customerProfile";
import ResidentDogProfile from "./customer/residentDogProfile";
import BookResidentDog from "./customer/bookResidentDog";
import AvailableStaff from "./customer/availableStaff";
import BookStaff from "./customer/bookStaff";
import CustomerBookingRecord from "./customer/customerBookingRecord";
import CustomerWalkingRecord from "./customer/customerWalkingRecord";
import CustomerWalkingDetail from "./customer/customerWalkingDetail";
import StaffHome from "./staff/staffHome";
import StaffAssignedTimer from "./staff/staffAssignedTimer";
import StaffProfile from "./staff/staffProfile";
import StaffManageBooking from "./staff/staffManageBooking";

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
      {/* browser url, display element */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/customer/customerHome" element={<CustomerHome />} />
      <Route path="/customer/customerProfile" element={<CustomerProfile />} />
      <Route path="/dog/:dogId" element={<ResidentDogProfile />} />
      <Route path="/bookResidentDog/:dogId" element={<BookResidentDog />} />
      <Route path="/customer/availableStaff" element={<AvailableStaff />} />
      {/* /:..../ -> a variable / parameter */}
      <Route path="/bookStaff/:staffId" element={<BookStaff />} />
      <Route path="/customer/bookingRecord" element={<CustomerBookingRecord />} />
      <Route path="/customer/walkingRecord" element={<CustomerWalkingRecord />} />
      <Route path="/walk/:type/:id" element={<CustomerWalkingDetail />} />
      <Route path="/staff/staffHome" element={<StaffHome />} />
      <Route path="/timer/:type/:id" element={<StaffAssignedTimer />} />
      <Route path="/staff/staffProfile" element={<StaffProfile />} />
      <Route path="/staff/staffManageBooking" element={<StaffManageBooking />} />
    </Routes>
  );
}

export default App;

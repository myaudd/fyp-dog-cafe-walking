import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
//import "./bookResidentDog.css";

type Dog = {
  residentdogid: string;
  residentdogname: string;
};

const BookResidentDog = () => {
  const navigate = useNavigate();
  const { dogId } = useParams<{ dogId: string }>();

  const [dog, setDog] = useState<Dog | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [customerID, setCustomerID] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return;

    const user = JSON.parse(storedUser);

    if (user.role === "customer") {
      setCustomerID(user.data.customerid);
    }
  }, []);

  useEffect(() => {
    if (!dogId) return;

    const fetchDog = async () => {
      const { data } = await supabase
        .from("residentdog")
        .select("residentdogid, residentdogname")
        .eq("residentdogid", dogId)
        .single();

      if (data) setDog(data);
    };

    fetchDog();
  }, [dogId]);

  const handleConfirm = async () => {
    if (!selectedTime) {
      alert("Please select a time");
      return;
    }

    if (!customerID || !dogId) {
      alert("Missing booking info");
      return;
    }

    const { error } = await supabase
      .from("bookingresidentdog")
      .insert([
        {
          customerid: customerID,
          residentdogid: dogId,
          brddatetime: selectedTime,
        },
      ]);

    if (error) {
      console.error(error);
      alert("Booking failed");
    } else {
      alert("Booking successful!");
      navigate("/customer/customerHome"); 
    }
  };

  return (
    <div>
      <h1>Book a Time</h1>

      {dog && (
        <p>Booking for: {dog.residentdogname}</p> //display the text after the dog is loaded from db
      )}

      <label>Select Date & Time:</label>
      <input
        type="datetime-local"
        value={selectedTime}
        onChange={(e) => setSelectedTime(e.target.value)}
      />

      <button onClick={handleConfirm} >
        Confirm Booking
      </button>
    </div>
  );
};

export default BookResidentDog;
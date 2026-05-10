import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
//import "./bookStaff.css";

type Staff = {
    staffid: string;
    staffname: string;
};

const BookStaff = () => {
    const navigate = useNavigate();
    const { staffId } = useParams<{ staffId: string }>();

    const [staff, setStaff] = useState<Staff | null>(null);
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
        if (!staffId) return;

        const fetchStaff = async () => {
            const { data } = await supabase
                .from("staff")
                .select("staffid, staffname")
                .eq("staffid", staffId)
                .single();

            if (data) setStaff(data);
        };
        
        fetchStaff();
    }, [staffId]);

    const handleConfirm = async () => {
        if (!selectedTime) {
            alert("Please select a time");
            return;
        }

        if (!customerID || !staffId) {
            alert("Missing booking info");
            return;
        }

        const { error } = await supabase
            .from("bookingstaff")
            .insert([
                {
                    customerid: customerID,
                    staffid: staffId,
                    bsdatetime: selectedTime,
                },
            ]);
        
        if (error) {
            console.error(error);
            alert("Booking failed");
        } else {
            alert("Booking successful!");
            navigate("/customer/availableStaff");
        }
    };

    return (
        <div>
            <h1>Book a Time</h1>

            {staff && (
                <p>Booking for: {staff.staffname}</p>
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

export default BookStaff;
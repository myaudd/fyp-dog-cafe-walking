import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
// import "./staffHome.css";

type Booking = {
    bookingid: string;
    customerid: string;
    customername: string;
    staffid: string;
    staffname: string;
    bookingdatetime: string;
    bookingplace: string;
};

const StaffHome = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [sort, setSort] = useState<"desc" | "asc">("desc");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) return;

        const user = JSON.parse(storedUser);

        if (user.role !== "staff") return;
  
        const staff = user.data;

        const fetchBookings = async () => {
            const [booking]  = await Promise.all([
                supabase
                    .from("bookingstaff")
                    .select(`
                        bsid,
                        customer (
                            customerid,
                            customername
                        ),
                        staff (
                            staffid,
                            staffname
                        ),
                        bsdatetime,
                        bsplace,
                        bsduration,
                        bsstatus
                    `)
                    .eq("staffid", staff.staffid)
                    .is("bsduration", null)
                    .eq("bsstatus", "Approved"),
            ]);
            const bookingList: Booking[] = [];
            if (booking.data) {
                booking.data.forEach((row: any) => {
                    bookingList.push({
                        bookingid: row.bsid,
                        customerid: row.customer.customerid,
                        customername: row.customer.customername,
                        staffid: row.staff.staffid,
                        staffname: row.staff.staffname,
                        bookingdatetime: row.bsdatetime,
                        bookingplace: row.bsplace
                    });
                });
            }
            setBookings(bookingList);
        };
        fetchBookings();
    }, []);

    const handleSort = () => {
        setSort(prev => (prev === "desc" ? "asc" : "desc"));
    };

    const filteredBookings = bookings
        .sort((a, d) => {
            const da = new Date(a.bookingdatetime).getTime();
            const dd = new Date(d.bookingdatetime).getTime();
            return sort === "desc" ? dd - da : da - dd;
        });

    const formatDateTime = (dt: string) => {
        if(!dt) return "-";
        return new Date(dt).toLocaleString("en-MY", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const goToTimer = (id: string, type: "bookingstaff") => {
        navigate(`/timer/${type}/${id}`);
    };

    return (
        <div className="container">
            <header className="header">
                <button
                    type="button"
                    className="profile-icon"
                    onClick={() => navigate("/staff/staffProfile")}
                    aria-label="Profile"
                >
                    👤
                </button>
            </header>

            <div className="menu-bar">
                <button 
                    className="active"
                    onClick={() => navigate("/staff/staffHome")}
                >
                    Assigned walking
                </button>
                <button onClick={() => navigate("/staff/staffManageBooking")}>
                    Manage Booking
                </button>
                <button onClick={() => navigate("/staff/staffBookingRecord")}>
                    Booking record
                </button>
                <button onClick={() => navigate("/staff/staffWalkingRecord")}>
                    Walking record
                </button>
                <button onClick={() => navigate("/staff/staffManageProfile")}>
                    Manage profile
                </button> 
            </div>

            <div className="content">
                <div className="filter">
                    <p>Sort by date</p>
                    <button onClick={handleSort}>
                        {sort === "desc" ? "↓ Recent first" : "↑ Oldest first"}
                    </button>
                </div>

                <div className="booking-list">
                    {filteredBookings.length === 0 && (
                        <p>No booking records found.</p>
                    )}

                    {filteredBookings.map(bookings => (
                        <div key={bookings.bookingid} className="booking-card" onClick={() => goToTimer(bookings.bookingid, "bookingstaff")}>
                            <div className="detail">
                                <p>Customer name: {bookings.customername}</p>
                                <p>Date & time: {formatDateTime(bookings.bookingdatetime)}</p>
                                <p>Place: {bookings.bookingplace}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StaffHome;
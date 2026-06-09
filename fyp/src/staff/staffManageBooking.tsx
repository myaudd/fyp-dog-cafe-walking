import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

type BookingType = "residentdog" | "staff";

type Booking = {
    bookingid: string;
    bookingtype: BookingType;
    customerid: string;
    customername: string;
    subjectid: string;
    subjectname: string;
    bookingdatetime: string;
    bookingplace: string;
    bookingstatus: string;
};


const StaffManageBooking = () => {
    const navigate = useNavigate();
    const [role, setRole] =useState("");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [sort, setSort] = useState<"desc" | "asc">("desc");
    const [selectedTypes, setSelectedTypes] = useState<BookingType[]>([]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if(!storedUser) return;

        const user = JSON.parse(storedUser);
            
        if(user.role !== "staff") return;

        setRole(user.data.staffrole);
            
        const fetchBookings = async () => {
            const [brd, bs] = await Promise.all([
                supabase
                    .from("bookingresidentdog")
                    .select(`
                        brdid,
                        customer (
                            customerid,
                            customername
                        ),
                        residentdog (
                            residentdogid,
                            residentdogname
                        ),
                        brddatetime,
                        brdplace,
                        brdstatus
                    `)
                    .eq("brdstatus", "Pending"),
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
                        bsstatus
                    `)
                    .eq("bsstatus", "Pending"),
            ]);

            const combinedBooking: Booking[] = [];

            if (brd.data) {
                brd.data.forEach((row: any) => {
                    combinedBooking.push({
                        bookingid: row.brdid,
                        bookingtype: "residentdog",
                        customerid: row.customer?.customerid ?? "",
                        customername: row.customer?.customername ?? "Unknown",
                        subjectid: row.residentdog?.residentdogid ?? "",
                        subjectname: row.residentdog?.residentdogname ?? "Unknown",
                        bookingdatetime: row.brddatetime,
                        bookingplace: row.brdplace,
                        bookingstatus: row.brdstatus,
                    });
                });
            }

            if (bs.data) {
                bs.data.forEach((row: any) => {
                    combinedBooking.push({
                        bookingid: row.bsid,
                        bookingtype: "staff",
                        customerid: row.customer?.customerid ?? "",
                        customername: row.customer?.customername ?? "Unknown",
                        subjectid: row.staff?.staffid ?? "",
                        subjectname: row.staff?.staffname ?? "Unknown",
                        bookingdatetime: row.bsdatetime,
                        bookingplace: row.bsplace,
                        bookingstatus: row.bsstatus,
                    });
                });
            }
            setBookings(combinedBooking);
        };
        fetchBookings();
    }, []);

    const handleSort = () => {
        setSort(prev => (prev === "desc" ? "asc" : "desc"));
    };

    const toggleType = (type: BookingType) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const filteredBookings = bookings
        .filter(b =>
            selectedTypes.length === 0 || selectedTypes.includes(b.bookingtype)
        )
        .sort((a, d) => {
            const da = new Date(a.bookingdatetime).getTime();
            const dd = new Date(d.bookingdatetime).getTime();
            return sort === "desc" ? dd - da : da - dd;
        });

    const formatDateTime = (dt: string) => {
        if (!dt) return "-";
        return new Date(dt).toLocaleString("en-MY", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const updateBookingStatus = async (
        booking: Booking,
        newStatus: "Approved" | "Rejected"
    ) => {
        let error = null;

        if (booking.bookingtype === "residentdog") {
            const result = await supabase
                .from("bookingresidentdog")
                .update({brdstatus: newStatus})
                .eq("brdid", booking.bookingid);

            error = result.error;
        } else {
            const result = await supabase
                .from("bookingstaff")
                .update({bsstatus: newStatus})
                .eq("bsid", booking.bookingid);

            error = result.error;
        }
        
        setBookings(prev =>
            prev.filter(b => b.bookingid !== booking.bookingid)
        );
    ;}

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
                <button onClick={() => navigate("/staff/staffHome")}>
                    Assigned walking
                </button>
                <button 
                    className="active"
                    onClick={() => navigate("/staff/staffManageBooking")}>
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

                    {role === "Manager" && (
                        <div>
                            <p>Booking type</p>
                                <button
                                    className={selectedTypes.includes("residentdog") ? "active" : ""}
                                    onClick={() => toggleType("residentdog")}
                                >
                                    Resident Dog
                                </button>
                                <button
                                    className={selectedTypes.includes("staff") ? "active" : ""}
                                    onClick={() => toggleType("staff")}
                                >
                                    Staff
                                </button>
                        </div>
                    )}
                </div>
                <div className="pending-list">
                    {filteredBookings.length === 0 && (
                        <p>No pending booking found.</p>
                    )}

                    {filteredBookings.map(bookings => (
                        <div key={bookings.bookingid} className="pending-card">
                            <div className="pending-info">
                                <div className="label">
                                    {role === "Manager" && (
                                        <p>Type</p>
                                    )}
                                    <p>Name</p>
                                    <p>Date &amp; Time</p>
                                    <p>Place</p>
                                </div>

                                <div className="value">
                                    {role === "Manager" && (
                                        <p>{bookings.bookingtype === "residentdog" ? "Resident Dog" : "Staff"}</p>
                                    )}
                                    <p>{bookings.subjectname}</p>
                                    <p>{formatDateTime(bookings.bookingdatetime)}</p>
                                    <p>{bookings.bookingplace}</p>

                                    <div className="action-button">
                                        <button onClick={() => updateBookingStatus(bookings, "Approved")}>
                                            Approve
                                        </button>
                                        <button onClick={() => updateBookingStatus(bookings, "Rejected")}>
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );  
};

export default StaffManageBooking;
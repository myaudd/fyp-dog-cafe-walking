import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
// import "./customerBookingRecord.css";

type BookingType = "residentdog" | "staff";
type BookingStatus = "Approved" | "Pending";

type Booking = {
    bookingid: string;
    bookingtype: BookingType;
    customerid: string;
    subjectid: string;
    subjectname: string;
    bookingdatetime: string;
    bookingstatus: string;
};

const statuses: BookingStatus[] = ["Approved", "Pending"];

const CustomerBookingRecord = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    // const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState<"desc" | "asc">("desc");
    const [selectedTypes, setSelectedTypes] = useState<BookingType[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<BookingStatus[]>([]);

    useEffect(() => {
        const fetchBookings = async () => {
            // setLoading(true);

            const storedUser = localStorage.getItem("user");

            if(!storedUser) return;

            const user = JSON.parse(storedUser);
            
            if(user.role !== "customer") return;

            const customer = user.data;

            const [brd, bs] = await Promise.all([
                supabase
                    .from("bookingresidentdog")
                    .select(`
                        brdid,
                        customerid,
                        brddatetime,
                        brdstatus,
                        residentdog (
                            residentdogid,
                            residentdogname
                        )
                    `)
                    .eq("customerid", customer.customerid)
                    .in("brdstatus", ["Approved", "Pending"]),
                supabase
                    .from("bookingstaff")
                    .select(`
                        bsid,
                        customerid,
                        bsdatetime,
                        bsstatus,
                        staff (
                            staffid,
                            staffname
                        )
                    `)
                    .eq("customerid", customer.customerid)
                    .in("bsstatus", ["Approved", "Pending"]),
            ]);

            const combinedBooking: Booking[] = [];

            if (brd.data) {
                brd.data.forEach((row: any) => {
                    combinedBooking.push({
                        bookingid: row.brdid,
                        bookingtype: "residentdog",
                        customerid: row.customerid,
                        subjectid: row.residentdog?.residentdogid ?? "",
                        subjectname: row.residentdog?.residentdogname ?? "Unknown",
                        bookingdatetime: row.brddatetime,
                        bookingstatus: row.brdstatus,
                    });
                });
            }

            if (bs.data) {
                bs.data.forEach((row: any) => {
                    combinedBooking.push({
                        bookingid: row.bsid,
                        bookingtype: "staff",
                        customerid: row.customerid,
                        subjectid: row.staff?.staffid ?? "",
                        subjectname: row.staff?.staffname ?? "Unknown",
                        bookingdatetime: row.bsdatetime,
                        bookingstatus: row.bsstatus,
                    });
                });
            }

            setBookings(combinedBooking);
            // setLoading(false);
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

    const toggleStatus = (status: BookingStatus) => {
        setSelectedStatuses(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
    };
    
    const filteredBookings = bookings
        .filter(b => 
            selectedTypes.length === 0 || selectedTypes.includes(b.bookingtype)
        )
        .filter(b =>
            selectedStatuses.length === 0 || selectedStatuses.includes(b.bookingstatus as BookingStatus)
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

    const getStatusClass = (bookingstatus: string) => {
        switch (bookingstatus?.toLowerCase()) {
            case "approved": return "status-approved";
            case "pending": return "status-pending";
            default: return "";
        }
    };

    return (
        <div className="container">
            <header className="header">
                <button
                    type="button"
                    className="profile-icon"
                    onClick={() => navigate("/customer/customerProfile")}
                    aria-label="Profile"
                >
                    👤
                </button>
            </header>

            <div className="menu-bar">
                <button onClick={() => navigate("/customer/customerHome")}>
                    Available dog
                </button>
                <button onClick={() => navigate("/customer/availableStaff")}>
                    Book for your dog
                </button>
                <button
                    className="active"
                    onClick={() => navigate("/customer/bookingRecord")}
                >
                    Booking record
                </button>
                <button onClick={() => navigate("/customer/walkingRecord")}>
                    Walking record
                </button>
            </div>

            <div className="content">
                <div className="filter">
                    <p>Sort by date</p>
                    <button onClick={handleSort}>
                        {sort === "desc" ? "↓ Recent first" : "↑ Oldest first"}
                    </button>

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

                    <p>Booking status</p>
                    {statuses.map(status => (
                        <button
                            key={status}
                            className={selectedStatuses.includes(status) ? "active" : ""}
                            onClick={() => toggleStatus(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="booking-list">
                    {filteredBookings.length === 0 && (
                        <p>No booking records found.</p>
                    )}
                    
                    {filteredBookings.map(bookings => (
                        <div key={bookings.bookingid} className="booking-card">
                            <div className="booking-info">
                                <div className="label">
                                    <p>Type</p>
                                    <p>Name</p>
                                    <p>Date &amp; Time</p>
                                    <p>Status</p>
                                </div>

                                <div className="value">
                                    <p>{bookings.bookingtype === "residentdog" ? "Resident Dog" : "Staff"}</p>
                                    <p>{bookings.subjectname}</p>
                                    <p>{formatDateTime(bookings.bookingdatetime)}</p>
                                    <p className={getStatusClass(bookings.bookingstatus)}>
                                        {bookings.bookingstatus}
                                    </p>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
                
            </div>
        </div>
    );
};

export default CustomerBookingRecord;
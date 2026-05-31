import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
// import "./customerWalkingRecord.css";

type WalkingType = "residentdog" | "staff";

type Walking = {
    walkingid: string;
    walkingtype: WalkingType;
    customerid: string;
    subjectid: string;
    subjectname: string;
    walkingdatetime: string;
    walkingduration: string;
    walkingphoto: string | null;
    walkingrating: number | null;
};

const CustomerWalkingRecord = () => {
    const navigate = useNavigate();
    const [walkings, setWalkings] = useState<Walking[]>([]);
    const [sort, setSort] = useState<"desc" | "asc">("desc");
    const [selectedTypes, setSelectedTypes] = useState<WalkingType[]>([]);

    useEffect(() => {
        const fetchWalkings = async () => {
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
                        brdduration,
                        residentdog (
                            residentdogid,
                            residentdogname
                        )
                    `)
                    .eq("customerid", customer.customerid)
                    .not("brdduration", "is", null)
                    .gt("brdduration", 0),
                supabase
                    .from("bookingstaff")
                    .select(`
                        bsid,
                        customerid,
                        bsdatetime,
                        bsduration,
                        staff (
                            staffid,
                            staffname
                        )
                    `)
                    .eq("customerid", customer.customerid)
                    .not("bsduration", "is", null)
                    .gt("bsduration", 0),
            ]);

            const combinedWalking: Walking[] = [];

            if (brd.data) {
                brd.data.forEach((row: any) => {
                    combinedWalking.push({
                        walkingid: row.brdid,
                        walkingtype: "residentdog",
                        customerid: row.customerid,
                        subjectid: row.residentdog?.residentdogid ?? "",
                        subjectname: row.residentdog?.residentdogname ?? "Unknown",
                        walkingdatetime: row.brddatetime,
                        walkingduration: row.brdduration,
                        walkingphoto: row.photo?.photourl ?? null,
                        walkingrating: null,
                    });
                });   
            }

            if (bs.data) {
                bs.data.forEach((row: any) => {
                    combinedWalking.push({
                        walkingid: row.bsid,
                        walkingtype: "staff",
                        customerid: row.customerid,
                        subjectid: row.staff?.staffid ?? "",
                        subjectname: row.staff?.staffname ?? "Unknown",
                        walkingdatetime: row.bsdatetime,
                        walkingduration: row.bsduration,
                        walkingphoto: null,
                        walkingrating: row.bsrate ?? null,
                    });
                });
            }

            setWalkings(combinedWalking);
        };

        fetchWalkings();
    }, []);

    const handleSort = () => {
        setSort(prev => (prev === "desc" ? "asc" : "desc"));
    };

    const toggleType = (type: WalkingType) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const filteredWalkings = walkings
        .filter(w =>
            selectedTypes.length === 0 || selectedTypes.includes(w.walkingtype)
        )
        .sort((a, d) => {
            const da = new Date(a.walkingdatetime).getTime();
            const dd = new Date(d.walkingdatetime).getTime();
            return sort === "desc" ? dd - da : da - dd;
        });

    const formatDateTime = (datetime: string) => {
        if (!datetime) return "-";
        return new Date(datetime).toLocaleString("en-MY", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDuration = (dr: string) => {
        if (!dr) return "-";
        const [hours, minutes] = dr.split(":").map(Number);
        const duration = [];
        if (hours > 0) {
            duration.push(`${hours} hour${hours > 1 ? "s" : ""}`);
        }
        if (minutes > 0) {
            duration.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
        }
        return duration.length > 0 ? duration.join(" ") : "0 minutes";
    }

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
                <button onClick={() => navigate("/customer/bookingRecord")}>
                    Booking record
                </button>
                <button 
                    className="active"
                    onClick={() => navigate("/customer/walkingRecord")}
                >
                    Walking record
                </button>
            </div>

            <div className="content">
                <div className="filter">
                    <p>Sort by date</p>
                    <button onClick={handleSort}>
                        {sort === "desc" ? "↓ Recent first" : "↑ Oldest first"}
                    </button>

                    <p>Walking type</p>
                    <button
                        className={selectedTypes.includes("residentdog") ? "active" : ""}
                        onClick={() => toggleType("residentdog")}
                    >
                        Resident dog
                    </button>
                    <button 
                        className={selectedTypes.includes("staff") ? "active" : ""}
                        onClick={() => toggleType("staff")}
                    >
                        Staff
                    </button>
                </div>

                <div className="walking-list">
                    {filteredWalkings.length === 0 && (
                        <p>No walking records found.</p>
                    )}

                    {filteredWalkings.map(walkings => (
                        <div key={walkings.walkingid} className="walking-card">
                            <div className="walking-info">
                                <div className="label">
                                    <p>Type</p>
                                    <p>Name</p>
                                    <p>Date &amp; Time</p>
                                    <p>Duration</p>
                                </div>

                                <div className="value">
                                    <p>{walkings.walkingtype === "residentdog" ? "Resident Dog" : "Staff"}</p>
                                    <p>{walkings.subjectname}</p>
                                    <p>{formatDateTime(walkings.walkingdatetime)}</p>
                                    <p>{formatDuration(walkings.walkingduration)}</p>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default CustomerWalkingRecord;
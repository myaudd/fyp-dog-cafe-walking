import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

type BookingType = "residentdog" | "staff";

type Booking = {
    bookingid: string;
    bookingtype: BookingType;
    customerid: string;
    customername: string;
    staffid: string | null;
    staffname: string | null;
    residentdogid: string | null;
    residentdogname: string | null;
    bookingdatetime: string;
    bookingplace: string;
    walkstarttime: string | null;
    walkendtime: string | null;
};

const StaffAssignedTimer = () => {
    // const navigate = useNavigate();
    const { type, id } = useParams(); 
    const [booking, setBooking] = useState<Booking | null>(null);

    const [walking, setWalking] = useState(false);
    const [completed, setCompleted] = useState(false); 

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            if (type === "bookingstaff") {
                const { data, error } = await supabase
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
                        bswalkstarttime,
                        bswalkendtime
                    `)
                    .eq("bsid", id)
                    .single();
                if (error) {
                    console.error(error);
                    return;
                }
                const customer = Array.isArray(data.customer)
                ? data.customer[0]
                : data.customer;
                const staff = Array.isArray(data.staff)
                ? data.staff[0]
                : data.staff;
                setBooking({
                    bookingid: data.bsid,
                    bookingtype: "staff",
                    customerid: customer.customerid,
                    customername: customer.customername,
                    staffid: staff.staffid,
                    staffname: staff.staffname,
                    residentdogid: null,
                    residentdogname: null,                
                    bookingdatetime: data.bsdatetime,
                    bookingplace: data.bsplace,
                    walkstarttime: data.bswalkstarttime,
                    walkendtime: data.bswalkendtime
                })
            } 
            if (type === "bookingresidentdog") {
                const { data, error } = await supabase
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
                        brdwalkstarttime,
                        brdwalkendtime
                    `)
                    .eq("brdid", id)
                    .single();
                if (error) {
                    console.error(error);
                    return;
                }
                const customer = Array.isArray(data.customer)
                ? data.customer[0]
                : data.customer;
                const dog = Array.isArray(data.residentdog)
                ? data.residentdog[0]
                : data.residentdog;
                setBooking({
                    bookingid: data.brdid,
                    bookingtype: "residentdog",
                    customerid: customer.customerid,
                    customername: customer.customername,
                    staffid: null,
                    staffname: null,
                    residentdogid: dog.residentdogid,
                    residentdogname: dog.residentdogname,                
                    bookingdatetime: data.brddatetime,
                    bookingplace: data.brdplace,
                    walkstarttime: data.brdwalkstarttime,
                    walkendtime: data.brdwalkendtime
                })
            }
        };
        fetchData();
    }, [type, id]);

    useEffect(() => {
        if (!booking) return;

        if(booking.walkstarttime && !booking.walkendtime) {
            setWalking(true);
            setCompleted(false);
        } else if (booking.walkstarttime && booking.walkendtime) {
            setWalking(false);
            setCompleted(true);
        } else {
            setWalking(false);
            setCompleted(false);
        }
    }, [booking]);

    const walkTimestamp = () => {
        const now = new Date();
    
        const format = (n: number) => n.toString().padStart(2, "0");
    
        return (
            now.getFullYear() + "-" +
            format(now.getMonth() + 1) + "-" +
            format(now.getDate()) + " " +
            format(now.getHours()) + ":" +
            format(now.getMinutes()) + ":" +
            format(now.getSeconds())
        );
    };

    const handleWalk = async () => {
        if (!walking && !completed) {
            setWalking(true);
            if (type === "residentdog") {
                await supabase
                .from("bookingresidentdog")
                .update({ 
                    brdwalkstarttime: walkTimestamp(),
                    brdstatus: "Walking"
                })
                .eq("brdid", id);
            } else {
                await supabase
                .from("bookingstaff")
                .update({ 
                    bswalkstarttime: walkTimestamp(),
                    bsstatus: "Walking"
                })
                .eq("bsid", id);
            }
        } else if (walking && !completed) {
            setWalking(false);
            setCompleted(true); // cannot restart anymore

            if (type === "residentdog") {
                await supabase
                .from("bookingresidentdog")
                .update({ 
                    brdwalkendtime: walkTimestamp(),
                    brdstatus: "Completed"
                })
                .eq("brdid", id);
            } else {
                await supabase
                .from("bookingstaff")
                .update({ 
                    bswalkendtime: walkTimestamp(),
                    bsstatus: "Completed"
                })
                .eq("bsid", id);
            }
        }
    };

    const formatDateTime = (dt?: string) => {
        if (!dt) return "-";
        return new Date(dt).toLocaleString("en-MY", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="container">
            <button
                onClick={handleWalk}
                disabled={completed}
            >
                {!walking && !completed && "Start Walking"}
                {walking && "End Walking"}
                {completed && "Session Completed"}
            </button>

            {type === "residentdog" && (
                <p>Dog name: {booking?.residentdogname}</p>
            )}
            <p>Customer name: {booking?.customername}</p>
            <p>Data & Time: {formatDateTime(booking?.bookingdatetime)}</p>
            <p>Place: {booking?.bookingplace}</p>
        </div>
    );
};

export default StaffAssignedTimer;
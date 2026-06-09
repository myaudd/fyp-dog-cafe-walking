import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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
};

const StaffAssignedTimer = () => {
    // const navigate = useNavigate();
    const { type, id } = useParams(); 
    const [booking, setBooking] = useState<Booking | null>(null);

    const [running, setRunning] = useState(false);
    const [locked, setLocked] = useState(false); 
    const [seconds, setSeconds] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null); //creates a mutable object whose value persists between re-renders

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
                        bsplace
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
                    bookingplace: data.bsplace
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
                        brdplace
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
                    bookingplace: data.brdplace
                })
            }
        };
        fetchData();
    }, [type, id]);

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

    const handleTimer = async () => {
        if (!running && !locked) {
            setRunning(true);
            if (type === "residentdog") {
                await supabase
                .from("bookingresidentdog")
                .update({ brdwalkstarttime: walkTimestamp()})
                .eq("brdid", id);
            } else {
                await supabase
                .from("bookingstaff")
                .update({ bswalkstarttime: walkTimestamp()})
                .eq("bsid", id);
            }

            intervalRef.current = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000); //1000 milliseconds = 1 seconds, function, time interval
        } else if (running && !locked) {
            setRunning(false);
            setLocked(true); // cannot restart anymore

            if (intervalRef.current) {
                clearInterval(intervalRef.current); //stop the timer
            }

            if (type === "residentdog") {
                await supabase
                .from("bookingresidentdog")
                .update({ brdwalkstarttime: walkTimestamp()})
                .eq("brdid", id);
            } else {
                await supabase
                .from("bookingstaff")
                .update({ bswalkstarttime: walkTimestamp()})
                .eq("bsid", id);
            }
        }
    };

    useEffect(() => { //When this page/component is closed or removed, stop the timer if it’s still running.
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const formatTimer = (total: number) => {
        const hrs = Math.floor(total / 3600);
        const mins = Math.floor((total % 3600) / 60); //math.floor: rounds a number down to the nearest whole number
        const secs = total % 60;

        return `${hrs.toString().padStart(2, "0")}:
                ${mins.toString().padStart(2, "0")}:
                ${secs.toString().padStart(2, "0")}`;
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
            <h2>Timer: {formatTimer(seconds)}</h2>

            <button
                onClick={handleTimer}
                disabled={locked}
            >
                {!running && !locked && "Start Timer"}
                {running && "End Timer"}
                {locked && "Session Completed"}
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
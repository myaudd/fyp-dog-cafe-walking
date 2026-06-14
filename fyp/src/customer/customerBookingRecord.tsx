import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react"; //cache computed value, prevent rerendering whole table whenever filteredbooking change
import { supabase } from "../supabaseClient";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
//to define columns, ro render headers and cells correctly, to build basic rows, to create a table instance
import "./customerBookingRecord.css";

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
const columnHelper = createColumnHelper<Booking>();

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
    
    const filteredBookings = useMemo(() => {
        return [...bookings]
            .filter(b => 
                selectedTypes.length === 0 || selectedTypes.includes(b.bookingtype)
            )
            .filter(b =>
                selectedStatuses.length === 0 || selectedStatuses.includes(b.bookingstatus as BookingStatus)
            )
            .sort((a, b) => {
                const da = new Date(a.bookingdatetime).getTime();
                const db = new Date(b.bookingdatetime).getTime();
                return sort === "desc" ? db - da : da - db;
            });
    }, [bookings, selectedTypes, selectedStatuses, sort]);

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

    //???
    const getStatusClass = (bookingstatus: string) => {
        switch (bookingstatus?.toLowerCase()) {
            case "approved": return "status-approved";
            case "pending": return "status-pending";
            default: return "";
        }
    };

    const columns = useMemo(
        () => [
        columnHelper.accessor("bookingtype", {
            header: "Type",
            cell: info =>
                info.getValue() === "residentdog" ? "Resident Dog" : "Staff",
        }),

        columnHelper.accessor("subjectname", {
            header: "Name",
        }),

        columnHelper.accessor("bookingdatetime", {
            header: "Date & Time",
            cell: info => formatDateTime(info.getValue()),
        }),

        columnHelper.accessor("bookingstatus", {
            header: "Status",
            cell: info => (
                <span className={getStatusClass(info.getValue())}>
                    {info.getValue()}
                </span>
            ),
        }),
        ],
    [formatDateTime, getStatusClass]
    );

    const table = useMemo(() => {
        return useReactTable({
            data: filteredBookings,
            columns,
            getCoreRowModel: getCoreRowModel(), //get rows from data
        });
    }, [filteredBookings, columns]);

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

                <div className="booking-table-container">
                    {filteredBookings.length === 0 ? (
                        <p>No booking records found.</p>
                    ) : (
                        <table className="booking-table">
                            <thead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    // get column headers
                                    <tr key={headerGroup.id}> 
                                    {/* table row */}
                                        {headerGroup.headers.map(header => (
                                            // each column
                                            <th key={header.id}>
                                                {/* table header */}
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    // get the header definition of this column
                                                    header.getContext()
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>

                            <tbody>
                                {table.getRowModel().rows.map(row => (
                                    // all data rows
                                    <tr key={row.id}>
                                        {row.getVisibleCells().map(cell => (
                                            // cells inside a row
                                            <td key={cell.id}>
                                                {/* table data cell */}
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    // get the function that renders each cell for this column
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>                
            </div>
        </div>
    );
};

export default CustomerBookingRecord;
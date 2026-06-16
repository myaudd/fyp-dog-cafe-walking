import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import "./staffManageBooking.css";

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

const columnHelper = createColumnHelper<Booking>();

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

    const filteredBookings = useMemo(() => {
        return [...bookings]
            .filter(b =>
                selectedTypes.length === 0 || selectedTypes.includes(b.bookingtype)
            )
            .sort((a, d) => {
                const da = new Date(a.bookingdatetime).getTime();
                const dd = new Date(d.bookingdatetime).getTime();
                return sort === "desc" ? dd - da : da - dd;
            });
    }, [bookings, selectedTypes, sort]);

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
        
        if (error) {
            alert(error.message);
            return;
        }

        setBookings(prev =>
            prev.filter(b => b.bookingid !== booking.bookingid)
        );
    ;}

    const columns = useMemo(() => {
        const cols = [];

        if (role === "Manager") {
            cols.push(
                columnHelper.accessor("bookingtype", {
                    header: "Type",
                    cell: info =>
                        info.getValue() === "residentdog" ? "Resident Dog" : "Staff",
                })
            );
        }

        cols.push(
            columnHelper.accessor("subjectname", {
                header: "Name",
            }),

            columnHelper.accessor("bookingdatetime", {
                header: "Date & Time",
                cell: info => formatDateTime(info.getValue()),
            }),

            columnHelper.accessor("bookingplace", {
                header: "Place",
            }),

            columnHelper.display({
                id: "status",
                header: "Status",
                cell: ({row}) => (
                    <select className="status-option"
                        value="Pending"
                        onChange={(e) =>
                            updateBookingStatus(row.original, e.target.value as "Approved" | "Rejected")
                        }
                    >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approve</option>
                        <option value="Rejected">Reject</option>
                    </select>
                ),
            }),
        );

        return cols;
    }, [formatDateTime, role, updateBookingStatus]);

    const table = useMemo(() => {
        return useReactTable({
            data: filteredBookings,
            columns,
            getCoreRowModel: getCoreRowModel(),
        });
    }, [filteredBookings, columns]);

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

                <div className="manage-table-container">
                    {filteredBookings.length === 0 ? (
                        <p>No pending bookings.</p>
                    ) : (
                        <table className="manage-table">
                            <thead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th  key={header.id}>
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>

                            <tbody>
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id}>
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
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

export default StaffManageBooking;
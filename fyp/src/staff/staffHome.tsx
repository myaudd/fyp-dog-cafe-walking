import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import "./staffHome.css";

type BookingType = "residentdog" | "staff";
type BookingStatus = "Walking" | "Approved";

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

const statuses: BookingStatus[] = ["Walking", "Approved"];
const columnHelper = createColumnHelper<Booking>();

const StaffHome = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<"desc" | "asc">("desc");
    const [selectedTypes, setSelectedTypes] = useState<BookingType[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<BookingStatus[]>([]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) return;

        const user = JSON.parse(storedUser);

        if (user.role !== "staff") return;
  
        const staff = user.data;

        const fetchBookings = async () => {
            const [bs, brd]  = await Promise.all([
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
                    .in("bsstatus", ["Approved", "Walking"]),
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
                        brdduration,
                        brdstatus
                    `)
                    .is("brdduration", null)
                    .in("brdstatus", ["Approved", "Walking"]),
            ]);

            const bookingList: Booking[] = [];

            if (bs.data) {
                bs.data.forEach((row: any) => {
                    bookingList.push({
                        bookingid: row.bsid,
                        bookingtype: "staff",
                        customerid: row.customer.customerid,
                        customername: row.customer.customername,
                        subjectid: row.staff.staffid,
                        subjectname: row.staff.staffname,
                        bookingdatetime: row.bsdatetime,
                        bookingplace: row.bsplace,
                        bookingstatus: row.bsstatus,
                    });
                });
            }

            if (brd.data) {
                brd.data.forEach((row: any) => {
                    bookingList.push({
                        bookingid: row.brdid,
                        bookingtype: "residentdog",
                        customerid: row.customer.customerid,
                        customername: row.customer.customername,
                        subjectid: row.residentdog.residentdogid,
                        subjectname: row.residentdog.residentdogname,
                        bookingdatetime: row.brddatetime,
                        bookingplace: row.brdplace,
                        bookingstatus: row.brdstatus,
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
                search === "" ||
                b.subjectname.toLowerCase().includes(search.toLowerCase())
            )
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
    }, [bookings, selectedTypes, selectedStatuses, sort, search]);

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

    const getStatusClass = (bookingstatus: string) => {
        switch (bookingstatus?.toLowerCase()) {
            case "approved": return "status-approved";
            case "walking": return "status-walking";
            default: return "";
        }
    };

    const columns = useMemo(() => [
        columnHelper.accessor("customername", {
            header: "Customer",
        }),

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

        columnHelper.accessor("bookingstatus", {
            header: "Status",
            cell: info => (
                <span className={getStatusClass(info.getValue())}>
                    {info.getValue()}
                </span>
            ),
        }),
    ], [formatDateTime, getStatusClass]);

    const table = useMemo(() => {
        return useReactTable({
            data: filteredBookings,
            columns,
            getCoreRowModel: getCoreRowModel(),
        });
    }, [filteredBookings, columns]);

    const goToTimer = (id: string, type: BookingType) => {
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
                <button onClick={() => navigate("/staff/staffWalkingRecord")}>
                    Walking record
                </button>
                <button onClick={() => navigate("/staff/staffManageProfile")}>
                    Manage profile
                </button> 
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
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

                <div className="assigned-table-container">
                    {filteredBookings.length === 0 ? (
                        <p>No walking record found.</p>
                    ) : (
                        <table className="assigned-table">
                            <thead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id}>
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
                                    <tr
                                        key={row.id}
                                        onClick={() =>
                                            goToTimer(
                                                row.original.bookingid,
                                                row.original.bookingtype
                                            )
                                        }
                                        style={{ cursor: "pointer"}}
                                    >
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

export default StaffHome;
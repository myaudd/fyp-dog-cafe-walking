import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import "./customerWalkingRecord.css";

type WalkingType = "residentdog" | "staff";
type WalkingStatus = "Completed" | "Rejected" | "Invalid";

type Walking = {
    walkingid: string;
    walkingtype: WalkingType;
    customerid: string;
    subjectid: string;
    subjectname: string;
    walkingdatetime: string;
    walkingduration: string;
    walkingstatus: string;
    // walkingphoto: string | null;
    // walkingrating: number | null;
};

const statuses: WalkingStatus[] = ["Completed", "Rejected", "Invalid"];
const columnHelper = createColumnHelper<Walking>();

const CustomerWalkingRecord = () => {
    const navigate = useNavigate();
    const [walkings, setWalkings] = useState<Walking[]>([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<"desc" | "asc">("desc");
    const [selectedTypes, setSelectedTypes] = useState<WalkingType[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<WalkingStatus[]>([]);

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
                        ),
                        brdstatus
                    `)
                    .eq("customerid", customer.customerid)
                    .in("brdstatus", ["Completed", "Rejected", "Invalid"]),
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
                        ),
                        bsstatus
                    `)
                    .eq("customerid", customer.customerid)
                    .in("bsstatus", ["Completed", "Rejected", "Invalid"]),
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
                        // walkingphoto: row.photo?.photourl ?? null,
                        // walkingrating: null,
                        walkingstatus: row.brdstatus,
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
                        // walkingphoto: null,
                        // walkingrating: row.bsrate ?? null,
                        walkingstatus: row.bsstatus,
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

    const toggleStatus = (status: WalkingStatus) => {
        setSelectedStatuses(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
    };

    const filteredWalkings = useMemo(() => {
        return [...walkings]
            .filter(w =>
                search === "" ||
                w.subjectname.toLowerCase().includes(search.toLowerCase())
            )
            .filter(w =>
                selectedTypes.length === 0 || selectedTypes.includes(w.walkingtype)
            )
            .filter(w =>
                selectedStatuses.length === 0 || selectedStatuses.includes(w.walkingstatus as WalkingStatus)
            )
            .sort((a, d) => {
                const da = new Date(a.walkingdatetime).getTime();
                const dd = new Date(d.walkingdatetime).getTime();
                return sort === "desc" ? dd - da : da - dd;
            });
    }, [walkings, selectedTypes, selectedStatuses, sort, search]);

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

    const getStatusClass = (walkingstatus: string) => {
        switch (walkingstatus?.toLowerCase()) {
            case "completed": return "status-completed";
            case "rejected": return "status-rejected";
            case "invalid": return "status-invalid";
            default: return "";
        }
    };

    const columns = useMemo(() => [
        columnHelper.accessor("walkingtype", {
            header: "Type",
            cell: info => 
                info.getValue() === "residentdog" ? "Resident Dog" : "Staff",
        }),

        columnHelper.accessor("subjectname", {
            header: "Name",
        }),

        columnHelper.accessor("walkingdatetime", {
            header: "Date & Time",
            cell: info => formatDateTime(info.getValue()),
        }),

        columnHelper.accessor("walkingstatus", {
            header: "Status",
            cell: info => (
                <span className={getStatusClass(info.getValue())}>
                    {info.getValue()}
                </span>
            ),
        }),

        columnHelper.accessor("walkingduration", {
            header: "Duration",
            cell: info => formatDuration(info.getValue()),
        }),
    ], [formatDateTime, formatDuration, getStatusClass]);

    const table = useMemo(() => {
        return useReactTable({
            data: filteredWalkings,
            columns,
            getCoreRowModel: getCoreRowModel(),
        });
    }, [filteredWalkings, columns]);

    const goToWalking = (id: string, type: WalkingType) => {
        navigate(`/walk/${type}/${id}`);
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

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)} //target -> search bar
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

                <div className="walking-table-container">
                    {filteredWalkings.length === 0 ? (
                        <p>No walking record found.</p>
                    ) : (
                        <table className="walking-table">
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
                                            goToWalking(
                                                row.original.walkingid,
                                                row.original.walkingtype
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

export default CustomerWalkingRecord;
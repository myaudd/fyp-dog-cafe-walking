import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import "./staffManageProfile.css";

type SubjectType = "residentdog" | "staff" | "customer";

type Dog = {
    residentdogid: string;
    residentdogname: string;
    residentdogbreed: string;
    residentdogsize: string;
};

type Staff = {
    staffid: string;
    staffname: string;
    staffrole: string;
};

type Customer = {
    customerid: string;
    customername: string;
    customeremail: string;
    customerphonenumber: string;
};

const dogColumnHelper = createColumnHelper<Dog>();
const staffColumnHelper = createColumnHelper<Staff>();
const customerColumnHelper = createColumnHelper<Customer>();

const StaffManageProfile = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState<SubjectType>("residentdog");

    const [dogs, setDogs] = useState<Dog[]>([]);
    const [breeds, setBreeds] = useState<string[]>([]);
    const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);

    const [staffs, setStaffs] = useState<Staff[]>([]); //current value, function to update the value, update ui automatically
    const [roles, setRoles] = useState<string[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const [customers, setCustomers] = useState<Customer[]>([]); //current value, function to update the value, update ui automatically

    const [sort, setSort] = useState("default");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchDogs = async () => {
            const { data } = await supabase
                .from("residentdog")
                .select("*");
        
            if (data) {
                setDogs(data);
        
                const uniqueBreeds = [
                    ...new Set(
                        data
                            .map(d => d.residentdogbreed)
                            .filter(breed => breed && breed.trim() !== "")
                    )
                ];        
                setBreeds(uniqueBreeds);
            }
        };

        const fetchStaffs = async () => { //run asynchronously
            const { data } = await supabase //{} destructuring
                .from("staff")
                .select("*");

            if (data) {
                setStaffs(data);

                const uniqueRoles = [
                    ...new Set( //set only store unique value and ... convert items in set into array
                        data
                            .map(s => s.staffrole)
                            .filter(role => role && role.trim() !== "") //ensure not null
                    )
                ];
                setRoles(uniqueRoles);
            }
        };

        const fetchCustomers = async () => {
            const { data } = await supabase
                .from("customer")
                .select("*");
        
            if (data) {
                setCustomers(data);
            }
        };

        fetchDogs();
        fetchStaffs();
        fetchCustomers();
    }, []);

    const sizeOrder: Record<string, number> = {
        S: 1,
        M: 2,
        L: 3
    };
    
    const filteredDogs = useMemo(() => {
        return [...dogs]
            .filter(dog =>
                dog.residentdogname.toLowerCase().includes(search.toLowerCase())
            )
            .filter(dog =>
                selectedBreeds.length === 0 ||
                selectedBreeds.includes(dog.residentdogbreed)
            )
            .sort((a, b) => {
                if (sort === "asc") {
                    return sizeOrder[a.residentdogsize] - sizeOrder[b.residentdogsize];
                }
                if (sort === "desc") {
                    return sizeOrder[b.residentdogsize] - sizeOrder[a.residentdogsize];
                }
                return 0;
            });
        }, [dogs, selectedBreeds, sort, search]);

    const handleSort = () => {
        if (sort === "default") setSort("asc");
        else if (sort === "asc") setSort("desc");
        else setSort("default");
    };
        
    const toggleBreed = (breed: string) => {
        setSelectedBreeds(prev =>
            prev.includes(breed)
            ? prev.filter(b => b !== breed)
            : [...prev, breed]
        );
    };

    const dogColumns = useMemo(() => [
        dogColumnHelper.accessor("residentdogname", {
            header: "Name",
        }),
    
        dogColumnHelper.accessor("residentdogbreed", {
             header: "Breed",
        }),
    
        dogColumnHelper.accessor("residentdogsize", {
            header: "Size",
        }),        
    ], []);

    const goToEditDog = (id: string) => {
        navigate(`/editDog/${id}`);
    };

    const goToAddDog = () => {
        navigate(`/addDog`);
    };
    
    const filteredStaffs = useMemo (() => {
        return [...staffs]
            .filter(staff =>
                staff.staffname.toLowerCase().includes(search.toLowerCase())
            )
            .filter(staff =>
                selectedRoles.length === 0 ||
                selectedRoles.includes(staff.staffrole)
            )
    }, [staffs, search, selectedRoles]);

    const toggleRole = (role: string) => {
        setSelectedRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role) //remove
                : [...prev, role] //add
        );
    };

    const staffColumns = useMemo(() => [
        staffColumnHelper.accessor("staffname", {
            header: "Name",
        }),
    
        staffColumnHelper.accessor("staffrole", {
            header: "Role",
        }),
    ], []);

    const goToEditStaff = (id: string) => {
        navigate(`/editStaff/${id}`);
    };

    const goToAddStaff = () => {
        navigate(`/addStaff`);
    };

    
    const filteredCustomers = useMemo(() => {
        return customers
            .filter(customer =>
                customer.customername.toLowerCase().includes(search.toLowerCase())
            );
    }, [customers, search]);

    const customerColumns = useMemo(() => [
        customerColumnHelper.accessor("customername", {
            header: "Name",
        }),
    
        customerColumnHelper.accessor("customeremail", {
            header: "Email",
        }),
    
        customerColumnHelper.accessor("customerphonenumber", {
            header: "Phone Number",
        }),
    ], []);

    const dogTable = useReactTable({
        data: filteredDogs,
        columns: dogColumns,
        getCoreRowModel: getCoreRowModel(),
    });
    
    const staffTable = useReactTable({
        data: filteredStaffs,
        columns: staffColumns,
        getCoreRowModel: getCoreRowModel(),
    });
    
    const customerTable = useReactTable({
        data: filteredCustomers,
        columns: customerColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    const renderTable = <T,>(table: ReturnType<typeof useReactTable<T>>, onRowClick?: (row: T) => void) => (
        <table className="table">
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
                        onClick={() => onRowClick?.(row.original)}
                        style={{ cursor: onRowClick ? "pointer" : "default"}}
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
    );

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
                <button onClick={() => navigate("/staff/staffManageBooking")}>
                    Manage Booking
                </button>
                <button onClick={() => navigate("/staff/walkingRecord")}>
                    Walking record
                </button>
                <button
                    className="active" 
                    onClick={() => navigate("/staff/staffManageProfile")}
                >
                    Manage profile
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

            <div className="tab-bar">
                <button
                    className={tab === "residentdog" ? "active" : ""}
                    onClick={() => setTab("residentdog")}
                >
                    Resident Dog
                </button>

                <button
                    className={tab === "staff" ? "active" : ""}
                    onClick={() => setTab("staff")}
                >
                    Staff
                </button>

                <button
                    className={tab === "customer" ? "active" : ""}
                    onClick={() => setTab("customer")}
                >
                    Customer
                </button>
            </div>

            <div className="content">
                <div className="filter">
                    <button 
                        className="add"
                        onClick={() => {
                            tab === "residentdog" && goToAddDog() ||
                            tab === "staff" && goToAddStaff() 
                        }}
                    >
                        + Add
                    </button>
                    {tab === "residentdog" &&
                        <div>
                            <p>Sort by size</p>
                            <button onClick={handleSort}>
                                {sort === "default" && "⇅"}
                                {sort === "asc" && "↓"}
                                {sort === "desc" && "↑"}
                            </button>

                            <p>Filter by breed</p>
                            {breeds.map(breed => (
                                <button
                                    key={breed}
                                    className={selectedBreeds.includes(breed) ? "active" : ""}
                                    onClick={() => toggleBreed(breed)}
                                >
                                    {breed}
                                </button>
                            ))}
                        </div>
                    }

                    {tab === "staff" &&
                        <div>
                            <p>Filter by role</p>
                            {roles.map(role => (
                                <button
                                    key={role}
                                    className={selectedRoles.includes(role) ? "active" : ""}
                                    onClick={() => toggleRole(role)}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    }
                </div>

                <div className="table-container">
                    <div className="table">
                        {tab === "residentdog" && renderTable(dogTable, dog => goToEditDog(dog.residentdogid))}
                        {tab === "staff" && renderTable(staffTable, staff => goToEditStaff(staff.staffid))}
                        {tab === "customer" && renderTable(customerTable)}    
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffManageProfile;
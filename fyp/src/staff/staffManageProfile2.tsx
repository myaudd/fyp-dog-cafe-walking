import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable
} from "@tanstack/react-table";
import "./staffManageProfile.css";

/* ================= TYPES ================= */

type TabType = "dog" | "staff" | "customer";

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

/* ================= MAIN COMPONENT ================= */

const StaffManageProfile = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<TabType>("dog");

    const [dogs, setDogs] = useState<Dog[]>([]);
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    const [search, setSearch] = useState("");

    // filters
    const [breeds, setBreeds] = useState<string[]>([]);
    const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);

    const [roles, setRoles] = useState<string[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    /* ================= FETCH DATA ================= */

    useEffect(() => {
        const fetchDogs = async () => {
            const { data } = await supabase.from("residentdog").select("*");

            if (data) {
                setDogs(data);

                const uniqueBreeds = [
                    ...new Set(
                        data
                            .map(d => d.residentdogbreed)
                            .filter(Boolean)
                    )
                ];
                setBreeds(uniqueBreeds);
            }
        };

        const fetchStaffs = async () => {
            const { data } = await supabase.from("staff").select("*");

            if (data) {
                setStaffs(data);

                const uniqueRoles = [
                    ...new Set(
                        data.map(s => s.staffrole).filter(Boolean)
                    )
                ];
                setRoles(uniqueRoles);
            }
        };

        const fetchCustomers = async () => {
            const { data } = await supabase.from("customer").select("*");
            if (data) setCustomers(data);
        };

        fetchDogs();
        fetchStaffs();
        fetchCustomers();
    }, []);

    /* ================= DOG FILTER ================= */

    const filteredDogs = useMemo(() => {
        return dogs
            .filter(d =>
                d.residentdogname.toLowerCase().includes(search.toLowerCase())
            )
            .filter(d =>
                selectedBreeds.length === 0 ||
                selectedBreeds.includes(d.residentdogbreed)
            );
    }, [dogs, search, selectedBreeds]);

    /* ================= STAFF FILTER ================= */

    const filteredStaffs = useMemo(() => {
        return staffs
            .filter(s =>
                s.staffname.toLowerCase().includes(search.toLowerCase())
            )
            .filter(s =>
                selectedRoles.length === 0 ||
                selectedRoles.includes(s.staffrole)
            );
    }, [staffs, search, selectedRoles]);

    /* ================= CUSTOMER FILTER ================= */

    const filteredCustomers = useMemo(() => {
        return customers.filter(c =>
            c.customername.toLowerCase().includes(search.toLowerCase())
        );
    }, [customers, search]);

    /* ================= TOGGLES ================= */

    const toggleBreed = (breed: string) => {
        setSelectedBreeds(prev =>
            prev.includes(breed)
                ? prev.filter(b => b !== breed)
                : [...prev, breed]
        );
    };

    const toggleRole = (role: string) => {
        setSelectedRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    /* ================= RENDER TABLE ================= */

    const renderContent = () => {
        switch (activeTab) {
            case "dog":
                return (
                    <>
                        <h3>Resident Dogs</h3>

                        <div>
                            {breeds.map(breed => (
                                <button
                                    key={breed}
                                    onClick={() => toggleBreed(breed)}
                                    className={selectedBreeds.includes(breed) ? "active" : ""}
                                >
                                    {breed}
                                </button>
                            ))}
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Breed</th>
                                    <th>Size</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDogs.map(dog => (
                                    <tr
                                        key={dog.residentdogid}
                                        onClick={() => navigate(`/dog/${dog.residentdogid}`)}
                                    >
                                        <td>{dog.residentdogname}</td>
                                        <td>{dog.residentdogbreed}</td>
                                        <td>{dog.residentdogsize}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                );

            case "staff":
                return (
                    <>
                        <h3>Staff</h3>

                        <div>
                            {roles.map(role => (
                                <button
                                    key={role}
                                    onClick={() => toggleRole(role)}
                                    className={selectedRoles.includes(role) ? "active" : ""}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaffs.map(staff => (
                                    <tr
                                        key={staff.staffid}
                                        onClick={() => navigate(`/staff/${staff.staffid}`)}
                                    >
                                        <td>{staff.staffname}</td>
                                        <td>{staff.staffrole}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                );

            case "customer":
                return (
                    <>
                        <h3>Customers</h3>

                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map(c => (
                                    <tr key={c.customerid}>
                                        <td>{c.customername}</td>
                                        <td>{c.customeremail}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                );
        }
    };

    /* ================= UI ================= */

    return (
        <div className="container">

            {/* HEADER */}
            <header className="header">
                <button onClick={() => navigate("/staff/staffProfile")}>
                    👤
                </button>
            </header>

            {/* MENU */}
            <div className="menu-bar">
                <button onClick={() => navigate("/staff/staffManageBooking")}>
                    Manage Booking
                </button>
                <button onClick={() => navigate("/staff/walkingRecord")}>
                    Walking Record
                </button>
                <button className="active">
                    Manage Profile
                </button>
            </div>

            {/* SEARCH */}
            <input
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {/* TABS */}
            <div className="tab-bar">
                <button
                    className={activeTab === "dog" ? "active" : ""}
                    onClick={() => setActiveTab("dog")}
                >
                    Resident Dog
                </button>

                <button
                    className={activeTab === "staff" ? "active" : ""}
                    onClick={() => setActiveTab("staff")}
                >
                    Staff
                </button>

                <button
                    className={activeTab === "customer" ? "active" : ""}
                    onClick={() => setActiveTab("customer")}
                >
                    Customer
                </button>
            </div>

            {/* CONTENT */}
            <div className="content">
                {renderContent()}
            </div>

        </div>
    );
};

export default StaffManageProfile2;
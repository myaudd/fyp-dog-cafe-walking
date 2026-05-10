import { useNavigate } from "react-router-dom";
import {useState, useEffect} from "react";
import { supabase } from "../supabaseClient";
import "./availableStaff.css";

type Staff = {
    staffid: string;
    staffname: string;
    staffrole: string;
};

const availableStaff = () => {
    const navigate = useNavigate();
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [roles, setRoles] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    useEffect(() => {
        const fetchStaffs = async () => {
            const { data } = await supabase
                .from("staff")
                .select("*");

            if (data) {
                setStaffs(data);

            const uniqueRoles = [
                ...new Set(
                    data
                        .map(s => s.staffrole)
                        .filter(role => role && role.trim() !== "")
                )
            ];
            setRoles(uniqueRoles);
            }
        };
        fetchStaffs();
    }, []);

    const filteredStaffs = staffs
        .filter(staff =>
            staff.staffname.toLowerCase().includes(search.toLowerCase())
        )
        .filter(staff =>
            selectedRoles.length === 0 ||
            selectedRoles.includes(staff.staffrole)
        )
    
    const toggleRole = (role: string) => {
        setSelectedRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const goToBook = (id: string) => {
        navigate(`/bookStaff/${id}`);
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
                <button onClick={() => navigate(`/customer/customerHome`)}>Available dog</button>

                <button 
                    className="active"
                    onClick={() => navigate(`/customer/availableStaff`)}
                >
                    Book for your dog
                </button>

                <button onClick={() => navigate(`/customer/bookingRecord`)}>Booking record</button>
                <button onClick={() => navigate(`/customer/walkingRecord`)}>Walking record</button>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search staff..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="content">
                <div className="filter">
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

                <div className="staff-grid">
                    {filteredStaffs.map(staff => (
                        <div key={staff.staffid} className="staff-card" onClick={() => goToBook(staff.staffid)}>

                            <div className="staff-image">👤</div>

                            <div className="staff-info">
                                <div className="label">
                                    <p>Name</p>
                                    <p>Role</p>
                                </div>

                                <div className="value">
                                    <p>{staff.staffname}</p>
                                    <p>{staff.staffrole}</p>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default availableStaff;
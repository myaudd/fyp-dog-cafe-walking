import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const EditDog = () => {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const [dogID, setDogID] = useState("");
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [breed, setBreed] = useState("");
    const [size, setSize] = useState("S");
    const [gender, setGender] = useState("Male");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDog = async () => {
            if (!id) return;
            const { data, error } = await supabase
                .from("residentdog")
                .select(`
                    residentdogid,
                    residentdogname,
                    residentdogage,
                    residentdogbreed,
                    residentdogsize,
                    residentdoggender
                `)
                .eq("residentdogid", id)
                .single();
            if (error) {
                console.error(error);
                return;
            }
            setDogID(data.residentdogid);
            setName(data.residentdogname);
            setAge(data.residentdogage);
            setBreed(data.residentdogbreed);
            setSize(data.residentdogsize);
            setGender(data.residentdoggender);
        };
        fetchDog();
    }, [id]);

    const validAge = (age: string) => {
        const ageNumber = Number(age);
        return Number.isInteger(ageNumber) && ageNumber > 0;
    };

    const handleSave = async () => {
        setError("");
    
        if (!name || !age || !breed || !size || !gender) {
            setError("All fields are required.");
            return;
        }
    
        if (!validAge(age)) {
            setError("Age must be a positive whole number");
            return;
        }
        
        const { error } = await supabase
            .from("residentdog")
            .update({
                residentdogname: name,
                residentdogage: age,
                residentdogbreed: breed,
                residentdogsize: size,
                residentdoggender: gender,
            })
          .eq("residentdogid", dogID);
    
        if (error) {
          console.error(error);
          setError("Failed to update profile.");
          return;
        }
    
        alert("Profile saved!");
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure to delete profile?")) return;
    
        const { error } = await supabase
          .from("residentdog")
          .delete()
          .eq("residentdogid", dogID);
    
        if (error) {
          console.error(error);
          return;
        }
    
        alert("Profile deleted");
        navigate("/staff/staffManageProfile");
    };    

    return (
        <div className="container">
            <h1>Add a New Dog</h1>
  
            <div className="form-group">
                <label>Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
  
                <label>Age</label>
                <input
                    type="text"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                />
  
                <label>Breed</label>
                <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                />

                <label>Size</label>
                <select className="size-option"
                    value={size}
                    onChange={(e) =>
                        setSize(e.target.value as "S" | "M" | "L")
                    }
                >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                </select>
                
                <label>Gender</label>
                <select className="gender-option"
                    value={gender}
                    onChange={(e) =>
                        setGender(e.target.value as "Male" | "Female")
                    }
                >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>

                {error && <p className="error-text">{error}</p>}
                    
                <div className="button-group">
                    <button className="save-button" onClick={handleSave}>
                        Save
                    </button>
                    <button className="delete-button" onClick={handleDelete}>
                        Delete 
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditDog;
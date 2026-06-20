import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const AddDog = () => {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [breed, setBreed] = useState("");
    const [size, setSize] = useState("S");
    const [gender, setGender] = useState("Male");
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
    const validAge = (age: string) => {
        const ageNumber = Number(age);
        return Number.isInteger(ageNumber) && ageNumber > 0;
    };

    const handleSubmit = async () => {
        setError("");

        if (!name || !age || !breed || !size || !gender) {
            setError("All fields are required");
            return;
        }

        if (!validAge(age)) {
            setError("Age must be a positive whole number");
            return;
        } 

        try {
            const {error} = await supabase
                .from("residentdog")
                .insert([
                    {
                        residentdogname: name,
                        residentdogage: age,
                        residentdogbreed: breed,
                        residentdogsize: size,
                        residentdoggender: gender,
                    },
                ]);

            if (error) {
                setError(error.message);
                return;
            }
            alert("Dog added successfully");
            navigate("/staff/staffManageProfile");
        } catch (err) {
            setError("Something went wrong");
        }
    };

    return (
        <div className="container">
            <h1>Add a New Dog</h1>
  
            <div className="form-group">
                <label>Name</label>
                <input
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
  
                <label>Age</label>
                <input
                    type="text"
                    placeholder="Enter age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                />
  
                <label>Breed</label>
                <input
                    type="text"
                    placeholder="Enter breed"
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
        
                <button className="add-button" onClick={handleSubmit}>
                    Add
                </button>
            </div>
        </div>
    );
};

export default AddDog;
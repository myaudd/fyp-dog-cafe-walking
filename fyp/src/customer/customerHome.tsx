import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./customerHome.css";

type Dog = {
  residentdogid: string;
  residentdogname: string;
  residentdoggender: string;
  residentdogbreed: string;
  residentdogsize: string;
};

const customerHome = () => {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [breeds, setBreeds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);

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
  
    fetchDogs();
  }, []);

  const sizeOrder: Record<string, number> = {
    S: 1,
    M: 2,
    L: 3
  };
  
  const filteredDogs = dogs
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

  const goToDog = (id: string) => {
    window.location.href = `/dog/${id}`;
  };

  return (
    <div className="home-container">

      <header className="home-header">
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
        <button className="active">Available dog</button>
        <button>Book for your dog</button>
        <button>Booking record</button>
        <button>Walking record</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search dog..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="content">
        <div className="filter">
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

        <div className="dog-grid">
          {filteredDogs.map(dog => (
            <div key={dog.residentdogid} className="dog-card" onClick={() => goToDog(dog.residentdogid)}>
              
              <div className="dog-image">🐶</div>

              <div className="dog-info">
                <div className="label">
                  <p>Name</p>
                  <p>Gender</p>
                  <p>Breed / Size</p>
                </div>

                <div className="value">
                  <p>{dog.residentdogname}</p>
                  <p>{dog.residentdoggender}</p>
                  <p>{dog.residentdogbreed}</p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default customerHome;
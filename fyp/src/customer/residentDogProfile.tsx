import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./residentDogProfile.css";

type Dog = {
  residentdogid: string;
  residentdogname: string;
  residentdogage: number;
  residentdogbreed: string;
  residentdogsize: string;
  residentdoggender: string;
};

const ResidentDogProfile = () => {
  const navigate = useNavigate();
  const { dogId } = useParams<{ dogId: string }>(); 
  const [dog, setDog] = useState<Dog | null>(null);

  useEffect(() => {
    const fetchDog = async () => {
      const { data } = await supabase
        .from("residentdog")
        .select("*")
        .eq("residentdogid", dogId)
        .single();

      if (data) setDog(data);
    };

    fetchDog();
  }, [dogId]);

  if (!dog) return <p>Loading...</p>;

  const goToBook = (id: string) => {
    navigate(`/bookResidentDog/${id}`);
  };

  return (
    <div>
      <h1>{dog.residentdogname}</h1>

      <p>Age: {dog.residentdogage} years old</p>
      <p>Breed: {dog.residentdogbreed}</p>
      <p>Size: {dog.residentdogsize}</p>
      <p>Gender: {dog.residentdoggender}</p>

      <button onClick={() => goToBook(dog.residentdogid)}>Book me!</button>
    </div>
  );
};

export default ResidentDogProfile;
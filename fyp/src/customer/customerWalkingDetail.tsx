import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./customerWalkingDetail.css";

type WalkingType = "residentdog" | "staff";

type Walking = {
    walkingid: string;
    walkingtype: WalkingType;
    subjectid: string;
    subjectname: string;
    walkingdatetime: string;
    walkingstarttime: string;
    walkingendtime:string;
    walkingduration: string;
    walkingplace: string;
    walkingrating: number | null;
};

const CustomerWalkingDetail = () => {
    const navigate = useNavigate();
    const { type, id } = useParams(); 
    const [walking, setWalking] = useState<Walking | null>(null);

    const [rate, setRate] = useState<number>(walking?.walkingrating ?? 0);
    const [rated, setRated] = useState(false);

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoDesc, setPhotoDesc] = useState("");
    const [photos, setPhotos] = useState<any[]>([]);

    useEffect(() => {
        const fetchPhotos = async () => {
            if(!id) return;
            const { data, error } = await supabase
                .from("photo")
                .select("*")
                .eq("brdid", id)
                .order("phototimestamp", { ascending: true });
        
            if (error) {
                console.error(error);
                return;
            }
        
            setPhotos(data || []);
        };

        const fetchData = async () => {
            if (!id) return;
            if (type === "residentdog") {
                const { data, error } = await supabase
                    .from("bookingresidentdog")
                    .select(`
                        brdid,
                        residentdog (
                            residentdogid,
                            residentdogname
                        ),
                        brddatetime,
                        brdwalkstarttime,
                        brdwalkendtime,
                        brdduration,
                        brdplace
                    `)
                    .eq("brdid", id)
                    .single();
                if (error) {
                    console.error(error);
                    return;
                }
                const dog = Array.isArray(data.residentdog)
                ? data.residentdog[0]
                : data.residentdog;
                setWalking({
                    walkingid: data.brdid,
                    walkingtype: "residentdog",
                    subjectid: dog?.residentdogid ?? "",
                    subjectname: dog?.residentdogname ?? "unknown",
                    walkingdatetime: data.brddatetime,
                    walkingstarttime: data.brdwalkstarttime,
                    walkingendtime: data.brdwalkendtime,
                    walkingduration: data.brdduration,
                    walkingplace: data.brdplace,
                    walkingrating: null,
                });
                await fetchPhotos();
            } else if (type === "staff") {
                const { data, error } = await supabase
                    .from("bookingstaff")
                    .select(`
                        bsid,
                        staff (
                            staffid,
                            staffname
                        ),
                        bsdatetime,
                        bswalkstarttime,
                        bswalkendtime,
                        bsduration,
                        bsplace,
                        bsrate
                    `)
                    .eq("bsid", id)
                    .single();
                if (error) {
                    console.error(error);
                    return;
                }
                const staff = Array.isArray(data.staff)
                ? data.staff[0]
                : data.staff;
                setWalking({
                    walkingid: data.bsid,
                    walkingtype: "staff",
                    subjectid: staff?.staffid ?? "",
                    subjectname: staff?.staffname ?? "unknown",
                    walkingdatetime: data.bsdatetime,
                    walkingstarttime: data.bswalkstarttime,
                    walkingendtime: data.bswalkendtime,
                    walkingduration: data.bsduration,
                    walkingplace: data.bsplace,
                    walkingrating: data.bsrate ?? null
                });
            } else {
                console.error("invalid walking id");
            }
        };
        fetchData();
    }, [type, id]);

    const handleSubmitRating = async (value: number) => {
        if (!id || type !== "staff") return;
        if (rated) return;
    
        const { error } = await supabase
            .from("bookingstaff")
            .update({ bsrate: value })
            .eq("bsid", id);
    
        if (error) {
            console.error(error);
            return;
        }
    
        setRate(value);
        setRated(true);
    
        setWalking(prev =>
            prev ? { ...prev, walkingrating: value } : prev //check condition -> if prev is not null?
        );
    };
    
    const handleUploadPhoto = async () => {
        if (!photoFile || !id || type !== "residentdog") return;
    
        try {
            const fileType = photoFile.name.split(".").pop();
            const fileName = `${id}-${Date.now()}.${fileType}`;
            const filePath = `${fileName}`;
    
            const { error: uploadError } = await supabase.storage
                .from("resident-dog-walking-photos")
                .upload(filePath, photoFile);
    
            if (uploadError) {
                console.error(uploadError);
                return;
            }
    
            const { data: urlData } = supabase.storage
                .from("resident-dog-walking-photos")
                .getPublicUrl(filePath);
    
            const publicUrl = urlData.publicUrl;
    
            const { error: dbError } = await supabase
                .from("photo")
                .insert({
                    photourl: publicUrl,
                    photodesc: photoDesc,
                    brdid: id
                });
    
            if (dbError) {
                console.error(dbError);
                return;
            }
    
            alert("Photo uploaded successfully!");
            setPhotoFile(null);
            setPhotoDesc("");

            //refresh photo after upload
            const { data } = await supabase
                .from("photo")
                .select("*")
                .eq("brdid", id)
                .order("phototimestamp", { ascending: true });

            setPhotos(data || []);
    
        } catch (err) {
            console.error(err);
        }
    };

    const formatDateTime = (dt?: string) => {
        if (!dt) return "-";
        return new Date(dt).toLocaleString("en-MY", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDuration = (dr?: string) => {
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

    return (
        <div className="container">
            <p>Walking type: {walking?.walkingtype === "residentdog" ? "resident dog" : "staff"}</p>
            <p>Subject: {walking?.subjectname}</p>
            <p>Data & Time: {formatDateTime(walking?.walkingdatetime)}</p>
            <p>Start time: {formatDateTime(walking?.walkingstarttime)}</p>
            <p>End time: {formatDateTime(walking?.walkingendtime)}</p>
            <p>Duration: {formatDuration(walking?.walkingduration)}</p>
            <p>Place: {walking?.walkingplace}</p>

            {type === "residentdog" && (
                <div>
                    <p>Upload Photo:</p>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    />

                    <input
                        type="text"
                        placeholder="Photo description"
                        value={photoDesc}
                        onChange={(e) => setPhotoDesc(e.target.value)}
                    />

                    <button onClick={handleUploadPhoto}>
                        Upload
                    </button>
                </div>
            )}

            {type === "residentdog" && photos.length > 0 && (
                <div className="photo-section">
                    <h3>Photos</h3>

                    <div className="photo-grid">
                        {photos.map((photo) => (
                            <div key={photo.photoid} className="photo-card">
                                <img
                                    src={photo.photourl}
                                    alt={photo.photodesc}
                                    className="photo-img"
                                />
                                <p className="photo-desc">{photo.photodesc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {type === "staff" && (
                <div className="rating-section">
                    <p>Rate:</p>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className="star-btn"
                            onClick={() => handleSubmitRating(star)}
                            disabled={walking?.walkingrating != null} //user can only rate once, no update
                        >
                            {star <= (walking?.walkingrating ?? 0) ? "★" : "☆"} 
                        </button> //loop and compare the star value
                    ))}
                </div>
            )}

        </div>
    );
}

export default CustomerWalkingDetail;
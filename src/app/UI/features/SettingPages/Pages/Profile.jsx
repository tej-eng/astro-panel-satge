"use client";
import { useGetExpertProfileDetailsQuery } from "@/app/redux/slice/profileApi";
import styles from "@/app/UI/features/SettingPages/Pages/profile.module.css";
import ProfilUI from "@/app/UI/SettingUI/ProfileHeader";

export default function ProfileSettings() {
  const { data, error, isLoading } = useGetExpertProfileDetailsQuery();

  if (isLoading) return <p>Loading profile...</p>;
  if (error) return <p>Error fetching profile data.</p>;

  const profileData = data?.profileData || {};
  const languages = data?.languagess || {};
  const skills = data?.specialisationn || {};
  const address = profileData.address || {};


  return (
    <>
     <div
      className={`${styles["calling-his"]} flex items-center justify-center flex-col `}
    >
    <div className="wallet-head text-center justify-center items-center">Profile Settings</div> 
   <ProfilUI/>
    
        
      {/* <h2 className="wallet-head text-center">Profile Settings</h2> */}
      <div className={`${styles["profile-page"]} flex`}>
       
     
        <div className="p-6 w-full bg-[#ffffff6e] shadow-md rounded-2xl max-w-full mx-auto">
          <h2 className="text-lg w-full font-semibold text-gray-800 mb-4">
            Profile Information
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-4  text-gray-750 text-xs md:text-sm">
            <div className="flex-col  gap-2  ">
              <span className="  font-medium ">Real Name :</span>
              <span className="input-data bg-violet-300 outline-none border-none">{profileData.full_name|| "Not Updated"}</span>
            </div>
            <div className="flex-col  gap-2 ">
              <span className="font-medium ">Display Name:</span>
              <span className="input-data">{profileData.profile_name_en || "Not Updated"}</span>
            </div>
            <div className="flex-col  gap-2">
              <span className="font-medium ">Skill:</span>
              <span className="input-data">{skills?.join(", ") || "Not Updated"}</span>

            </div>
            <div className="flex-col  gap-2">
              <span className="font-medium ">Language:</span>
              <span className="input-data break-all">{languages?.join(", ") || "Not Updated"}</span>
            </div>
            <div className="flex-col  gap-2">
              <span className="font-medium ">Experience:</span>
              <span className="input-data break-all">{profileData.experience || "Not Updated"}</span>
            </div>
            <div className="flex-col  gap-2">
              <span className="font-medium ">Current Address:</span>
              <span className="input-data break-all ">
                {address.line1 || address.street || profileData.address || "Not Updated"}
              </span>
            </div>
            <div className="flex-col  gap-2">
              <span className="font-medium ">City:</span>
              <span className="input-data">{data.city_name || "Not Updated"}</span>
            </div>
            {/* <div className="flex-col  gap-2">
              <span className="font-medium ">Zip Code:</span>
              <span className="input-data break-all">{profileData.zipcode || "Not Updated"}</span>
            </div> */}
            <div className="flex-col gap-2">
              <span className="font-medium ">State:</span>
              <span className="input-data break-all">{data.state_name|| "Not Updated"}</span>
            </div>
            <div className="flex-col gap-2">
              <span className="font-medium">Country:</span>
              <span className="input-data break-all">{data.country_name || "Not Updated"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    </>
  );
}


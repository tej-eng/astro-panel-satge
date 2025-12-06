"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "@/app/UI/features/Offer/offer.module.css";
import { AntSwitch } from "../../SwitchButton/AntSwitch";
import { useUpdateOfferPriceMutation } from "@/app/redux/slice/offerPrice";
import { toast } from "react-toastify";
import { LOCAL_STORAGE_KEY } from "@/constant";

const Offers = () => {
  const [status, setStatus] = useState(0);
  const [astroid, setAstroid] = useState(null); 
  const reduxUserId = useSelector((state) => state.auth?.user_id);

  const [updateOfferPrice, { isLoading }] = useUpdateOfferPriceMutation();

  
  useEffect(() => {
    if (reduxUserId) {
      setAstroid(reduxUserId);
    } else if (typeof window !== "undefined") {
      const localUserId = localStorage.getItem(LOCAL_STORAGE_KEY.USER_ID);
      if (localUserId) {
        setAstroid(localUserId);
      }
    }
  }, [reduxUserId]);

  const handleToggle = async () => {
    const newStatus = status === 0 ? 1 : 0;
    setStatus(newStatus);

    try {
      const response = await updateOfferPrice({ astroid, status: newStatus }).unwrap();
      toast.success(response.message || "Offer status updated.");
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong.");
    }
  };

  if (!astroid) return null; 

  return (
    <div className={`${styles["card-panel-permi"]} flex items-center justify-center flex-col gap-4`}>
      <h2 className={`${styles["wallet-head"]} text-center py-5`}>Offers</h2>

      <div className="w-full">
        <hr />
        <div className={`${styles["tab-content"]} ${styles["b-feed-user"]} pt-3 h-screen flex justify-around`}>
          <div className={`${styles["tab-pane"]} fade show active`} id="all">
            <div className={`${styles["astro-main-ser"]} flex flex-wrap justify-center md:justify-between`}>
              <div className={`${styles["panel-access-box"]} flex items-start justify-between flex-col`}>
                <div className={`${styles["bg-glass"]} flex items-center justify-between flex-col`}>
                  <div className="w-[15rem] sm:w-[20rem] h-[3rem] flex items-start justify-between">
                    <div className="flex justify-between">
                      <span className="flex items-center">
                        <span className="text-[.6rem] md:text-[.8rem]">Offer Name: </span>
                        <h3 className="mb-0 text-[.6rem] md:text-[.8rem]">₹ 5</h3>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <span className="text-[.6rem] md:text-[.8rem]">User Type: </span>
                        <h3 className="mb-0 text-[.6rem] md:text-[.8rem]">All User</h3>
                      </span>
                    </div>
                  </div>

                  <span className="flex items-center mt-2">
                    <span className="text-[.8rem] md:text-[.9rem]">Status: </span>
                    <div className="form-check form-switch ml-3">
                      <AntSwitch
                        checked={status === 1}
                        onChange={handleToggle}
                        disabled={isLoading}
                      />
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default Offers;

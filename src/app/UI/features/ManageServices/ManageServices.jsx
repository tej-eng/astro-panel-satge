
"use client";
import { useMemo, useState } from "react";
import styles from "@/app/UI/features/ManageServices/manageservices.module.css";
import { AntSwitch } from "../../SwitchButton/AntSwitch";
import {
  useGetExpertProfileDetailsQuery,
  useGetOnlineDetailsQuery,
  useFetchPromoStatusQuery,
  useUpdateExpertStatusMutation,
} from "@/app/redux/slice/profileApi";

const ManageServices = () => {
  const { data: expertProfileData, isLoading: isExpertProfileLoading } =
    useGetExpertProfileDetailsQuery();
  const { data: onlineStatusData, isLoading: isOnlineStatusLoading } =
    useGetOnlineDetailsQuery();
  const { data: promoStatusData } = useFetchPromoStatusQuery();

  const [updateExpertStatus] = useUpdateExpertStatusMutation();
  const [localPanels, setLocalPanels] = useState([]);

  const panels = useMemo(() => {
    if (!expertProfileData || !onlineStatusData || !promoStatusData) return [];

    const profileData = expertProfileData.profileData || {};
    const onlineData = onlineStatusData || {};
    const promoLimitPrice = expertProfileData?.promoPercent || 0;

    const used = parseInt(promoStatusData?.promo_frequency_used_count || "0");
    const max = parseInt(promoStatusData?.promo_frequency || "0");
    const isPromoAllowed = promoStatusData?.is_promotional === "1";
    const isPromoOn = isPromoAllowed && used < max ? "Online" : "Offline";

    return [
      {
        type: "Chat",
        key: "chat",
        price: `₹ ${profileData.disc_chat_charge || 0}`,
        status: onlineData.is_chat_online,
        id: "flexSwitchCheckDefault1",
      },
      {
        type: "Call",
        key: "call",
        price: `₹ ${profileData.disc_call_charge || 0}`,
        status: onlineData.is_call_online,
        id: "flexSwitchCheckDefault2",
      },
      {
        type: (
          <>
            Live Stream <br /> Audio/Video
          </>
        ),
        key: "live",
        price: `₹ ${profileData.instant_audio_disc_charges || 0} / ₹ ${profileData.instant_video_disc_charges || 0}`,
        status:
          onlineData.live_status === true || onlineData.live_status === "1"
            ? "Online"
            : "Offline",
        id: "flexSwitchCheckDefault3",
      },
      {
        type: (
          <>
            Promo Offer <br /> (Serve/Limit)
          </>
        ),
        key: "promo",
        price: `₹ ${promoLimitPrice}`,
        promo: `${used} / ${max}`,
        status: isPromoOn,
        id: "flexSwitchCheckDefault4",
      },
    ];
  }, [expertProfileData, onlineStatusData, promoStatusData]);

  const displayedPanels = localPanels.length > 0 ? localPanels : panels;

  const handleToggle = async (index) => {
    const toggledPanel = displayedPanels[index];
    if (toggledPanel.key === "promo") return;

    const isTurningOn = toggledPanel.status === "Offline";
    let updatedPanels = [...displayedPanels];

    // Turn off conflicting services
    if (toggledPanel.key === "live" && isTurningOn) {
      updatedPanels = updatedPanels.map((panel) =>
        panel.key === "chat" || panel.key === "call"
          ? { ...panel, status: "Offline" }
          : panel
      );
    } else if (
      (toggledPanel.key === "chat" || toggledPanel.key === "call") &&
      isTurningOn
    ) {
      updatedPanels = updatedPanels.map((panel) =>
        panel.key === "live" ? { ...panel, status: "Offline" } : panel
      );
    }

    // Toggle current panel
    updatedPanels = updatedPanels.map((panel, i) =>
      i === index
        ? {
            ...panel,
            status: panel.status === "Offline" ? "Online" : "Offline",
          }
        : panel
    );

    setLocalPanels(updatedPanels); // Update locally to show immediate change

    const toggledType = toggledPanel.key;
    const status = isTurningOn ? 1 : 0;

    try {
      await updateExpertStatus({ availability: status, type: toggledType });
      // console.log("Status updated successfully");
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (isExpertProfileLoading || isOnlineStatusLoading) {
    return (
      <p className="text-center text-gray-600 text-lg">Loading services...</p>
    );
  }

  return (
    <div className={`${styles.cardPanelPermi} shadow-lg rounded-2xl bg-white p-6`}>
      <h2 className={`${styles.walletHead} text-center`}>Manage Services</h2>
      <div
        className={`${styles.astroMainSer} grid grid-cols-1 md:grid-cols-2  items-center flex-wrap justify-center md:justify-between`}
      >
        {displayedPanels.map((panel, index) => (
          <div
            key={panel.id}
            className={` ${styles.panelAccessCard} flex justify-between `}
          >
            <div className={`${styles.manTop} flex justify-between w-full`}>
              <span
                className={`${styles.pAType} flex flex-col w-1/3 space-y-1`}
              >
                <span className={styles.pAType}>Type</span>
                <h3 className={styles.topGreet}>{panel.type}</h3>
              </span>

              <span
                className={`${styles.innerbutton} flex flex-col w-1/3 space-y-1`}
              >
                <span className={styles.pAType}>Price</span>
                {panel.id !== "flexSwitchCheckDefault3" && (
                  <h3 className={styles.topGreet}>{panel.price}</h3>
                )}
                {panel.id === "flexSwitchCheckDefault4" && (
                  <span className={`${styles.innerbutton} flex flex-col`}>
                    <h3 className={styles.topGreet}>{panel.promo}</h3>
                  </span>
                )}
                {panel.id === "flexSwitchCheckDefault3" && (
                  <span
                    className={`${styles.innerbutton} flex flex-col pt-4.5`}
                  >
                    <h3 className={styles.topGreet}>{panel.price}</h3>
                  </span>
                )}
              </span>

              <span className={`${styles.pAT} flex flex-col w-1/4`}>
                <span className={styles.pAType}>Status</span>

                <AntSwitch
                  checked={panel.status === "Online"}
                  onChange={() => handleToggle(index)}
                  disabled={panel.key === "promo"}
                  title={
                    panel.key === "promo"
                      ? "Auto controlled. Resets every 24h."
                      : ""
                  }
                />
              </span>

              <div className="pt-4">
                <span
                  className={`${
                    styles.onlineType
                  } p-[.5rem] px-[.3rem] text-[.8rem] md:text-[.9rem] md:p-[.35rem] ${
                    panel.status === "Online"
                      ? "bg-green-500"
                      : "bg-red-500"
                  } bg-opacity-50 px-3 py-1 rounded-lg text-white`}
                >
                  {panel.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageServices;

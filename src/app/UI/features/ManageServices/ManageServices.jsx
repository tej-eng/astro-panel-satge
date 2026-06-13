
"use client";
import { useState } from "react";
import styles from "@/app/UI/features/ManageServices/manageservices.module.css";
import { AntSwitch } from "../../SwitchButton/AntSwitch";


const ManageServices = () => {
 
 const [panels, setPanels] = useState([
  {
    type: "Chat",
    key: "chat",
    price: "₹ 20",
    status: "Online",
    id: "flexSwitchCheckDefault1",
  },
  {
    type: "Call",
    key: "call",
    price: "₹ 30",
    status: "Offline",
    id: "flexSwitchCheckDefault2",
  },
  {
    type: (
      <>
        Live Stream <br /> Audio/Video
      </>
    ),
    key: "live",
    price: "₹ 50 / ₹ 100",
    status: "Offline",
    id: "flexSwitchCheckDefault3",
  },
  {
    type: (
      <>
        Promo Offer <br /> (Serve/Limit)
      </>
    ),
    key: "promo",
    price: "₹ 10",
    promo: "2 / 10",
    status: "Online",
    id: "flexSwitchCheckDefault4",
  },
]);

const handleToggle = (index) => {
  const toggledPanel = panels[index];

  if (toggledPanel.key === "promo") return;

  const isTurningOn = toggledPanel.status === "Offline";

  let updatedPanels = [...panels];

  if (toggledPanel.key === "live" && isTurningOn) {
    updatedPanels = updatedPanels.map((panel) =>
      panel.key === "chat" || panel.key === "call"
        ? { ...panel, status: "Offline" }
        : panel
    );
  } else if (
    (toggledPanel.key === "chat" ||
      toggledPanel.key === "call") &&
    isTurningOn
  ) {
    updatedPanels = updatedPanels.map((panel) =>
      panel.key === "live"
        ? { ...panel, status: "Offline" }
        : panel
    );
  }

  updatedPanels[index].status =
    updatedPanels[index].status === "Online"
      ? "Offline"
      : "Online";

  setPanels(updatedPanels);
};

 

  return (
    <div className={`${styles.cardPanelPermi} shadow-lg rounded-2xl bg-white p-6`}>
      <h2 className={`${styles.walletHead} text-center`}>Manage Services</h2>
      <div
        className={`${styles.astroMainSer} grid grid-cols-1 md:grid-cols-2  items-center flex-wrap justify-center md:justify-between`}
      >
        {panels.map((panel, index) => (
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

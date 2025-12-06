import React from 'react';
import Link from 'next/link'; 
import styles from '@/app/UI/features/buttonui/buttonui.module.css'

const ButtonTileList = () => {
  
  const links = [
    { href: './dashboard/callhistory', label: 'Call' },
    { href: './dashboard/chathistory', label: 'Chat' },
    // { href: '#', label: 'Report' },
    { href: './dashboard/storehistory', label: 'Dhwani Store' },
    { href: './dashboard/waitlist', label: 'Waitlist' },
    { href: './dashboard/wallet', label: 'Wallet' },
    // { href: '#', label: 'Support' },
    { href: './dashboard/offer', label: 'Offers' },
    { href: './dashboard/myreview', label: 'My Review' },
    { href: './dashboard/remedy', label: 'Remedies' },
    { href: './dashboard/liveevent', label: 'Live Events' },
    { href: './dashboard/earningdash', label: 'Earnings' },
    { href: './dashboard/myfollower', label: 'My Followers' },
    { href: '/dashboard/setting/profilesetting', label: 'Profile' },
    // { href: './setting', label: 'Settings' },
    // { href: '#', label: 'Warnings' },
  ];

  return (
    <div className={` ${styles.container} gap-[1rem] grid grid-cols-2  xl:grid-cols-4`}>
      {links.map((link, index) => (
        <Link key={index} href={link.href} className={styles.buttonTile}>
          {link.label}
        </Link>
      ))}
    </div>
  );
};

export default ButtonTileList;

import NotificationsIcon from '@mui/icons-material/Notifications';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DownloadIcon from '@mui/icons-material/Download';
import { useCallback, useEffect, useRef } from 'react';

const SecondaryDropDownMenu = ({ setToggleSecondaryDropDown }) => {
    const dropdownRef = useRef(null);
    const handleClickOutside = useCallback((event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setToggleSecondaryDropDown(false);
        }
      }, [setToggleSecondaryDropDown]);
    
      useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
          document.removeEventListener('click', handleClickOutside);
        };
      }, [handleClickOutside]);

    const navs = [
        {
            title: "Notification Preferences",
            icon: <NotificationsIcon sx={{ fontSize: "18px" }} />,
            redirect: "https://www.atemkart.com/communication-preferences/push",
        },
        {
            title: "Sell on AtEMkart",
            icon: <BusinessCenterIcon sx={{ fontSize: "18px" }} />,
            redirect: "https://seller.atemkart.com/sell-online",
        },
        {
            title: "24x7 Customer Care",
            icon: <LiveHelpIcon sx={{ fontSize: "18px" }} />,
            redirect: "https://www.atemkart.com/helpcentre",
        },
        {
            title: "Advertise",
            icon: <TrendingUpIcon sx={{ fontSize: "18px" }} />,
            redirect: "https://advertising.atemkart.com",
        },
        {
            title: "Download App",
            icon: <DownloadIcon sx={{ fontSize: "18px" }} />,
            redirect: "https://www.atemkart.com/mobile-apps",
        },
    ]

    return (
        <div ref={dropdownRef} className="absolute w-60 top-9 bg-white shadow-2xl rounded flex-col text-sm">
            {navs?.map((item, i) => {
                const { title, icon, redirect } = item;
                return (
                    <a className="pl-3 py-3.5 border-b flex gap-3 items-center hover:bg-gray-50 rounded-t" href={redirect} key={i} onClick={() => setToggleSecondaryDropDown(false)}>
                        <span className="text-primary-blue">{icon}</span>
                        {title}
                    </a>
                )
            })}
            <div className="absolute right-1/2 -top-2.5">
                <div className="arrow_down"></div>
            </div>
        </div>
    );
};

export default SecondaryDropDownMenu;

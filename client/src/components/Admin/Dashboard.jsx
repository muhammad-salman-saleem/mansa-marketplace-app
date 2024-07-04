import { useEffect, useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import MenuIcon from '@mui/icons-material/Menu';

const Dashboard = ({ activeTab, children }) => {

    const [onMobile, setOnMobile] = useState(false);
    const [toggleSidebar, setToggleSidebar] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setOnMobile(window?.innerWidth < 600);
        };

        window?.addEventListener('resize', handleResize);
        handleResize();
        return () => window?.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <main className="flex xl:gap-20 lg:gap-0 md:gap-1 sm:gap-4 min-h-screen mt-14 sm:min-w-full">
                <div>
                    {!onMobile && <Sidebar activeTab={activeTab} />}
                    {toggleSidebar && <Sidebar activeTab={activeTab} setToggleSidebar={setToggleSidebar} />}
                </div>


                <div className="w-full sm:w-4/5 sm:ml-[23%] lg:ml-[24%] xl:ml-[14%] 2xl:ml-[14%] min-h-screen">
                    <div className="flex flex-col gap-6 sm:m-8 p-2 pb-6 overflow-hidden">
                        <button onClick={() => setToggleSidebar(true)} className="sm:hidden bg-gray-700 w-10 h-10 rounded-full shadow text-white flex items-center justify-center"><MenuIcon /></button>
                        {children}
                    </div>
                </div>
            </main>
        </>
    );
};

export default Dashboard;

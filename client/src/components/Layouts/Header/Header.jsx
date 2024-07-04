import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Searchbar from './Searchbar';
import logo from '../../../assets/images/logo.png';
import PrimaryDropDownMenu from './PrimaryDropDownMenu';
import SecondaryDropDownMenu from './SecondaryDropDownMenu';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import { Avatar } from '@mui/material';

const Header = () => {

  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { cartItems } = useSelector(state => state.cart);
  const [togglePrimaryDropDown, setTogglePrimaryDropDown] = useState(false);
  const [toggleSecondaryDropDown, setToggleSecondaryDropDown] = useState(false);
  const location = useLocation();
  const handlePrimaryLinkClick = () => {
    setTogglePrimaryDropDown(false);
  };

  const isSearchBarVisible = !(location.pathname.startsWith('/admin/') && user?.role === "admin");
  return (

    <header className="bg-primary-blue fixed top-0 py-2.5 w-full z-10">
      {/* <!-- navbar container --> */}
      <div className="w-full sm:w-9/12 px-1 sm:px-4 lg:px-0 m-auto flex justify-between items-center relative">
        {/* <!-- logo & search container --> */}
        <div className="flex items-center flex-1 pr-4">
          <Link className="h-7 mr-1 sm:mr-4" to="/">
            <img draggable="false" className="h-full w-full object-contain" src={logo} alt="AtEMkart Logo" />
          </Link>
          {!isSearchBarVisible ? (
            <div className=" px-1 sm:px-4 py-1.5 flex   bg-transparent  overflow-hidden">

              <button className="text-transparent cursor-default" disabled={true}><SearchIcon /></button>
            </div>
          ) : (
            <Searchbar />
          )}
        </div>
        {/* <!-- logo & search container --> */}
        {/* <!-- right navs --> */}
        <div className="flex items-center justify-between ml-1 sm:ml-0 gap-0.5 sm:gap-7 relative">
          {isAuthenticated === false ? (
            <Link to="/login" className="px-3 sm:px-9 py-0.5 text-primary-blue bg-white border font-medium rounded-sm cursor-pointer">
              Login
            </Link>
          ) : (
            <div className="userDropDown flex items-center text-white font-medium gap-1 cursor-pointer" onClick={() => setTogglePrimaryDropDown(!togglePrimaryDropDown)}>
              {user?.avatar && user?.avatar?.url ? (
                <Avatar alt="Avatar" src={user?.avatar?.url} />
              ) : (
                <Avatar alt="Avatar" src='https://cdn-icons-png.flaticon.com/512/266/266033.png' />
              )}
              <span>{togglePrimaryDropDown ? <ExpandLessIcon sx={{ fontSize: "16px" }} /> : <ExpandMoreIcon sx={{ fontSize: "16px" }} />}</span>
            </div>
          )}

          {togglePrimaryDropDown && <PrimaryDropDownMenu setTogglePrimaryDropDown={setTogglePrimaryDropDown} user={user} onLinkClick={handlePrimaryLinkClick} />}

          <span className="moreDropDown hidden sm:flex items-center text-white font-medium gap-1 cursor-pointer" onClick={() => setToggleSecondaryDropDown(!toggleSecondaryDropDown)}>More
            <span>{toggleSecondaryDropDown ? <ExpandLessIcon sx={{ fontSize: "16px" }} /> : <ExpandMoreIcon sx={{ fontSize: "16px" }} />}</span>
          </span>

          {toggleSecondaryDropDown && <SecondaryDropDownMenu setToggleSecondaryDropDown={setToggleSecondaryDropDown} />}

          {isSearchBarVisible && <Link to="/cart" className="flex items-center text-white font-medium gap-2 relative">
            <span><ShoppingCartIcon /></span>
            {cartItems.length > 0 &&
              <div className="w-5 h-5 p-2 bg-red-500 text-xs rounded-full absolute -top-2 left-3 flex justify-center items-center border">
                {cartItems.length}
              </div>
            }
            Cart
          </Link>}
        </div>
        {/* <!-- right navs --> */}

      </div>
      {/* <!-- navbar container --> */}
    </header>
  )
};

export default Header;

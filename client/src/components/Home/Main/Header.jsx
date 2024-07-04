import { useState } from "react";
import LogoImg from "../../../assets/images/logo.png";
import MobileLogoImg from "../../../assets/images/logo-mobile.png";
import SelectWrapper from "./SelectWrapper";

const Header = (props) => {
    const [chainID, setChainID] = useState();

    const url = window.location.pathname;
    const [showDropDown, setShowDropDown] = useState(false);
    
    const handleBtn = () => {
    }


    const outSelectChainClickFunc = () => {
        setShowDropDown(false)
    }

    const connectWallet = async () => {

    }

    const handleChainID = (id) => {
        setChainID(id);
    }

    return (
        <div className="flex justify-between items-center py-8 px-2 md:px-24 lg:px-38 xl:px-48 2xl:px-58">
            <a className="hidden lg:block w-52" onClick={handleBtn}><img src={LogoImg} alt="logo" /></a>
            <a className="block lg:hidden w-10" onClick={handleBtn}><img src={MobileLogoImg} alt="logo" /></a>
            {
                url !== "/mobile" &&
                    <div className="flex flex-row">
                        <SelectWrapper outSideClickFunc={outSelectChainClickFunc}>
                            <div className="relative text-white font-bold">
                                <div 
                                    onClick={() => setShowDropDown(!showDropDown)}
                                    className="px-4 py-3 border-2 rounded-lg border-white mr-2 cursor-pointer"
                                >
                                    <span className="hidden md:block">Select Network</span>
                                </div>
                                <div className={`absolute flex-col mt-2  md:right-0 w-max dropdown-bg p-2 z-10 ${showDropDown ? "flex" : "hidden"}`}>
                                    <div 
                                        className={`px-4 py-2 cursor-pointer ${!chainID ? "custom-gradient" : "dropdown-item"} mb-2 rounded-lg text-center`}
                                        onClick={() => handleChainID(null)}
                                    >
                                        Solana
                                    </div>
                                    <div 
                                        // className={`px-4 py-2 cursor-pointer opacity-30 dropdown-item mb-2 rounded-lg`}
                                        className={`px-4 py-2 cursor-pointer ${chainID === 1 ? "custom-gradient" : "dropdown-item"} mb-2 rounded-lg text-center`}
                                        onClick={() => handleChainID(1)}
                                        >
                                        Ethereum
                                    </div>
                                    <div 
                                        className={`px-4 py-2 cursor-pointer ${chainID === 2 ? "custom-gradient" : "dropdown-item"} mb-2 rounded-lg text-center`}
                                        onClick={() => handleChainID(2)}
                                        >
                                        Binance Smart Chain
                                    </div>
                                    <div 
                                        className={`px-4 py-2 cursor-pointer ${chainID === 3 ? "custom-gradient" : "dropdown-item"} mb-2 rounded-lg text-center`}
                                        onClick={() => handleChainID(3)}
                                        >
                                        Avalanche
                                    </div>
                                    <div 
                                        className={`px-4 py-2 cursor-pointer ${chainID === 4 ? "custom-gradient" : "dropdown-item"} mb-2 rounded-lg text-center`}
                                        onClick={() => handleChainID(4)}
                                    >
                                        Polygon
                                    </div>
                                </div>
                            </div>
                        </SelectWrapper>
                        <div className="connect-wallet-button" onClick={connectWallet}>Select Wallet</div>
                    </div>
            }
        </div>
    );
}

export default Header;
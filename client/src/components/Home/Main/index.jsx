import MainContainer from "./MainContainer";
import InfoContainer from "./InfoContainer";
import CashContainer from "./CashContainer";
import FeatureContainer from "./FeatureContainer";
import FaqContainer from "./FaqContainer";
import GuideContainer from "./GuideContainer";
import Header from "./Header";

const Home = () => {
    return (
        <div className="flex flex-col text-white">
            <Header />
            <MainContainer />
            <InfoContainer />
            <CashContainer />
            <FeatureContainer />
            <GuideContainer />
            <FaqContainer />
        </div>
    )
}

export default Home;
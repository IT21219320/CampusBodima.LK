import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const OwnerRoute = () => {
    const { userInfo } = useSelector((state) => state.auth);
    return (userInfo.userType === 'owner') ? <Outlet /> : <Navigate to='/' replace />;
};

export default OwnerRoute;
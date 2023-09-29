import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const OccupantRoute = () => {
    const { userInfo } = useSelector((state) => state.auth);
    return (userInfo.userType === 'occupant') ? <Outlet /> : <>{toast.error('Please login as an occupant to continue!')}<Navigate to='/' replace /></>;
};

export default OccupantRoute;
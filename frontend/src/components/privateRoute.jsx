import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const PrivateRoute = () => {
    const { userInfo } = useSelector((state) => state.auth);
    return userInfo ? <Outlet /> : <>{toast.error('Please login to continue!')}<Navigate to='/login' replace /></>;
};

export default PrivateRoute;
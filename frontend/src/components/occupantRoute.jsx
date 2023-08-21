import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = () => {
    const { userInfo } = useSelector((state) => state.auth);
    return (userInfo.userType === 'occupant') ? <Outlet /> : <Navigate to='/' replace />;
};

export default AdminRoute;
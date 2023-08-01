import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = () => {
    const { userInfo } = useSelector((state) => state.auth);
    return (userInfo.accType === 'admin') ? <Outlet /> : <Navigate to='/' replace />;
};

export default AdminRoute;
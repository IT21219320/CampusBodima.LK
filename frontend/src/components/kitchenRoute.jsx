import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const KitchenRoute = () => {
    const { userInfo } = useSelector((state) => state.auth);
    return (userInfo.userType === 'kitchen') ? <Outlet /> : <>{toast.error('Please login as an Kitchen User to continue!')}<Navigate to='/' replace /></>;
};

export default KitchenRoute;
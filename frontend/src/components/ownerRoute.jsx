import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const OwnerRoute = () => {
    const { userInfo } = useSelector((state) => state.auth);
    return (userInfo && userInfo.userType === 'owner') ? <Outlet /> : <>{toast.error('Please login as an owner to continue!')}<Navigate to='/' replace /></>;
};

export default OwnerRoute;
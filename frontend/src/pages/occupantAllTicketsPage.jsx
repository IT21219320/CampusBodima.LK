import { useEffect, useState } from "react"
import { useGetUserTicketsMutation } from "../slices/ticketsApiSlices";
import { toast } from "react-toastify";


const occupantAllTickets = () =>{

    const [tickets, setTickets] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState();
    const [pageSize, setPageSize] = useState();

    const { userInfo } = useSelector((state) => state.auth);

console.log(userInfo);

    const [getUserTickets, { isLoading }] = useGetUserTicketsMutation;
    
    const loadData = async (pageNo) => {
        try{
            
            const res = await getUserTickets( {id:} ).unwrap();
            setTickets(res.tickets);
            setTotalPages(res.totalPages);
            setPageSize(res.pageSize);
        } catch(err){
            toast.error(err.data?.message || err.error);
        }

    }

    useEffect(() => {
        //loadData(page);
    },[]);

    const handlePageChange = (event, value) =>{
        setPage(value);
        loadData(value);
        console.log(tickets);
    }
    return

    




}
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Row, Col, Table, Button, Form,Card } from 'react-bootstrap';
import { Link, Pagination, CircularProgress,IconButton,Paper,InputBase } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import KitchenIcon from '@mui/icons-material/Kitchen';
import { BrowserUpdated as BrowserUpdatedIcon } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Search } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useGetBoardingIngredientsMutation, useDeleteIngredientsMutation } from '../slices/ingredientsApiSlice';
import { toast } from 'react-toastify';
import ingredientStyles from '../styles/ingredientStyles.module.css'; 
import CreateBoardingStyles from '../styles/createBoardingStyles.module.css';
import { Link as CustomLink } from "react-router-dom";

 

const AllIngredients = ({ boardingId }) => {
    
    const theme = useTheme();

    //const [activeImage, setActiveImage] = useState(0);
     
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState();
    const [ingredients, setIngredients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [getBoardingIngredient, { isLoading }] = useGetBoardingIngredientsMutation();
    const [deleteBoardingIngredient, { isLoading2 }] = useDeleteIngredientsMutation();

    const { userInfo } = useSelector((state) => state.auth);
     

    const loadData = async (pageNo) => {
        try {
            if (boardingId) {
    
                const res = await getBoardingIngredient({boardingId,pageNo,searchQuery}).unwrap();

                setIngredients(res.ingredient);
                setTotalPages(res.totalPages);
            }
        } catch (err) {
            toast.error(err.data?.message || err.error);
        }
    }

    useEffect(() => {
        loadData(page);     
    },[boardingId,searchQuery]);

    const handlePageChange = (event, value) => {
        setPage(value);
        loadData(value);    
            
    };

    const handleDeleteIngredient = async (boardingId, ingredientId) => {
        try {
          const data = `${boardingId}/${ingredientId}`;
          const res = await deleteBoardingIngredient(data).unwrap();
          
          if (res.message == "Ingredient deleted successfully") {
            toast.success("Ingredient deleted successfully");
            loadData(page);
          } else {
            toast.error("Failed to delete ingredient");
          }
        } catch (err) {
          toast.error(err.data?.message || err.error);
        }
      };

    
    return(
        <>
            <Row style={{textAlign:'right', marginBottom:'20px'}}>
                <Col className="mt-4">
                <Paper
                    component="form"
                    sx={{ p: '2px 4px', mb:'10px', display: 'flex', alignItems: 'center', width: 400 }}
                >
                    <InputBase
                        sx={{ ml: 1, pl:'10px', flex: 1 }}
                        placeholder="Search Ingredients"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                        <Search />
                    </IconButton>
                </Paper>
                </Col>
                <Col><Link href={`/${userInfo.userType}/ingredient/add`}><Button className="mt-4" style={{background: '#685DD8'}}><KitchenIcon/> Add New Ingredient</Button></Link></Col>
            </Row>
            <Row style={{minHeight:'calc(100vh - 240px)'}}>
                <Col lg={10}>
                    {isLoading ? (
                        <div style={{width:'100%',height:'100%',display: 'flex',alignItems: 'center',justifyContent: 'center'}}>
                            <CircularProgress />
                        </div> 
                        ): ingredients.length > 0 ? (
                            <Table className={ingredientStyles.customtable} striped bordered hover >
                            <thead>
                                <tr>
                                <th>Ingredient Name</th>
                                <th>Available Quantity</th>
                                <th>Alert At</th>
                                <th>Purchase Date</th>
                                <th>Option</th>  
                                </tr>
                            </thead>
                            <tbody>
                            {ingredients.map((ingredient, index) => (
                                <tr key={index} className={`${ingredient.sortField < 1 ? (ingredient.sortField <= 0.3 ? ingredientStyles.veryLowAlert : (ingredient.sortField <= 0.6 ? ingredientStyles.lowAlert : ingredientStyles.alert)) : ''}`}>
                                <td>{ingredient.ingredientName}</td>
                                <td>{ingredient.quantity}</td>
                                <td>{ingredient.measurement}</td>
                                <td>{ingredient.purchaseDate}</td>
                                <td className={ingredientStyles.nohover}> 
                                    <CustomLink to={`/${userInfo.userType}/ingredient/update/${boardingId}/${ingredient._id}`}>
                                        <Button  className={CreateBoardingStyles.submitBtn} style={{ marginRight: '10px' }}>
                                        <BrowserUpdatedIcon /> Update
                                        </Button>
                                    </CustomLink>
                                        <Button  
                                        className={ingredientStyles.deleteBtn}
                                        onClick={() => handleDeleteIngredient(boardingId, ingredient._id)}
                                        >
                                        <DeleteIcon /> Delete
                                        </Button>
                                </td> 
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                            
                        ):(
                            <div style={{height:'100%', width:'100%',display:'flex',justifyContent:'center',alignItems:'center', color:'dimgrey'}}>
                                {boardingId ? ( 
                                    <h2>You don't have any Ingredients!</h2>
                                ) : (
                                  <>
                                    {userInfo.userType === 'owner' ? (
                                      <h2>Please Select a boarding!</h2>
                                    ) : (
                                      <h2>You do not assign to any boarding!</h2>
                                    )}
                                  </>
                                )}
                            </div>
                    )}
                </Col>
                <Col>
                <Card>
                <Card.Header>Legend !</Card.Header>
                <Card.Body>
                    <Row>
                    <Col lg={1}><div style={{width:'20px', height:'20px', background:'#f66257', borderRadius:'5px'}}></div></Col> - <Col>{"Quantity <= 30% of Alert level"}</Col>
                    </Row>
                    <Row>
                    <Col lg={1}><div style={{width:'20px', height:'20px', background:'rgb(248, 161, 0)', borderRadius:'5px'}}></div></Col> - <Col>{"Quantity <= 60% of Alert level"}</Col>
                    </Row>
                    <Row>
                    <Col lg={1}><div style={{width:'20px', height:'20px', background:'#f5e550', borderRadius:'5px'}}></div></Col> - <Col>{"Quantity < 100% of Alert level"}</Col>
                    </Row>
                </Card.Body>
                </Card>
                </Col>
            </Row>
            {totalPages <= 1 ? <></> : 
            <Row>
                <Col className="mt-3"><Pagination count={totalPages} page={page} onChange={handlePageChange} shape="rounded" disabled={isLoading} style={{float:'right'}}/></Col>
            </Row>
            }
        </>
    );
};

export default AllIngredients;
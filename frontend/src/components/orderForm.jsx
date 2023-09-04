import React, { useState } from 'react';

   const OrderForm = () => {
     const [formData, setFormData] = useState({
       product: '',
       foodType:'',
       quantity: '',
       price: '',
     });

     const handleSubmit = async (e) => {
       e.preventDefault();
       // Send a POST request to your backend API to create an order
       try {
         const response = await fetch('/api/orders/create', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify(formData),
         });
         const data = await response.json();
         console.log('Order created:', data);
         // You can update your UI or perform other actions here
       } catch (error) {
         console.error('Error creating order:', error);
       }
     };

     return (
       <form onSubmit={handleSubmit}>
         <input
           type="text"
           placeholder="Product"
           value={formData.product}
           onChange={(e) => setFormData({ ...formData, product: e.target.value })}
         />
         <input
           type="text"
           placeholder="Food Type"
           value={formData.foodType}
           onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
         />
         <input
           type="number"
           placeholder="Quantity"
           value={formData.quantity}
           onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
         />
         <input
           type="number"
           placeholder="Price"
           value={formData.price}
           onChange={(e) => setFormData({ ...formData, price: e.target.value })}
         />
         <button type="submit">Create Order</button>
       </form>
     );
   };

   export default OrderForm;

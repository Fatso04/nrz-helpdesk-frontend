import React, { useState, useEffect } from 'react';
import TicketForm from './TicketForm';
import axios from 'axios';

const ParentComponent = ({ user, setTickets, tickets, socket }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users'); // Adjust the URL as needed
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <TicketForm 
      user={user} 
      setTickets={setTickets} 
      tickets={tickets} 
      socket={socket} 
      users={users} // Pass users here
    />
  );
};

export default ParentComponent;
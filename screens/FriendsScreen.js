import { View, Text } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { UserType } from '../UserContext';
import User from '../components/User';
import axios from 'axios';
import FriendRequest from '../components/FriendRequest';
const FriendsScreen = () => {
 const {userId, setUserId} = useContext(UserType);
 const [requests, setRequests] = useState([]);
 useEffect(()=>{
    fetchRequests();
 }, []);

 const fetchRequests = async() => {
    try {
        const response = await axios.get(`http://192.168.1.7:8000/friend-request/${userId}`);
        if(response.status === 200){
            const friendRequests = response.data.map((user)=>(
                {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    image: user.image
                }
            ))
            setRequests(friendRequests);
        }
    } catch (error) {
       console.log("Error fetching requests", error.message); 
    }
 };

 console.log("requests", requests);

  return (
    <View style={{ padding: 10, marginHorizontal: 12 }}>
    {requests.length > 0 && <Text>Your Friend Requests!</Text>}

    {requests.map((item, index) => (
      <FriendRequest
        key={index}
        item={item}
        friendRequests={requests}
        setFriendRequests={setRequests}
      />
    ))}
  </View>
  )
}

export default FriendsScreen
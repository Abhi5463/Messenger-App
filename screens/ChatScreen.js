import { ScrollView , Pressable} from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { UserType } from '../UserContext'
import axios from 'axios';
import UserChat from '../components/UserChat';

const ChatScreen = () => {
const {userId, setUserId} = useContext(UserType);
const [acceptedFriends, setAcceptedFriends] = useState([]);
useEffect(() =>{
 const fetchFriends = async() =>{
  try {
    const response = await axios.get(`http://192.168.1.7:8000/accepted-friends/${userId}`);
    if(response.status == 200){
     setAcceptedFriends(response.data);
    }
  } catch (error) {
    console.log("Error fetching friends", error);
  }
 }
    
 fetchFriends();
 },[]);
console.log(acceptedFriends, "acceptedFriends");
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Pressable>
          {acceptedFriends.map((item,index) => (
              <UserChat key={index} item={item}/>
          ))}
      </Pressable>
    </ScrollView>
  )
}

export default ChatScreen
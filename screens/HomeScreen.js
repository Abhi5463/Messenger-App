import { View, Text } from 'react-native'
import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import jwt_decode from 'jwt-decode'
import {UserType} from '../UserContext'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons';
import User from '../components/User'

const HomeScreen = () => {
    const [users, setUsers] = useState([]);
    const { userId, setUserId} = useContext(UserType);
    const navigation = useNavigation();
    useLayoutEffect(() => {
        navigation.setOptions({
          headerTitle: "",
          headerLeft: () => (
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>Quick Chat</Text>
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons onPress={() => navigation.navigate("Chat")} name="chatbox-ellipses-outline" size={24} color="black" />
              <Ionicons
                onPress={() => navigation.navigate("Friends")}
                name="people-outline"
                size={24}
                color="black"
              />
            </View>
          ),
        });
      }, []);
    

    useEffect(()=> {
        const fetchUser = async () => {
        const token = await AsyncStorage.getItem("authToken");
        const decoded_token = jwt_decode(token);
        const userId = decoded_token.userId;
        setUserId(userId);
        axios.get(`http://192.168.1.7:8000/users/${userId}`).then((response)=>{
            setUsers(response.data)
        }).catch((error)=>{
              console.log("error retrieving user", error);
        })
        }

       fetchUser();
    }, [])
    console.log(users);
  return (
    <View>
      <View style={{ padding: 10 }}>
        {users.map((item, index) => (
          <User key={index} item={item} />
        ))}
      </View>
    </View>
  )
}

export default HomeScreen
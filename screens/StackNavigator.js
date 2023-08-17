import React, { Component } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import HomeScreen from './HomeScreen';
import FriendsScreen from './FriendsScreen';
import ChatScreen from './ChatScreen';
import ChatMessageScreen from './ChatMessageScreen';

const Stack = createNativeStackNavigator();
export class StackNavigator extends Component {
  render() {
    return (
        <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Friends" component={FriendsScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Message" component={ChatMessageScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
}

export default StackNavigator
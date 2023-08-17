import { View, Text, TextInput, KeyboardAvoidingView, ScrollView, Pressable, Image } from 'react-native'
import React, {useContext, useEffect, useLayoutEffect, useRef, useState} from 'react'
// import { KeyboardAvoidingView, ScrollView } from 'react-native-web'
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import EmojiSelector from 'react-native-emoji-selector';
import { UserType } from '../UserContext';
import { useRoute,useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Cloudinary } from 'cloudinary-react-native';


const imageuploadHandler = async (img) => {
  const base64Img = `data:image/jpg;base64,${img}`;
  const apiUrl = 'https://api.cloudinary.com/v1_1/do82bf4q4/image/upload';
  
  const data = {
    "file": base64Img,
    "upload_preset": "rxu9mt0a",
  };

  try {
    const response = await fetch(apiUrl, {
      body: JSON.stringify(data),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
    });

    const responseData = await response.json();
    console.log("data.secure_url", responseData.secure_url);
    return responseData?.secure_url;
  } catch (error) {
    console.log("Error uploading image:", error);
    return null; // or handle the error case as needed
  }
};


const ChatMessageScreen = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [recepientData, setRecepientData] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const route= useRoute();
  const navigation = useNavigation();
  const { recepientId } = route.params;
  const { userId, setUserId } = useContext(UserType);

  const pickImage = async () => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });
  
      // console.log("here",result.assets[0].base64);
  
      if (!result.canceled) {
        const imageUri = await imageuploadHandler(result.assets[0].base64)
        console.log("imageeUri from pickImage",imageUri);
        await handleSend("image", imageUri);
      }
    };


  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollToBottom()
  },[]);

  const scrollToBottom = () => {
      if(scrollViewRef.current){
          scrollViewRef.current.scrollToEnd({animated:false})
      }
  }

  const handleContentSizeChange = () => {
      scrollToBottom();
  }


  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://192.168.1.7:8000/messages/${userId}/${recepientId}`
      );
      const data = await response.json();

      if (response.ok) {
        setMessages(data);
      } else {
        console.log("error showing messags", response.status.message);
      }
    } catch (error) {
      console.log("error fetching messages", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleEmojiPress = () => {
    setShowEmoji(!showEmoji);
  }

  const handleSend = async (messageType, imageUri) => {
    console.log("send", messageType, imageUri);
    try {
      const messageData = {
        senderId: userId,
        recepientId: recepientId,
        messageType: messageType,
        messageText: message, 
        imageUrl: imageUri,
      };
  
      // Send the message data to the server to save the message in the database
      const response = await fetch('http://192.168.1.7:8000/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
  
      if (response.ok === true) {
        setMessage('');
        setSelectedImage('');
        fetchMessages();
      } else {
        console.log('Response status:', response.status);
        console.log('Response body:', await response.text());
      }
    } catch (error) {
      console.log('Error sending message', error);
    }
  };
  
  useEffect(()=> {
   const fetchHeaderDetails = async () => {
    try {
      const response = await axios.get(`http://192.168.1.7:8000/user/${recepientId}`);
      // console.log(response, "response");
      const data = await response.data;
      if(response.status == 200){
        setRecepientData(data);
        console.log("Recepient data received")
      }
      
    } catch (error) {
      console.log("error fetching recepient details", error);
    }
   }
   fetchHeaderDetails();
  },[])
// console.log(recepientData, "recepient details");
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back"
            size={24}
            color="black"
          />
                      {selectedMessages.length > 0 ? (
            <View>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {selectedMessages.length}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  resizeMode: "cover",
                }}
                source={{ uri: recepientData?.image }}
              />

              <Text style={{ marginLeft: 5, fontSize: 15, fontWeight: "bold" }}>
                {recepientData?.name}
              </Text>
            </View>
          )}
        </View>
      ),

      headerRight: () =>
      selectedMessages.length > 0 ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons name="md-arrow-redo-sharp" size={24} color="black" />
          <Ionicons name="md-arrow-undo" size={24} color="black" />
          <FontAwesome name="star" size={24} color="black" />
          <MaterialIcons
            onPress={() => deleteMessages(selectedMessages)}
            name="delete"
            size={24}
            color="black"
          />
        </View>
        ) : null,
    });
  }, [recepientData, selectedMessages]);

  const deleteMessages = async (messageIds) => {
    try {
      const response = await fetch("http://192.168.1.7:8000/deleteMessages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: messageIds }),
      });

      if (response.ok) {
        setSelectedMessages((prevSelectedMessages) =>
        prevSelectedMessages.filter((id) => !messageIds.includes(id))
      );

        fetchMessages();
      } else {
        console.log("error deleting messages", response.status);
      }
    } catch (error) {
      console.log("error deleting messages", error);
    }
  };
  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };

  const handleSelectMessage = (message) => {
    //check if the message is already selected
    const isSelected = selectedMessages.includes(message._id);

    if (isSelected) {
      setSelectedMessages((previousMessages) =>
        previousMessages.filter((id) => id !== message._id)
      );
    } else {
      setSelectedMessages((previousMessages) => [
        ...previousMessages,
        message._id,
      ]);
    }
  };

  return (
    <KeyboardAvoidingView style={{flex:1}}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={{flexGrow:1}} onContentSizeChange={handleContentSizeChange}>
        {messages.map((item, index) => {
          if (item.messageType === "text") {
            const isSelected = selectedMessages.includes(item._id);
            return (
              <Pressable
                onLongPress={() => handleSelectMessage(item)}
                key={index}
                style={[
                  item?.senderId?._id === userId
                    ? {
                        alignSelf: "flex-end",
                        backgroundColor: "#DCF8C6",
                        padding: 8,
                        maxWidth: "60%",
                        borderRadius: 7,
                        margin: 10,
                      }
                    : {
                        alignSelf: "flex-start",
                        backgroundColor: "white",
                        padding: 8,
                        margin: 10,
                        borderRadius: 7,
                        maxWidth: "60%",
                      },

                  isSelected && { width: "100%", backgroundColor: "#F0FFFF" },
                ]}
              >
                <Text
                  style={{
                    fontSize: 13,
                    textAlign: isSelected ? "right" : "left",
                  }}
                >
                  {item?.message}
                </Text>
                <Text
                  style={{
                    textAlign: "right",
                    fontSize: 9,
                    color: "gray",
                    marginTop: 5,
                  }}
                >
                  {formatTime(item.timeStamp)}
                </Text>
              </Pressable>
            );
          }
          if(item.messageType === "image"){

            // const relativeApiPath = 'api/files/';
            // const documentDirectoryUri = FileSystem.documentDirectory;
            // const baseUrl = `${documentDirectoryUri}${relativeApiPath}`;
            // console.log("baseUrl: " + baseUrl);
            const baseUrl =
            "/home/abhishek/Projects/Native-Projects/messenger-app/backend/files/";
          // const imageUrl = item.imageUrl;
          // const filename = imageUrl.split("/").pop();
          // const source2 =  baseUrl + filename ;

          // const source = `/home/abhishek/Projects/Native-Projects/messenger-app/backend/files/${filename}`;
          //  const source = "/home/abhishek/Projects/Native-Projects/messenger-app/backend/files/1692125118431-837421688-image.jpg";

          const imageUrl = item.imageUrl;
          // const filename = imageUrl.split("/").pop();
          const source = { uri: imageUrl  };
          console.log("source",source);
          // const source2 = source;
          // console.log("source2",typeof(source2));
          return (
            <Pressable
              key={index}
              style={[
                item?.senderId?._id === userId
                  ? {
                      alignSelf: "flex-end",
                      backgroundColor: "#DCF8C6",
                      padding: 8,
                      maxWidth: "60%",
                      borderRadius: 7,
                      margin: 10,
                    }
                  : {
                      alignSelf: "flex-start",
                      backgroundColor: "white",
                      padding: 8,
                      margin: 10,
                      borderRadius: 7,
                      maxWidth: "60%",
                    },
              ]}
            >
              <View>
                <Image
                  source={source}
                  style={{ width: 200, height: 200, borderRadius: 7 }}
                />
                <Text
                  style={{
                    textAlign: "right",
                    fontSize: 9,
                    position: "absolute",
                    right: 10,
                    bottom: 7,
                    color: "white",
                    marginTop: 5,
                  }}
                >
                  {formatTime(item?.timeStamp)}
                </Text>
              </View>
            </Pressable>
        )}
        })}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: "#dddddd",
          marginBottom: 25,
        }}
      >
        <Entypo
          onPress={handleEmojiPress}
          style={{ marginRight: 5 }}
          name="emoji-happy"
          size={24}
          color="gray"
        />

        <TextInput
          value={message}
          onChangeText={(text)=> setMessage(text)}
          style={{
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderColor: "#dddddd",
            borderRadius: 20,
            paddingHorizontal: 10,
          }}
          placeholder="Type Your message..."
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            marginHorizontal: 8,
          }}
        >
          <Entypo  onPress={pickImage} name="camera" size={24} color="gray" />

          <Feather name="mic" size={24} color="gray" />
        </View>
        <Pressable
          onPress={() => handleSend("text")}
          style={{
            backgroundColor: "#007bff",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Send</Text>
        </Pressable>
      </View>
      
      {showEmoji?<EmojiSelector onEmojiSelected = {(emoji)=> {setMessage((prevMsg)=> prevMsg + emoji)}}style={{height: 250}}/>:null}
    </KeyboardAvoidingView>
  )
}

export default ChatMessageScreen
import React, { useState,useReducer } from 'react';
import { View, Text, TextInput, Button, StyleSheet,TouchableOpacity ,Image} from 'react-native';
import { Linking } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth'; 
const firebaseConfig = {
  apiKey: "AIzaSyDHElSH-H3BTvvE7mCWFLBJqXx2HSkwwlM",
  authDomain: "splits-29f8a.firebaseapp.com",
  databaseURL: "https://splits-29f8a-default-rtdb.firebaseio.com",
  projectId: "splits-29f8a",
  storageBucket: "splits-29f8a.appspot.com",
  messagingSenderId: "318951831471",
  appId: "1:318951831471:web:3603ebe89307e553a3e15a",
  measurementId: "G-V797609319"
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}



export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      alert('Login successful!');
      navigation.navigate('Main', { userName: firebase.auth().currentUser.email });
     /* navigation.navigate('Main');*/
    } catch (error) {
      console.error('Error while logging in: ', error);
      alert('Authentication failed. Please try again.');
    }
  };

    const contactSupport = () => {
    // Replace 'support@example.com' with your actual support email address
    const supportEmail = 'support@example.com';

    const subject = 'Need Support';
    const body = 'Hello Support Team,\n\nI need help with the Splits app.';

    const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.canOpenURL(mailtoLink).then((supported) => {
      if (supported) {
        Linking.openURL(mailtoLink);
      } else {
        alert('Could not open email client. Please send an email to support@example.com.');
      }
    });
  };

   const handleSignup = () => {

         navigation.navigate('SignUpScreen');

  };
 
  return (
    <View style={styles.container}>
   
      <Text style={styles.title}>
        SplitHub
      </Text>
      <Text style={styles.subTitle}>
        A simple money split app for everyday use
      </Text>
      <Image source={require('./assets/icons/split.gif')}style={{ width: 200, height: 200 }} />
       <View style={styles.space}>
       </View>
      <TextInput
        style={styles.input}
        placeholder="Email"
         placeholderTextColor= "#999999"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
         placeholderTextColor= "#999999"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
   
      <Button title="Login" onPress={handleLogin} 
      
       disabled={!email && !password}
      />
      <View style={styles.messgaeView}>
        <Text>Don't have an account?</Text>
        <Text style={styles.link} onPress={handleSignup}>Sign up</Text>     
      </View>

      <TouchableOpacity style={styles.contactSupportButton} onPress={contactSupport}>
        <Ionicons name="ios-mail" size={16} color="white" />
        <Text style={styles.contactSupportButtonText}>Contact Support</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'white',
  },
  input: {
    width: '80%',
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingVertical: 5,
  },
 

  title: {
    color: "#6495ED",
    fontSize: 24,
    fontWeight: 'bold',
  },
  subTitle: {
    color: '#black',
    fontSize: 13,
    marginBottom: 20,
  },
  messgaeView:{
    flexDirection: 'row',
    marginTop: 10
  },
  link:{
    color: 'blue',
    marginBottom: 20, 
    marginStart: 5
  },
  space: {
    width: 20, 
    height: 20, 
  },
    contactSupportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  contactSupportButtonText: {
    color: 'white',
    marginLeft: 5,
  },
});

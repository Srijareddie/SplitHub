import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet,TouchableOpacity,Image} from 'react-native';
import backButton from './assets/icons/back.jpg'; 


import * as firebase from 'firebase';
import 'firebase/firestore'; 
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
  firebase.initializeApp(firebaseConfig); // Ensure Firebase is initialized correctly
}

export default function Signup({ navigation }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const login = () => {
    navigation.navigate('LoginScreen');
  };
  const back = () => {
    navigation.navigate('LoginScreen');
  };
  
 const handleSignup = async () => {
    if (username === '' ||email === '' || password === '' || password2 === '') {
      alert('Please fill all the details!');
    } 
    if (password != password2) {
      alert('Passwords does not match!');
    }
      try {
     
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      
      const user = firebase.auth().currentUser;
      
      const db = firebase.firestore();
      const usersCollection = db.collection('users');
      
      await usersCollection.add({
        name: username,
        email: email, 
        password: password,
      });
      alert('Signed up successfully');
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Error adding user: ', error);
      alert('Error adding user: ' + error.message);
    }
  };

   

  return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={back}
          style={styles.backButtonContainer} // Style for the container
        >
        <Image source={require('./assets/icons/back.jpg')} style={styles.backButton} />
        </TouchableOpacity>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor= "#999999"
          onChangeText={setUsername}
          value={username}
        />
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
          secureTextEntry
          placeholderTextColor= "#999999"
          onChangeText={setPassword}
          value={password}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          placeholderTextColor= "#999999"
          onChangeText={setPassword2}
          value={password2}
        />
        <View style={styles.messgaeView}>
          <Text>Already a member?</Text>
          <Text style={styles.link} onPress={login}>Log In</Text>     
        </View>
        <Button title="Sign up" onPress={handleSignup} />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor:'#fff'
  },
  backButtonContainer: {
    position: 'absolute', 
    top: 30,
    right: 20
  },
  
  backButton: {
    width: 50,
    height: 50,
  },
  input: {
    width: '90%',
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingVertical: 5,
  },
   title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 50
  },
  messgaeView:{
    flexDirection: 'row',
    marginTop: 10
  },
  link:{
    color: 'blue',
    marginBottom: 20, 
    marginStart: 5
  }
});

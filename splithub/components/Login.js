import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet ,Alert} from 'react-native';
import firebase from 'firebase';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('abc@gmail.com');
  const [password, setPassword] = useState('abc');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    if (email === 'user@example.com' && password === 'password') {
      setLoggedIn(true);
      navigation.navigate('Main');
    } else {
      setLoggedIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Login Screen</Text>
      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default LoginScreen;

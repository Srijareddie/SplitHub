import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import bellIcon from './assets/icons/bell.png';
import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

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

const firestore = firebase.firestore();

export default function ViewFriendList({ navigation, route }) {
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newFriendName, setNewFriendName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [splitWithFriend, setSplitWithFriend] = useState('');
  const [groupedFriends, setGroupedFriends] = useState([]);
  const userName = route.params?.userName || '';

  useEffect(() => {
    // Fetch friends and groups from Firestore
    const friendsRef = firestore.collection('users').doc(userName).collection('friends');
    const groupsRef = firestore.collection('users').doc(userName).collection('groups');

    const friendsListener = friendsRef.onSnapshot((snapshot) => {
      const friendsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFriends(friendsData);
    });

    const groupsListener = groupsRef.onSnapshot((snapshot) => {
      const groupsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGroups(groupsData);
    });

    return () => {
      friendsListener();
      groupsListener();
    };
  }, [userName]);

  const setPayerCallback = (friendName) => {
    navigation.navigate('Expense', { splitWithFriend: friendName });
  };

  const back = () => {
    navigation.navigate('Expense');
  };

  const logout = () => {
    navigation.navigate('LoginScreen');
  };

  const viewFriendList = () => {
    navigation.navigate('Expense');
  };
  const addFriend = async () => {
    if (newFriendName) {
      const friendsRef = firestore.collection('users').doc(userName).collection('friends');
      const newFriend = {
        name: newFriendName,
      };

      await friendsRef.add(newFriend);
      setNewFriendName('');
      alert('New Friend added successfully');
    }
  };

  const sendReminder = (friend) => {
    alert(`Reminder sent to ${friend.name} to clear owing balance`);
  };

  const deleteFriend = async (friend) => {
    const friendsRef = firestore.collection('users').doc(userName).collection('friends');
    await friendsRef.doc(friend.id).delete();

    const groupsRef = firestore.collection('users').doc(userName).collection('groups');
    const groupsSnapshot = await groupsRef.get();

    groupsSnapshot.forEach(async (groupDoc) => {
      const groupData = groupDoc.data();
      if (groupData.members.some((member) => member.id === friend.id)) {
        const updatedMembers = groupData.members.filter((member) => member.id !== friend.id);
        await groupsRef.doc(groupDoc.id).update({ members: updatedMembers });
      }
    });

    alert(`${friend.name} deleted successfully`);
  };

  const removeFromGroup = async (friend, group) => {
    const groupsRef = firestore.collection('users').doc(userName).collection('groups');
    const groupDoc = await groupsRef.doc(group.id).get();

    if (groupDoc.exists) {
      const updatedMembers = groupDoc.data().members.filter((member) => member.id !== friend.id);
      await groupsRef.doc(group.id).update({ members: updatedMembers });
      alert(`${friend.name} removed from ${group.name}`);
    }
  };

  const deleteGroup = async (group) => {
    const groupsRef = firestore.collection('users').doc(userName).collection('groups');
    await groupsRef.doc(group.id).delete();
    alert(`${group.name} deleted successfully`);
  };

  const handleImageClick = (friend) => {
    if (selectedFriends.some((selectedFriend) => selectedFriend.name === friend.name)) {
      setSelectedFriends((prevSelected) =>
        prevSelected.filter((selectedFriend) => selectedFriend.name !== friend.name)
      );
    } else {
      setSelectedFriends((prevSelected) => [...prevSelected, friend]);
    }
  };
const handleGroupClick = (group) => {
  const groupMemberNames = group.members.map((member) => member.name).join(', ');
  setSplitWithFriend(groupMemberNames);
  navigation.navigate('ExpenseScreen', { splitWithFriend: groupMemberNames });
};

 const handleFriendSelection = (friend) => {
  setSplitWithFriend(friend.name);
  navigation.navigate('Expense', { splitWithFriend: friend.name });
};


  const handleCheckboxToggle = (friend) => {
    const isGrouped = groupedFriends.some((groupedFriend) => groupedFriend.name === friend.name);

    if (isGrouped) {
      setGroupedFriends((prevGrouped) =>
        prevGrouped.filter((groupedFriend) => groupedFriend.name !== friend.name)
      );
    } else {
      setGroupedFriends((prevGrouped) => [...prevGrouped, friend]);
    }
  };

  const createGroup = async () => {
    if (groupName && groupedFriends.length > 0) {
      const groupsRef = firestore.collection('users').doc(userName).collection('groups');
      const newGroup = {
        name: groupName,
        members: groupedFriends,
      };

      await groupsRef.add(newGroup);
      setSplitWithFriend(groupedFriends.map((friend) => friend.name).join(', '));
      navigation.navigate('HomeScreen');
      alert(`Group "${groupName}" created with ${groupedFriends.length} members.`);
      setSelectedFriends([]);
      setGroupName('');
    } else {
      alert('Please provide a group name and select friends for the group.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={logout} style={styles.logoutButtonContainer}>
        <Image source={require('./assets/icons/logout.png')}  style={styles.logoutButton} />
      </TouchableOpacity>
      <Text style={styles.title}>Welcome, {userName}!</Text>
        <Button title='Add a new Expense ' onPress={viewFriendList} />
        <View style={styles.space}/>
      <Text style={styles.title}>Friend List</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Friend's Name"
        placeholderTextColor="#999999"
        onChangeText={setNewFriendName}
        value={newFriendName}
      />
      <View style={styles.space} />
      <Button title="Add Friend" onPress={addFriend} disabled={!newFriendName} />
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleFriendSelection(item)}>
            <View style={styles.friendItemContainer}>
              <Ionicons
                name={
                  selectedFriends.some((friend) => friend.name === item.name)
                    ? 'checkbox-outline'
                    : 'square-outline'
                }
                size={24}
                color="black"
                onPress={() => handleImageClick(item)}
                style={styles.checkbox}
              />
              <Text style={styles.friendName}>{item.name}</Text>
              <TouchableOpacity onPress={() => sendReminder(item)}>
                <Image source={bellIcon} style={styles.bellIcon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteFriend(item)}>
                <Ionicons name="trash-outline" size={24} color="black" style={styles.deleteIcon} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={styles.space} />
      <Text style={styles.title}>Create Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Group Name"
        placeholderTextColor="#999999"
        onChangeText={setGroupName}
        value={groupName}
      />
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCheckboxToggle(item)}>
            <View style={styles.friendItemContainer}>
              <Ionicons
                name={
                  groupedFriends.some((groupedFriend) => groupedFriend.name === item.name)
                    ? 'checkbox-outline'
                    : 'square-outline'
                }
                size={24}
                color="black"
                style={styles.checkbox}
              />
              <Text style={styles.friendName}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Button title="Create Group" onPress={createGroup} disabled={!groupName || groupedFriends.length === 0} />
      <Text style={styles.title}>Your Groups</Text>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.groupContainer}>
            <Text style={styles.groupName}>{item.name}</Text>
            <FlatList
              data={item.members || []}
              keyExtractor={(member) => member.id || ''}
              renderItem={({ item: member }) => (
                <View style={styles.friendItemContainer}>
                  <Text style={styles.friendName}>{member.name}</Text>
                  <TouchableOpacity onPress={() => removeFromGroup(member, item)}>
                    <Ionicons name="trash-outline" size={24} color="black" style={styles.deleteIcon} />
                  </TouchableOpacity>
                </View>
              )}
            />
            <TouchableOpacity onPress={() => deleteGroup(item)} style={styles.deleteGroupButton}>
  <Ionicons name="trash-outline" size={24} color="white" style={styles.deleteIcon} />
  <Text style={styles.deleteButtonText}>Delete the Group</Text>
</TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  friendItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkbox: {
    marginRight: 8,
  },
  friendName: {
    fontSize: 16,
    flex: 1,
  },
  bellIcon: {
    width: 24,
    height: 24,
  },
  space: {
    marginVertical: 8,
  },
 
  groupContainer: {
    marginVertical: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deleteGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'blue',
    padding: 8,
    borderRadius: 5,
  },
  deleteIcon: {
    marginRight: 8,
  },
  deleteButtonText: {
    color: 'white',
  },
   logoutButtonContainer: {
    position: 'absolute', 
    top: 30,
    right: 20
  },
  
  logoutButton: {
    width: 50,
    height: 50,
  },
});

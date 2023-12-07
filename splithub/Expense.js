import React, { useState, useEffect } from 'react';
import {Modal, StyleSheet,Text,View,TextInput,Image,Button,ScrollView,FlatList,TouchableOpacity,} from 'react-native';
import logoutButton from './assets/icons/logout.png'; 
import { useIsFocused, useRoute } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DatePicker from 'react-native-datepicker';
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


export default function HomeScreen({ navigation }) {
  const [isModalVisible, setIsModalVisible] = useState(false);  
  const [selectedBillImage, setSelectedBillImage] = useState(null);
  const [billImage, setBillImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [amountDue, setAmountDue] = useState({});
  const [payer, setPayer] = useState('');
  const [splitWith, setSplitWith] = useState('');
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [isSortButtonDisabled, setIsSortButtonDisabled] = useState(true);
  const [sortAsc, setSortAsc] = useState(true);
  const route = useRoute();
  const selectedFriend = route.params?.selectedFriend;
  const [date, setDate] = useState('09-10-2023');
const [selectedDate, setSelectedDate] = useState(new Date());
 const [user, setUser] = useState(null);
  const isFocused = useIsFocused();
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState(null);
  const [userName, setUserName] = useState('');
 const [groupedFriends, setGroupedFriends] = useState([]);
  const [selectedGroupName, setSelectedGroupName] = useState('');
   const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');


useEffect(() => {
 
  const { splitWithFriend: incomingSplitWithFriend } = route.params || {};
  if (incomingSplitWithFriend) {
    setSplitWith(incomingSplitWithFriend);
  }

  // Remove setselectedFriend(''); from clearInputFields

}, [route.params, isFocused]);


useEffect(() => {
  const fetchExpenses = async (userId) => {
    try {
      const expensesRef = firebase.firestore().collection('expenses').where('userId', '==', userId);
      const expensesSnapshot = await expensesRef.get();
      const fetchedExpenses = expensesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setExpenses(fetchedExpenses);
      calculateTotalExpenses(fetchedExpenses);
      setIsSortButtonDisabled(fetchedExpenses.length === 0);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const unsubscribe = firebase.auth().onAuthStateChanged((authUser) => {
    setUser(authUser);
    if (authUser) {
      fetchUserData(authUser.uid);
      fetchExpenses(authUser.uid);
    }
  });

  return () => unsubscribe();
}, [isFocused]);

  const fetchUserData = async (userUid) => {
    try {
      const userDoc = await firebase.firestore().collection('users').doc(userUid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        setUserName(userData.name); 
      } else {
        console.error('User not found');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  
  const fetchExpenses = async (userId) => {
    try {
      const expensesRef = firebase.firestore().collection('expenses').where('userId', '==', userId);
      const expensesSnapshot = await expensesRef.get();
      const fetchedExpenses = expensesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setExpenses(fetchedExpenses);
      calculateTotalExpenses(fetchedExpenses);
      setIsSortButtonDisabled(fetchedExpenses.length === 0);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };
  const calculateTotalExpenses = (expensesArray) => {
    const total = expensesArray.reduce((acc, expense) => acc + expense.amount, 0);
     setTotalExpenses(total);
};




  const openModal = (imageUri) => {
  setSelectedBillImage(imageUri);
  setIsModalVisible(true);
  };


  const addExpense = () => {
    if (description && selectedCategory &&  selectedSubcategory && amount && payer && splitWith && selectedDate) {
      const newExpense = {
        id: expenses.length.toString(),
        description,
        selectedCategory,
        selectedSubcategory,
        amount: parseFloat(amount),
        payer,
        splitWith: splitWith.split(',').map((friend) => friend.trim())||groupedFriends[selectedGroupName].map((friend) => friend.name),
        
        billImage,
        date: selectedDate,
      };


      firebase.firestore().collection('expenses').add({
        userId: user.uid,
        ...newExpense,
      });

      setExpenses([...expenses, newExpense]);
      setDescription('');
      setSelectedCategory('');
      setSelectedSubcategory('');
      setAmount('');
      setPayer('');
      setSplitWith('');
      setBillImage(null);
      setTotalExpenses(totalExpenses + newExpense.amount);
      setIsSortButtonDisabled(false);
        setSelectedDate(new Date()); 
    }
  };



  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setBillImage(result.uri);
    }
  };

  useEffect(() => {
    const amounts = {};

    expenses.forEach((expense) => {
      const splitAmount = expense.amount / (expense.splitWith.length + 1);
      amounts[expense.payer] = (amounts[expense.payer] || 0) + expense.amount - splitAmount;

      expense.splitWith.forEach((person) => {
        amounts[person] = (amounts[person] || 0) - splitAmount;
      });
    });

    setAmountDue(amounts);
  }, [expenses]);

 
const clearInputFields = () => {
    setDescription('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setAmount('');
    setPayer('');
    setSplitWith('');
    setselectedFriend('');
  };

 
  const shareExpense = () => {
    const supportEmail = 'support@example.com';
    const subject = 'Share Expense';
    const body = 'Hello ,\n\nI would like to share an expense.';

    const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.canOpenURL(mailtoLink).then((supported) => {
      if (supported) {
        Linking.openURL(mailtoLink);
      } else {
        alert('Could not open email client. Please send an email to support@example.com.');
      }
    });
  };

 

  const logout = () => {
    navigation.navigate('LoginScreen');
  };

  const viewFriendList = () => {
    navigation.navigate('ViewFriendList');
  };


const deleteExpense = async (id) => {
  try {
    await firebase.firestore().collection('expenses').doc(id).delete();
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(updatedExpenses);
    calculateTotalExpenses(updatedExpenses);
    setIsSortButtonDisabled(updatedExpenses.length === 0);
  } catch (error) {
    console.error('Error deleting expense:', error);
  }
};
  const sortExpenses = () => {
    const sortedExpenses = expenses.slice().sort((a, b) => {
      if (sortAsc) {
        return a.date - b.date;
      } else {
        return b.date - a.date;
      }
    });
    setExpenses(sortedExpenses);
    setSortAsc(!sortAsc);
  };

useEffect(() => {
    const { groupedFriends: incomingGroupedFriends, selectedGroupName } = route.params || {};
    if (incomingGroupedFriends) {
      setGroupedFriends(incomingGroupedFriends);
      setSelectedGroupName(selectedGroupName);
    }
  }, [route.params]);



  const AmountsDue = ({ data }) => {
    if (Object.keys(data).length === 0) {
      return <Text style={styles.noDataText}>No Amounts Due Available</Text>;
    }

    return (
      <View style={styles.amountsDueContainer}>
        <Text style={styles.amountsDueHeader}>Amounts Due</Text>
        {Object.entries(data).map(([person, amount], index) => {
          const amountText = amount > 0
            ? `${person} is owed $${amount.toFixed(2)}`
            : `${person} owes $${Math.abs(amount).toFixed(2)}`;
          return (
            <Text key={index} style={styles.amountDueText}>{amountText}</Text>
          );
        })}
      </View>
    );
  };

 
  const filteredExpenses = expenses.filter(expense => {
  const description = expense.description ? expense.description.toUpperCase() : '';
  const selectedCategory = expense.selectedCategory ? expense.selectedCategory.toUpperCase() : '';
  const selectedSubcategory = expense.selectedSubcategory ? expense.selectedSubcategory.toUpperCase() : '';
  const amount = expense.amount || '';
  const payer = expense.payer ? expense.payer.toUpperCase() : '';
  const splitWith = expense.splitWith ? expense.splitWith.join(' ').toUpperCase() : '';

  const expenseData = `${description}   
                      ${selectedCategory}
                      ${selectedSubcategory}
                      ${amount}   
                      ${payer}   
                      ${splitWith}`;
   const searchData = searchQuery.toUpperCase();
 
  const categoryMatches = selectedCategory.includes(searchData);
  const subcategoryMatches = selectedSubcategory.includes(searchData);

  return expenseData.indexOf(searchData) > -1 || categoryMatches || subcategoryMatches;
  });


const renderItem = ({ item }) => {
  
  const date = item.date instanceof Date ? item.date.toLocaleDateString() : '';
}

const categories = ['Electronics', 'Clothing', 'Books'];
  const subcategories = {
    Electronics: ['Phones', 'Laptops', 'Cameras'],
    Clothing: ['Shirts', 'Pants', 'Dresses'],
    Books: ['Fiction', 'Non-fiction', 'Sci-Fi'],
  };
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    setSelectedSubcategory('');
  };

  const handleSubcategoryChange = (e) => {
    setSelectedSubcategory(e.target.value);
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.header}>Welcome, {userName}!</Text>
       
       <TouchableOpacity
        onPress={logout}
        style={styles.logoutButtonContainer} 
      >
        
        <Image source={require('./assets/icons/logout.png')} style={styles.logoutButton} />
      </TouchableOpacity>
    
     
        <Image
          source={require('./assets/icons/split.jpeg') }
          style={styles.headerImage}
        />
<View style={styles.space}/>
 <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder='Description'
          placeholderTextColor= "#999999"
          onChangeText={(text) => setDescription(text)}
          value={description}
        />

        <select onChange={handleCategoryChange} value={selectedCategory} style={styles.dropdown}>
        <option value="" disabled 
          >Select Category</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

    
      <select onChange={handleSubcategoryChange} value={selectedSubcategory} style={styles.dropdown}>
        <option value="" disabled>Select Subcategory</option>
        {selectedCategory &&
          subcategories[selectedCategory].map((subcategory) => (
            <option key={subcategory} value={subcategory}>
              {subcategory}
            </option>
          ))}
      </select>

        <TextInput
          style={styles.input}
          placeholder='Amount'
          placeholderTextColor= "#999999"
          onChangeText={(text) => 
           setAmount(text.replace(/[^0-9.]/g, ''))}
          value={amount}
         
        />
        <TextInput
          style={styles.input}
          placeholder='Payer'
          placeholderTextColor= "#999999"
         onChangeText={(text) => setPayer(text)}
          value={selectedFriend || payer  }
/>
     <TextInput
  style={styles.input}
  placeholder='Split With (comma separated)'
  placeholderTextColor="#999999"
  onChangeText={(text) => setSplitWith(text)}
  value={splitWith || (groupedFriends[selectedGroupName] && groupedFriends[selectedGroupName].map((friend) => friend.name).join(', '))}
/>
  <View style={styles.buttonContainer}>
    <Text style={styles.buttonLabel}>
      Pick a bill image  to upload
    </Text>
    <Button title="Choose file" onPress={pickImage} style={styles.pickImageButton} />

  {billImage && <Image source={{ uri: billImage }} style={styles.billImage} />}
  {/* ... other input fields */}
</View>
            
<DatePicker
  style={styles.datePickerStyle}
  date={selectedDate}
  mode="date"
  placeholder="Select date"
  format="DD-MM-YYYY"
  minDate="01-01-2016"
  maxDate="01-01-2019"
  confirmBtnText="Confirm"
  cancelBtnText="Cancel"
  customStyles={{
    dateIcon: {
      position: 'absolute',
      left: 0,
      top: 4,
      marginLeft: 0,
    },
    dateInput: {
      marginLeft: 36,
    },
  }}
  onDateChange={(date) => setSelectedDate(new Date(date))}
/>

  
    <Button title="Clear" onPress={clearInputFields}
        disabled={!description && !selectedCategory && !selectedSubcategory && !amount && !payer && !splitWith && !selectedFriend}
         />
        
         <View style={styles.space}/>
        <Button title='Add Expense' onPress={addExpense} />

         
      </View>

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          placeholderTextColor="#999999"
          onChangeText={text => setSearchQuery(text)}
          value={searchQuery}
        />
      </View>

      <AmountsDue data={amountDue} />

      <View style={styles.expenseListContainer}>
        <Text style={styles.expenseListHeader}>Earlier Added Expenses</Text>
        
        <Button
          title={`Sort by Date ${sortAsc ? 'Asc' : 'Desc'}`}
          onPress={sortExpenses}
          disabled={isSortButtonDisabled}
        />

       
        <FlatList
          style={styles.expenseList}
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.expenseItem}>
              <Text>Description: {item.description}</Text>
               <Text>Category: {item.selectedCategory}</Text>
              <Text>Sub Category: {item.selectedSubcategory}</Text>
              <Text>Amount: ${item.amount.toFixed(2)}</Text>
              <Text>Paid by: {item.payer}</Text>
              <Text>Split with: {item.splitWith.join(', ')}</Text>
            
              {item.billImage && (
                <TouchableOpacity onPress={() => openModal(item.billImage)}>
                  <Image source={{ uri: item.billImage }} style={styles.billImage} />
                </TouchableOpacity>
              )}
       
            <TouchableOpacity style={styles.shareExpenseButton} onPress={shareExpense}>
        <Ionicons name="ios-share" size={20} color="white" />
        <Text style={styles.shareExpenseButtonText}>Share Expense</Text>
      </TouchableOpacity>

 <TouchableOpacity style={styles.deleteButton} onPress={() => deleteExpense(item.id)}>
  <Ionicons name="ios-trash" size={20} color="white" />
  <Text style={styles.deleteButtonText}>Delete Expense</Text>
</TouchableOpacity>
            </View>
          )}
        />
        <Text style={styles.totalExpenses}>
          Total Expenses: ${totalExpenses.toFixed(2)}
        </Text>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(!isModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {selectedBillImage && (
              <Image source={{ uri: selectedBillImage }} style={styles.modalImage} />
            )}
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setIsModalVisible(!isModalVisible)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
 container: {
   flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    color: "#6495ED",
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  headerImage: {
    width: 100,
    height: 100,
    marginTop: 10,
    alignItems: 'center',
  },
  inputContainer: {
    width: '90%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  expenseListContainer: {
    width: '90%',
  },
  expenseListHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  expenseItem: {
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingVertical: 5,
  },
   shareExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  shareExpenseButtonText: {
    color: 'white',
    marginLeft: 5,
  },

  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },

  deleteButtonText: {
    color: 'white',
     marginLeft: 5,
  },
  totalExpenses: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20
  },
  
 logoutButtonContainer: {
    position: 'absolute', 
    top: 30,
    right: 20
  },
  
  logoutButton: {
    width: 30,
    height: 30,
  },
  space: {
    width: 20, 
    height: 20, 
  },
  amountsDueContainer: {
    marginVertical: 20,
    width: '90%',
  },
  amountsDueHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  amountDueText: {
    fontSize: 16,
    marginBottom: 5,
  },
  searchBarContainer: {
    width: '90%',
    marginBottom: 20,
  },
  searchBar: {
    width: '100%',
    borderWidth: 1,
    padding: 5,
    borderRadius: 5,
  },
  billImage: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalImage: {
    width: 200,
    height: 200,
    marginBottom: 15,
  },
    datePickerStyle: {
    width: 200,
    margin: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonLabel: {
    fontSize: 16
  },
 pickImageButton: {
   flexDirection: 'row',
    alignItems: 'center',
    
   
  },

  dropdown: {
  padding: 2,
  marginBottom: 10
  }
});

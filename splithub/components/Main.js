import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import firebase from 'firebase';


const MainScreen = ({ navigation }) => {
  const isLogin = true; 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
 
  const addExpense = () => {
    if (description && amount && payer && splitWith) {
      const newExpense = {
        id: expenses.length.toString(),
        description,
        amount: parseFloat(amount),
        payer,
        splitWith: splitWith.split(',').map((friend) => friend.trim()), 
        date: new Date(),
      };
      setExpenses([...expenses, newExpense]);
      setDescription('');
      setAmount('');
      setPayer('');
      setSplitWith('');
      setTotalExpenses(totalExpenses + newExpense.amount);
      setIsSortButtonDisabled(false);
      setEmail
      
    }
  };

  const deleteExpense = (id) => {
    const deletedExpense = expenses.find((expense) => expense.id === id);
    if (deletedExpense) {
      setExpenses(expenses.filter((expense) => expense.id !== id));
      setTotalExpenses(totalExpenses - deletedExpense.amount);
    }
    if (expenses.length === 0) {
      setIsSortButtonDisabled(true);
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


  return (
     <View style={styles.logincontainer}>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Register'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <Button
        title={isLogin ? 'Login' : 'Register'}
        onPress={handleAuth}
      />
      <Text
        style={styles.switchMode}
        onPress={() => setIsLogin(!isLogin)}
      >
        {isLogin ? 'Switch to Register' : 'Switch to Login'}
      </Text>
    <View style={styles.container}>
      <Text style={styles.header}>
        <u>Money Expense Splitter</u>
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Description"
          onChangeText={(text) => setDescription(text)}
          value={description}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          onChangeText={(text) => setAmount(text)}
          value={amount}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Payer"
          onChangeText={(text) => setPayer(text)}
          value={payer}
        />
        <TextInput
          style={styles.input}
          placeholder="Split With (comma separated)"
          onChangeText={(text) => setSplitWith(text)}
          value={splitWith}
        />
        <Button title="Add Expense" onPress={addExpense} />
      </View>

      <View style={styles.expenseListContainer}>
        <Text style={styles.expenseListHeader}>Earlier Added Expenses</Text>

        <Button
          title={`Sort by Date ${sortAsc ? 'Asc' : 'Desc'}`}
          onPress={sortExpenses}
          disabled={isSortButtonDisabled}
        />

        <FlatList
          style={styles.expenseList}
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.expenseItem}>
              <Text>Description: {item.description}</Text>
              <Text>Amount: ${item.amount.toFixed(2)}</Text>
              <Text>Paid by: {item.payer}</Text>
              <Text>Split with: {item.splitWith.join(', ')}</Text>
              <Text>Date: {item.date.toLocaleDateString()}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteExpense(item.id)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
        
            </View>
          )}
        />
        <Text style={styles.totalExpenses}>
          Total Expenses: ${totalExpenses.toFixed(2)}
        </Text>
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 20,
  },
  inputContainer: {
    width: '80%',
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingVertical: 5,
  },
  expenseListContainer: {
    width: '80%',
  },
  expenseListHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  expenseList: {},
  expenseItem: {
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingVertical: 5,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
  },
  totalExpenses: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
});

export default MainScreen;

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function AgencyLogin({ navigation }) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (username === "agency" && password === "agency123") {
            Alert.alert("Success", "Login Successful");
            navigation.navigate("AgencyDashboard");
        } else {
            Alert.alert("Error", "Invalid Credentials");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Disaster Agency Login</Text>

            <TextInput 
                style={styles.input}
                placeholder="Username"
                onChangeText={setUsername}
            />

            <TextInput 
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.btn} onPress={handleLogin}>
                <Text style={styles.btnText}>Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex:1, justifyContent:'center', padding:20 },
    title: { fontSize:24, fontWeight:'bold', marginBottom:20 },
    input: { borderWidth:1, padding:10, marginBottom:15, borderRadius:8 },
    btn: { backgroundColor:'#D32F2F', padding:15, borderRadius:10 },
    btnText: { color:'#fff', textAlign:'center', fontWeight:'bold' }
});
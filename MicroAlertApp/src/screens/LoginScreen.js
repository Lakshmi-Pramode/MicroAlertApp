import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import API from '../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const res = await API.post('/auth/login', { email, password });
            await AsyncStorage.setItem('token', res.data.token);
            navigation.replace('Home');
        } catch (err) {
            Alert.alert("Error", "Check your credentials");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Welcome Back</Text>
            <Text style={styles.sub}>Sign in to stay alerted</Text>
            <TextInput placeholder="Email Address" style={styles.input} onChangeText={setEmail} />
            <TextInput placeholder="Password" style={styles.input} secureTextEntry onChangeText={setPassword} />
            <TouchableOpacity style={styles.btn} onPress={handleLogin}>
                <Text style={styles.btnText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('AdminLogin')}>
                <Text style={styles.adminLink}>Admin Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.regLink}>Don't have an account? <Text style={{color: 'red'}}>Register Now</Text></Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 30, backgroundColor: '#fff', justifyContent: 'center' },
    header: { fontSize: 32, fontWeight: 'bold', color: '#002B5B' },
    sub: { color: '#666', marginBottom: 40 },
    input: { borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 20, padding: 10, color: '#000' },
    btn: { backgroundColor: '#D32F2F', padding: 15, borderRadius: 10, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold' },
    adminLink: { textAlign: 'center', marginTop: 20, color: '#002B5B' },
    regLink: { textAlign: 'center', marginTop: 40 }
});
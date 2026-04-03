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
            
            if (res.data.user && res.data.user.fullName) {
                await AsyncStorage.setItem('userName', res.data.user.fullName);
            }

            navigation.replace('Home');
        } catch (err) {
            console.log("Login Error:", err.response?.data || err.message);
            Alert.alert("Error", "Check your credentials");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Welcome Back</Text>
            <Text style={styles.sub}>Sign in to stay alerted</Text>
            
            <TextInput 
                placeholder="Email Address" 
                placeholderTextColor="#666"
                style={styles.input} 
                onChangeText={setEmail} 
                autoCapitalize="none"
                keyboardType="email-address"
            />
            
            <TextInput 
                placeholder="Password" 
                placeholderTextColor="#666"
                style={styles.input} 
                secureTextEntry 
                onChangeText={setPassword} 
            />
            
            <TouchableOpacity style={styles.btn} onPress={handleLogin}>
                <Text style={styles.btnText}>Login</Text>
            </TouchableOpacity>
            
            {/* Admin Login */}
            <TouchableOpacity onPress={() => navigation.navigate('AdminLogin')}>
                <Text style={styles.adminLink}>Admin Login</Text>
            </TouchableOpacity>

            {/* ✅ NEW: Agency Login */}
            <TouchableOpacity onPress={() => navigation.navigate('AgencyLogin')}>
                <Text style={styles.agencyLink}>Agency Login</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.regLink}>
                    Don't have an account? <Text style={{color: 'red'}}>Register Now</Text>
                </Text>
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

    // ✅ NEW STYLE
    agencyLink: { textAlign: 'center', marginTop: 10, color: '#1976D2', fontWeight: 'bold' },

    regLink: { textAlign: 'center', marginTop: 40, color: '#000' }
});
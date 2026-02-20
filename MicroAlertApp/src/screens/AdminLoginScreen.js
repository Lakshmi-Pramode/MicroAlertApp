import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import API from '../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminLoginScreen({ navigation }) {
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');

    const handleAdminLogin = async () => {
        try {
            const res = await API.post('/admin/login', { adminId, password });
            await AsyncStorage.setItem('token', res.data.token);
            // Replace with AdminDashboard if created, otherwise Home
            navigation.replace('Home'); 
            Alert.alert("Admin Access", "Authenticated successfully");
        } catch (err) {
            Alert.alert("Access Denied", "Invalid Admin Credentials");
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            <View style={styles.iconContainer}>
                <View style={styles.shieldIcon}><Text style={{color:'#fff'}}>🛡️</Text></View>
            </View>

            <Text style={styles.title}>Admin Portal</Text>
            <Text style={styles.sub}>Management Access Only</Text>

            <Text style={styles.label}>Admin ID</Text>
            <TextInput 
                style={styles.input} 
                placeholder="admin1234" 
                placeholderTextColor="#999" 
                onChangeText={setAdminId} 
                autoCapitalize="none"
            />

            <Text style={styles.label}>Secure Password</Text>
            <TextInput 
                style={styles.input} 
                placeholder="...." 
                placeholderTextColor="#999" 
                secureTextEntry 
                onChangeText={setPassword} 
            />

            <TouchableOpacity style={styles.loginBtn} onPress={handleAdminLogin}>
                <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0047AB', padding: 30 },
    backText: { color: '#fff', fontSize: 24, marginBottom: 20 },
    iconContainer: { marginBottom: 20 },
    shieldIcon: { width: 50, height: 50, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    sub: { color: '#e0e0e0', marginBottom: 40 },
    label: { color: '#fff', fontWeight: 'bold', marginBottom: 5 },
    input: { backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 20 },
    loginBtn: { backgroundColor: '#fff', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    loginBtnText: { color: '#0047AB', fontWeight: 'bold', fontSize: 18 }
});
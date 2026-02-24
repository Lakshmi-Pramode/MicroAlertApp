import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import API from '../api/apiService';

export default function RegisterScreen({ navigation }) {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        location: 'Maple Avenue' // Default from your UI
    });

    const handleRegister = async () => {
        if (form.password !== form.confirmPassword) {
            return Alert.alert("Error", "Passwords do not match");
        }
        try {
            await API.post('/auth/register', form);
            Alert.alert("Success", "Account created successfully!");
            navigation.navigate('Login');
        } catch (err) {
            Alert.alert("Error", "Registration failed. Try again.");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Join Micro-Alert</Text>
            <Text style={styles.sub}>Create your hyperlocal account</Text>

            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} placeholder="John Doe" onChangeText={(v) => setForm({...form, fullName: v})} />

            <Text style={styles.label}>Email Address</Text>
            <TextInput style={styles.input} placeholder="john@example.com" onChangeText={(v) => setForm({...form, email: v})} />

            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="........" secureTextEntry onChangeText={(v) => setForm({...form, password: v})} />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput style={styles.input} placeholder="........" secureTextEntry onChangeText={(v) => setForm({...form, confirmPassword: v})} />

            <Text style={styles.label}>Location (Locality)</Text>
            <View style={styles.pickerSubstitute}>
                <Text>{form.location}</Text>
            </View>

            <TouchableOpacity style={styles.regBtn} onPress={handleRegister}>
                <Text style={styles.regBtnText}>Register</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 25, backgroundColor: '#fff' },
    backArrow: { fontSize: 24, marginBottom: 20 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#002B5B' },
    sub: { color: '#666', marginBottom: 30 },
    label: { fontWeight: 'bold', marginBottom: 5, color: '#333' },
    input: { borderWidth: 1, borderColor: '#eee', padding: 12, borderRadius: 10, marginBottom: 20, backgroundColor: '#eee',color: '#000' },
    pickerSubstitute: { borderWidth: 1, borderColor: '#eee', padding: 12, borderRadius: 10, marginBottom: 30, backgroundColor: '#FAFAFA' },
    regBtn: { backgroundColor: '#D32F2F', padding: 18, borderRadius: 12, alignItems: 'center' },
    regBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
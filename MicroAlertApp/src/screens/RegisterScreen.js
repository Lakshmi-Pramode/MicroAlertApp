import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, PermissionsAndroid, Platform, ActivityIndicator } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import API from '../api/apiService';

export default function RegisterScreen({ navigation }) {

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        location: 'Maple Avenue'
    });

    const [loadingLocation, setLoadingLocation] = useState(false);

    // ✅ ADDED: email error state
    const [emailError, setEmailError] = useState('');

    // ✅ ADDED: simple email validation (safe)
    const validateEmail = (email) => {
        if (!email.includes("@gmail.com")) {
            setEmailError("Email must be a valid Gmail");
            return false;
        }
        setEmailError('');
        return true;
    };

    // Fetch address
    const fetchAddress = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
                { headers: { 'User-Agent': 'MicroAlertApp' } }
            );
            const data = await response.json();
            const displayAddress = data.display_name || "Unknown Location";
            setForm(prev => ({ ...prev, location: displayAddress }));
        } catch (error) {
            console.log("Geocoding Error:", error);
            Alert.alert("Location Error", "Could not fetch address name.");
        }
    };

    // Get location
    const getLocation = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                return Alert.alert("Permission Denied", "Location access is required.");
            }
        }

        setLoadingLocation(true);
        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchAddress(latitude, longitude).then(() => setLoadingLocation(false));
            },
            error => {
                setLoadingLocation(false);
                Alert.alert("Location Error", "Make sure GPS is enabled.");
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const handleRegister = async () => {

        // ✅ ADDED: email validation check
        if (!validateEmail(form.email)) return;

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
            <TextInput 
                style={styles.input} 
                placeholder="John Doe" 
                onChangeText={(v) => setForm({...form, fullName: v})} 
            />

            <Text style={styles.label}>Email Address</Text>
            <TextInput 
                style={styles.input} 
                placeholder="john@example.com" 
                onChangeText={(v) => {
                    setForm({...form, email: v});
                    validateEmail(v); // ✅ live check
                }} 
            />

            {/* ✅ ADDED: error display */}
            {emailError ? (
                <Text style={{ color: 'red', marginBottom: 10 }}>
                    {emailError}
                </Text>
            ) : null}

            <Text style={styles.label}>Password</Text>
            <TextInput 
                style={styles.input} 
                placeholder="........" 
                secureTextEntry 
                onChangeText={(v) => setForm({...form, password: v})} 
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput 
                style={styles.input} 
                placeholder="........" 
                secureTextEntry 
                onChangeText={(v) => setForm({...form, confirmPassword: v})} 
            />

            <View style={styles.locationHeader}>
                <Text style={styles.label}>Location (Locality)</Text>
                <TouchableOpacity onPress={getLocation} disabled={loadingLocation}>
                    {loadingLocation ? (
                        <ActivityIndicator size="small" color="#D32F2F" />
                    ) : (
                        <Text style={styles.searchLink}>Search Location 📍</Text>
                    )}
                </TouchableOpacity>
            </View>
            
            <TextInput 
                style={styles.input} 
                value={form.location} 
                onChangeText={(v) => setForm({...form, location: v})}
                placeholder="Locality Name"
            />

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
    locationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    searchLink: { color: '#D32F2F', fontWeight: '600', fontSize: 13 },
    input: { borderWidth: 1, borderColor: '#eee', padding: 12, borderRadius: 10, marginBottom: 20, backgroundColor: '#FAFAFA', color: '#000' },
    regBtn: { backgroundColor: '#D32F2F', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    regBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
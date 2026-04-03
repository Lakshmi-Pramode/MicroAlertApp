import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    PermissionsAndroid,
    Platform
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import API from '../api/apiService';

export default function AgencyDashboard({ navigation }) {

    const [title, setTitle] = useState('');
    const [type, setType] = useState('');
    const [contact, setContact] = useState('');
    const [location, setLocation] = useState('');

    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);

    // ✅ Ask permission (IMPORTANT for CLI Android)
    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );

                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.log(err);
                return false;
            }
        }
        return true;
    };

    // 📍 Get Location
    const getLocation = async () => {

        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
            Alert.alert("Permission Denied", "Location permission is required");
            return;
        }

        Geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setLatitude(lat);
                setLongitude(lng);

                // Better readable location
                setLocation(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
            },
            error => {
                Alert.alert("Error", "Unable to fetch location");
                console.log(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000
            }
        );
    };

    // 📌 Add Resource
    const handleAddResource = async () => {

        // ✅ Phone validation
        if (!/^[0-9]{10}$/.test(contact)) {
            Alert.alert("Error", "Enter valid 10-digit phone number");
            return;
        }

        if (!title || !type || !contact || !location) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        try {
            await API.post('/resources', {
                title,
                type,
                contact,
                location,
                latitude,
                longitude
            });

            Alert.alert("Success", "Resource Added Successfully");

            // Reset fields
            setTitle('');
            setType('');
            setContact('');
            setLocation('');
            setLatitude(null);
            setLongitude(null);

        } catch (err) {
            console.log("ADD RESOURCE ERROR:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to add resource");
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Agency Dashboard</Text>

            <Text style={styles.subHeader}>Add Resource</Text>

            <TextInput
                style={styles.input}
                placeholder="Resource Title"
                value={title}
                onChangeText={setTitle}
            />

            <TextInput
                style={styles.input}
                placeholder="Type (shelter / food / medical)"
                value={type}
                onChangeText={setType}
            />

            <TextInput
                style={styles.input}
                placeholder="Contact Number"
                value={contact}
                onChangeText={setContact}
                keyboardType="numeric"
            />

            {/* 📍 Location Button */}
            <TouchableOpacity style={styles.locBtn} onPress={getLocation}>
                <Text style={styles.btnText}>Get Location</Text>
            </TouchableOpacity>

            {/* Show location */}
            {location ? (
                <Text style={styles.locationText}>{location}</Text>
            ) : null}

            <TouchableOpacity style={styles.btn} onPress={handleAddResource}>
                <Text style={styles.btnText}>Add Resource</Text>
            </TouchableOpacity>

            {/* View All Resources */}
            <TouchableOpacity onPress={() => navigation.navigate("AllResources")}>
                <Text style={styles.link}>View All Resources</Text>
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity onPress={() => navigation.replace("Login")}>
                <Text style={styles.logout}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#D32F2F'
    },
    subHeader: {
        fontSize: 18,
        marginBottom: 15,
        fontWeight: '600'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        marginBottom: 15,
        borderRadius: 10
    },
    btn: {
        backgroundColor: '#D32F2F',
        padding: 15,
        borderRadius: 10,
        marginTop: 10
    },
    locBtn: {
        backgroundColor: '#1976D2',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10
    },
    btnText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    locationText: {
        marginBottom: 10,
        color: '#333'
    },
    link: {
        marginTop: 15,
        color: 'blue',
        textAlign: 'center'
    },
    logout: {
        marginTop: 20,
        color: 'red',
        textAlign: 'center',
        fontWeight: 'bold'
    }
});
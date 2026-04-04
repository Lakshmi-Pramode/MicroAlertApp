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
    Platform,
    SafeAreaView,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import API from '../api/apiService';
import LinearGradient from 'react-native-linear-gradient';

export default function AgencyDashboard({ navigation }) {

    const [title, setTitle] = useState('');
    const [type, setType] = useState('');
    const [contact, setContact] = useState('');
    const [location, setLocation] = useState('');

    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    
    // Loading state just for the UI feedback while GPS fetches
    const [isLocating, setIsLocating] = useState(false);

    // ================= PERMISSIONS & LOCATION =================
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

    const getLocation = async () => {
        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
            Alert.alert("Permission Denied", "Location permission is required");
            return;
        }

        setIsLocating(true);
        Geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                setLatitude(lat);
                setLongitude(lng);

                setLocation(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
                setIsLocating(false);
            },
            error => {
                Alert.alert("Error", "Unable to fetch location");
                console.log(error);
                setIsLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000
            }
        );
    };

    // ================= API SUBMISSION =================
    const handleAddResource = async () => {
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

            // Reset Form
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
        <LinearGradient colors={['#0F172A', '#1E1B4B']} style={styles.safeArea}>
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

                <ScrollView 
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.welcomeText}>Agency Portal</Text>
                            <Text style={styles.title}>Dashboard</Text>
                        </View>
                        <TouchableOpacity style={styles.glassLogoutBtn} onPress={() => navigation.replace("Login")} activeOpacity={0.7}>
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Add Resource Card */}
                    <View style={styles.glassCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconBox}>
                                <Text style={styles.iconText}>📦</Text>
                            </View>
                            <Text style={styles.subHeader}>Deploy Resource</Text>
                        </View>

                        <Text style={styles.label}>Resource Title</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Downtown Relief Tent"
                                placeholderTextColor="#64748B"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        <Text style={styles.label}>Category</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="shelter / food / medical"
                                placeholderTextColor="#64748B"
                                value={type}
                                onChangeText={setType}
                            />
                        </View>

                        <Text style={styles.label}>Contact Number</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="10-digit emergency line"
                                placeholderTextColor="#64748B"
                                value={contact}
                                onChangeText={setContact}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                        </View>

                        <Text style={styles.label}>Deployment Location</Text>
                        <View style={styles.locationRow}>
                            <TouchableOpacity 
                                style={styles.locBtn} 
                                onPress={getLocation} 
                                disabled={isLocating}
                                activeOpacity={0.7}
                            >
                                {isLocating ? (
                                    <ActivityIndicator size="small" color="#38BDF8" />
                                ) : (
                                    <Text style={styles.locBtnText}>📍 Detect GPS</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.locationDisplay}>
                                <Text style={[styles.locationText, !location && { color: '#64748B' }]} numberOfLines={2}>
                                    {location ? location : "Awaiting coordinates..."}
                                </Text>
                            </View>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity onPress={handleAddResource} activeOpacity={0.8} style={styles.btnShadow}>
                            <LinearGradient 
                                colors={['#38BDF8', '#0284C7']} 
                                start={{ x: 0, y: 0 }} 
                                end={{ x: 1, y: 0 }}
                                style={styles.submitBtn}
                            >
                                <Text style={styles.submitBtnText}>Add Resource</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* View All Resources Button */}
                    <TouchableOpacity 
                        style={styles.viewAllBtn} 
                        onPress={() => navigation.navigate("AllResources")}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.viewAllIcon}>🗂️</Text>
                        <Text style={styles.viewAllText}>View Deployed Resources</Text>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

// ================= STYLES =================
const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

    // Header
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: 20, 
        marginBottom: 30 
    },
    welcomeText: { fontSize: 13, color: '#38BDF8', fontWeight: '700', letterSpacing: 1 },
    title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
    glassLogoutBtn: { 
        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
        paddingHorizontal: 16, 
        paddingVertical: 10, 
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)'
    },
    logoutText: { color: '#FCA5A5', fontWeight: '700', fontSize: 13 },

    // Glass Card
    glassCard: { 
        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
        padding: 24, 
        borderRadius: 24, 
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25
    },
    iconBox: {
        width: 44, height: 44,
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    iconText: { fontSize: 22 },
    subHeader: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },

    // Form Fields
    label: { 
        fontSize: 14, 
        fontWeight: '700', 
        color: '#CBD5E1', 
        marginBottom: 8, 
        marginLeft: 4,
        letterSpacing: 0.5 
    },
    inputContainer: { 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16, 
        borderWidth: 1, 
        borderColor: 'rgba(255, 255, 255, 0.1)', 
        marginBottom: 20, 
        paddingHorizontal: 16, 
        height: 56, 
        justifyContent: 'center' 
    },
    input: { 
        flex: 1, 
        fontSize: 15, 
        color: '#FFFFFF', 
        fontWeight: '500' 
    },

    // Location Section
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30
    },
    locBtn: {
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.3)',
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    locBtnText: {
        color: '#38BDF8',
        fontWeight: '700',
        fontSize: 14
    },
    locationDisplay: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)'
    },
    locationText: {
        color: '#34D399', 
        fontSize: 12,
        fontWeight: '600'
    },

    // Submit Button
    btnShadow: { 
        shadowColor: '#38BDF8', 
        shadowOffset: { width: 0, height: 6 }, 
        shadowOpacity: 0.4, 
        shadowRadius: 12, 
        elevation: 8 
    },
    submitBtn: { 
        height: 60, 
        borderRadius: 16, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    submitBtnText: { 
        color: '#FFFFFF', 
        fontSize: 17, 
        fontWeight: '800', 
        letterSpacing: 0.5 
    },

    // Secondary Action Button
    viewAllBtn: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
    },
    viewAllIcon: { fontSize: 20, marginRight: 10 },
    viewAllText: { color: '#E2E8F0', fontSize: 16, fontWeight: '700' }
});
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
    ActivityIndicator,
    SafeAreaView,
    KeyboardAvoidingView,
    StatusBar
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import API from '../api/apiService';
import LinearGradient from 'react-native-linear-gradient'; // Correct import for non-Expo

export default function RegisterScreen({ navigation }) {

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        location: 'Maple Avenue'
    });

    const [loadingLocation, setLoadingLocation] = useState(false);
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email) => {
        if (!email.includes("@gmail.com")) {
            setEmailError("Email must be a valid Gmail");
            return false;
        }
        setEmailError('');
        return true;
    };

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
        <LinearGradient 
            colors={['#0F172A', '#1E1B4B']} 
            style={styles.safeArea}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView 
                        contentContainerStyle={styles.container}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        
                        {/* Back Button */}
                        <TouchableOpacity 
                            style={styles.glassBackBtn} 
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.backArrow}>←</Text>
                        </TouchableOpacity>

                        {/* Header */}
                        <View style={styles.headerContainer}>
                            <Text style={styles.title}>Join Micro-Alert</Text>
                            <Text style={styles.sub}>Create your hyperlocal account</Text>
                        </View>

                        {/* Form Fields */}
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputContainer}>
                            <TextInput 
                                style={styles.input} 
                                placeholder="John Doe" 
                                placeholderTextColor="#64748B"
                                onChangeText={(v) => setForm({...form, fullName: v})} 
                            />
                        </View>

                        <Text style={styles.label}>Email Address</Text>
                        <View style={[styles.inputContainer, emailError ? styles.inputError : null]}>
                            <TextInput 
                                style={styles.input} 
                                placeholder="john@example.com" 
                                placeholderTextColor="#64748B"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onChangeText={(v) => {
                                    setForm({...form, email: v});
                                    validateEmail(v); 
                                }} 
                            />
                        </View>
                        {emailError ? (
                            <Text style={styles.errorText}>⚠️ {emailError}</Text>
                        ) : null}

                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput 
                                style={styles.input} 
                                placeholder="••••••••" 
                                placeholderTextColor="#64748B"
                                secureTextEntry 
                                onChangeText={(v) => setForm({...form, password: v})} 
                            />
                        </View>

                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput 
                                style={styles.input} 
                                placeholder="••••••••" 
                                placeholderTextColor="#64748B"
                                secureTextEntry 
                                onChangeText={(v) => setForm({...form, confirmPassword: v})} 
                            />
                        </View>

                        <View style={styles.locationHeader}>
                            <Text style={styles.label}>Location (Locality)</Text>
                            <TouchableOpacity onPress={getLocation} disabled={loadingLocation} style={styles.locationBtn}>
                                {loadingLocation ? (
                                    <ActivityIndicator size="small" color="#38BDF8" />
                                ) : (
                                    <Text style={styles.searchLink}>Search Location 📍</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput 
                                style={styles.input} 
                                value={form.location} 
                                placeholderTextColor="#64748B"
                                onChangeText={(v) => setForm({...form, location: v})}
                                placeholder="Locality Name"
                            />
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity onPress={handleRegister} activeOpacity={0.8} style={styles.btnShadow}>
                            <LinearGradient 
                                colors={['#FF416C', '#FF4B2B']} 
                                start={{ x: 0, y: 0 }} 
                                end={{ x: 1, y: 0 }}
                                style={styles.regBtn}
                            >
                                <Text style={styles.regBtnText}>Create Account</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Spacer for bottom padding on scroll */}
                        <View style={{ height: 40 }} />
                        
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

// ================= STYLES =================
const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { 
        flexGrow: 1, 
        paddingHorizontal: 28, 
        paddingTop: 20 
    },

    glassBackBtn: { 
        width: 44, 
        height: 44, 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        borderRadius: 22, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: 'rgba(255, 255, 255, 0.05)', 
        marginBottom: 30 
    },
    backArrow: { 
        fontSize: 22, 
        color: '#FFFFFF',
        marginTop: -2
    },

    headerContainer: { marginBottom: 35 },
    title: { 
        fontSize: 32, 
        fontWeight: '800', 
        color: '#FFFFFF', 
        letterSpacing: -0.5, 
        marginBottom: 8 
    },
    sub: { 
        fontSize: 16, 
        color: '#94A3B8', 
        fontWeight: '500' 
    },

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
        height: 60, 
        justifyContent: 'center' 
    },
    inputError: {
        borderColor: 'rgba(239, 68, 68, 0.5)', // Red tint for error
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
    },
    input: { 
        flex: 1, 
        fontSize: 16, 
        color: '#FFFFFF', 
        fontWeight: '500' 
    },
    errorText: { 
        color: '#FCA5A5', 
        fontSize: 13, 
        fontWeight: '600',
        marginTop: -12, 
        marginBottom: 20,
        marginLeft: 4
    },

    locationHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 8 
    },
    locationBtn: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    searchLink: { 
        color: '#38BDF8', // Cyan link matching the theme
        fontWeight: '700', 
        fontSize: 13,
        letterSpacing: 0.5
    },

    btnShadow: { 
        shadowColor: '#FF416C', 
        shadowOffset: { width: 0, height: 6 }, 
        shadowOpacity: 0.4, 
        shadowRadius: 12, 
        elevation: 8, 
        marginTop: 20 
    },
    regBtn: { 
        height: 60, 
        borderRadius: 16, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    regBtnText: { 
        color: '#FFFFFF', 
        fontSize: 18, 
        fontWeight: '800', 
        letterSpacing: 0.5 
    }
});
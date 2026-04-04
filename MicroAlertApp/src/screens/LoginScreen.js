import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    StatusBar
} from 'react-native';
import API from '../api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient'; // <-- Updated Import

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
        <LinearGradient 
            colors={['#0F172A', '#1E1B4B']} 
            style={styles.safeArea}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.innerContainer}>
                            
                            {/* Header Section */}
                            <View style={styles.headerContainer}>
                                <View style={styles.iconWrapper}>
                                    <LinearGradient 
                                        colors={['#38BDF8', '#3B82F6']} 
                                        style={styles.iconGradient}
                                    >
                                        <Text style={styles.headerIcon}>🛡️</Text>
                                    </LinearGradient>
                                </View>
                                <Text style={styles.header}>Welcome Back</Text>
                                <Text style={styles.sub}>Sign in to stay alerted and secure.</Text>
                            </View>
                            
                            {/* Form Section */}
                            <View style={styles.formContainer}>
                                <View style={styles.inputContainer}>
                                    <TextInput 
                                        placeholder="Email Address" 
                                        placeholderTextColor="#64748B"
                                        style={styles.input} 
                                        onChangeText={setEmail} 
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        value={email}
                                    />
                                </View>
                                
                                <View style={styles.inputContainer}>
                                    <TextInput 
                                        placeholder="Password" 
                                        placeholderTextColor="#64748B"
                                        style={styles.input} 
                                        secureTextEntry 
                                        onChangeText={setPassword} 
                                        value={password}
                                    />
                                </View>
                                
                                <TouchableOpacity onPress={handleLogin} activeOpacity={0.8} style={styles.btnShadow}>
                                    <LinearGradient 
                                        colors={['#FF416C', '#FF4B2B']} 
                                        start={{ x: 0, y: 0 }} 
                                        end={{ x: 1, y: 0 }}
                                        style={styles.loginBtn}
                                    >
                                        <Text style={styles.loginBtnText}>Log In</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            {/* Portal Links (Admin & Agency) */}
                            <View style={styles.portalRow}>
                                <TouchableOpacity style={styles.portalBtn} onPress={() => navigation.navigate('AdminLogin')}>
                                    <Text style={styles.portalText}>Admin Portal</Text>
                                </TouchableOpacity>

                                <View style={styles.divider} />

                                <TouchableOpacity style={styles.portalBtn} onPress={() => navigation.navigate('AgencyLogin')}>
                                    <Text style={[styles.portalText, styles.agencyText]}>Agency Portal</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ flex: 1 }} />

                            {/* Footer Section */}
                            <TouchableOpacity style={styles.registerWrapper} onPress={() => navigation.navigate('Register')} activeOpacity={0.6}>
                                <Text style={styles.registerTextBase}>
                                    Don't have an account?{' '}
                                    <Text style={styles.registerTextHighlight}>Register Now</Text>
                                </Text>
                            </TouchableOpacity>

                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1 },
    innerContainer: { flex: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 30, justifyContent: 'center' },

    headerContainer: { marginBottom: 40, alignItems: 'flex-start' },
    iconWrapper: { marginBottom: 20 },
    iconGradient: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
    headerIcon: { fontSize: 32 },
    header: { fontSize: 34, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 8 },
    sub: { fontSize: 16, color: '#94A3B8', fontWeight: '500' },

    formContainer: { marginBottom: 30 },
    inputContainer: { 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', 
        marginBottom: 16, paddingHorizontal: 16, height: 60, justifyContent: 'center' 
    },
    input: { flex: 1, fontSize: 16, color: '#FFFFFF', fontWeight: '500' },

    btnShadow: { shadowColor: '#FF416C', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8, marginTop: 10 },
    loginBtn: { height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    loginBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },

    portalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    portalBtn: { paddingVertical: 10, paddingHorizontal: 16 },
    portalText: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
    agencyText: { color: '#38BDF8' }, 
    divider: { width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },

    registerWrapper: { alignItems: 'center', paddingVertical: 20 },
    registerTextBase: { fontSize: 15, color: '#94A3B8', fontWeight: '500' },
    registerTextHighlight: { color: '#FF416C', fontWeight: '700' }
});
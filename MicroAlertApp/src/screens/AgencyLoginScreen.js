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
import LinearGradient from 'react-native-linear-gradient';

export default function AgencyLogin({ navigation }) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // ================= LOGIN LOGIC =================
    const handleLogin = () => {
        if (username === "agency" && password === "agency123") {
            Alert.alert("Success", "Login Successful");
            navigation.navigate("AgencyDashboard");
        } else {
            Alert.alert("Error", "Invalid Credentials");
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
                            
                            {/* Back Button */}
                            <TouchableOpacity 
                                style={styles.glassBackBtn} 
                                onPress={() => navigation.goBack()}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.backArrow}>←</Text>
                            </TouchableOpacity>

                            {/* Header Section */}
                            <View style={styles.headerContainer}>
                                <View style={styles.iconWrapper}>
                                    <LinearGradient 
                                        colors={['#38BDF8', '#0284C7']} // Cyan/Blue identity for Agency
                                        style={styles.iconGradient}
                                    >
                                        <Text style={styles.headerIcon}>🏛️</Text>
                                    </LinearGradient>
                                </View>
                                <Text style={styles.title}>Agency Portal</Text>
                                <Text style={styles.sub}>Disaster Response Teams Only</Text>
                            </View>

                            {/* Form Section */}
                            <View style={styles.formContainer}>
                                <Text style={styles.label}>Agency Username</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput 
                                        style={styles.input} 
                                        placeholder="e.g. agency" 
                                        placeholderTextColor="#64748B" 
                                        onChangeText={setUsername} 
                                        autoCapitalize="none"
                                        value={username}
                                    />
                                </View>

                                <Text style={styles.label}>Secure Password</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput 
                                        style={styles.input} 
                                        placeholder="••••••••" 
                                        placeholderTextColor="#64748B" 
                                        secureTextEntry 
                                        onChangeText={setPassword} 
                                        value={password}
                                    />
                                </View>

                                {/* Login Button */}
                                <TouchableOpacity onPress={handleLogin} activeOpacity={0.8} style={styles.btnShadow}>
                                    <LinearGradient 
                                        colors={['#38BDF8', '#0284C7']} // Matching Blue/Cyan gradient
                                        start={{ x: 0, y: 0 }} 
                                        end={{ x: 1, y: 0 }}
                                        style={styles.loginBtn}
                                    >
                                        <Text style={styles.loginBtnText}>Access Dashboard</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

// ================= STYLES =================
const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1 },
    innerContainer: { 
        flex: 1, 
        paddingHorizontal: 28, 
        paddingTop: 20, 
        paddingBottom: 30, 
        justifyContent: 'center' 
    },

    // Back Button
    glassBackBtn: { 
        width: 44, 
        height: 44, 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        borderRadius: 22, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: 'rgba(255, 255, 255, 0.05)', 
        position: 'absolute',
        top: 20,
        left: 28,
        zIndex: 10
    },
    backArrow: { 
        fontSize: 22, 
        color: '#FFFFFF',
        marginTop: -2
    },

    // Header
    headerContainer: { 
        marginBottom: 40, 
        alignItems: 'flex-start',
        marginTop: 60 // Space for the absolute back button
    },
    iconWrapper: { marginBottom: 20 },
    iconGradient: { 
        width: 60, 
        height: 60, 
        borderRadius: 18, 
        justifyContent: 'center', 
        alignItems: 'center', 
        shadowColor: '#38BDF8', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 12, 
        elevation: 5 
    },
    headerIcon: { fontSize: 32 },
    title: { 
        fontSize: 34, 
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

    // Form
    formContainer: { marginBottom: 30 },
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
    input: { 
        flex: 1, 
        fontSize: 16, 
        color: '#FFFFFF', 
        fontWeight: '500' 
    },

    // Button
    btnShadow: { 
        shadowColor: '#38BDF8', 
        shadowOffset: { width: 0, height: 6 }, 
        shadowOpacity: 0.4, 
        shadowRadius: 12, 
        elevation: 8, 
        marginTop: 10 
    },
    loginBtn: { 
        height: 60, 
        borderRadius: 16, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    loginBtnText: { 
        color: '#FFFFFF', 
        fontSize: 18, 
        fontWeight: '800', 
        letterSpacing: 0.5 
    }
});
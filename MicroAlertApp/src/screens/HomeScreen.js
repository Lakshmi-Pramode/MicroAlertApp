import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/apiService';
import LinearGradient from 'react-native-linear-gradient'; // <-- Updated Import

const SERVER_URL = API.defaults.baseURL.replace('/api', ''); 

export default function HomeScreen({ navigation }) {
    const [userName, setUserName] = useState('User');
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);
            const res = await API.get('/reports'); 
            setAlerts(res.data);
        } catch (error) {
            console.log("Error fetching home data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Logout", 
                    style: "destructive", 
                    onPress: async () => {
                        await AsyncStorage.clear();
                        navigation.replace('Login');
                    }
                }
            ]
        );
    };

    const activeThreats = alerts.length;

    return (
        <LinearGradient 
            colors={['#0F172A', '#1E1B4B']} 
            style={styles.container}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    
                    {/* Header Section */}
                    <View style={styles.headerRow}>
                        <View>
                            <Text style={styles.greetText}>GOOD MORNING</Text>
                            <Text style={styles.userName}>{userName}</Text>
                        </View>

                        <View style={styles.headerButtons}>
                            <TouchableOpacity style={styles.glassBtn} onPress={handleLogout} activeOpacity={0.7}>
                                <Text style={styles.btnEmoji}>🚪</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.glassBtn} onPress={() => navigation.navigate('Alerts')} activeOpacity={0.7}>
                                {activeThreats > 0 && <View style={styles.notifDot} />}
                                <Text style={styles.btnEmoji}>🔔</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Hyperlocal Status Card */}
                    <View style={[styles.glassCard, activeThreats > 0 && styles.glassCardDanger]}>
                        <View style={styles.statusHeader}>
                            <View style={[styles.statusIconWrapper, activeThreats > 0 ? styles.bgDanger : styles.bgSafe]}>
                                <Text style={styles.statusIcon}>{activeThreats > 0 ? "⚠️" : "🛡️"}</Text>
                            </View>
                            <Text style={[styles.statusTitle, activeThreats > 0 ? styles.textDanger : styles.textSafe]}>
                                Hyperlocal Status
                            </Text>
                        </View>
                        <Text style={styles.statusDescription}>
                            {activeThreats > 0 
                                ? `Attention! ${activeThreats} active incidents verified in your surrounding area. Please stay vigilant.` 
                                : "All clear. No active threats detected in your immediate vicinity at this time."}
                        </Text>
                    </View>

                    {/* Main Report Button */}
                    <TouchableOpacity onPress={() => navigation.navigate('Report')} activeOpacity={0.8}>
                        <LinearGradient 
                            colors={['#FF416C', '#FF4B2B']} 
                            start={{ x: 0, y: 0 }} 
                            end={{ x: 1, y: 0 }}
                            style={styles.reportBtn}
                        >
                            <Text style={styles.reportBtnIcon}>+</Text>
                            <Text style={styles.reportBtnText}>Report Disaster</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Quick Action Grid */}
                    <View style={styles.gridRow}>
                        <TouchableOpacity style={styles.gridGlassBtn} onPress={() => navigation.navigate('Alerts')} activeOpacity={0.7}>
                            <View style={styles.gridIconWrapper}>
                                <Text style={styles.gridIcon}>📡</Text>
                            </View>
                            <Text style={styles.gridText}>Live Feed</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.gridGlassBtn} onPress={() => navigation.navigate('Resources')} activeOpacity={0.7}>
                            <View style={styles.gridIconWrapper}>
                                <Text style={styles.gridIcon}>📄</Text>
                            </View>
                            <Text style={styles.gridText}>Resources</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Nearby Alerts Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Nearby Alerts</Text>
                        <TouchableOpacity onPress={fetchData} activeOpacity={0.6}>
                            <Text style={styles.seeAll}>REFRESH</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 40 }} />
                    ) : alerts.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>✨</Text>
                            <Text style={styles.noData}>No active alerts found in your area.</Text>
                        </View>
                    ) : (
                        alerts.map((alert) => (
                            <TouchableOpacity key={alert._id} style={styles.alertCard} onPress={() => navigation.navigate('Alerts')} activeOpacity={0.7}>
                                <View style={[styles.alertIconBox, alert.priority === 'urgent' ? styles.bgDanger : styles.bgStandard]}>
                                    <Text style={styles.alertIconText}>{alert.disasterType === 'Fire' ? '🔥' : '⚠️'}</Text>
                                </View>
                                <View style={styles.alertInfo}>
                                    <View style={styles.alertHeaderRow}>
                                        <Text style={styles.alertTitle}>{alert.disasterType}</Text>
                                        <View style={[styles.badge, alert.priority === 'urgent' ? styles.badgeUrgent : styles.badgeVerified]}>
                                            <Text style={[styles.badgeText, alert.priority === 'urgent' ? styles.textDanger : styles.textSafe]}>
                                                {alert.priority === 'urgent' ? 'CRITICAL' : 'VERIFIED'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.alertSub} numberOfLines={1}>
                                        {alert.address || `Lat: ${alert.latitude}, Long: ${alert.longitude}`}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 },

    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 32 },
    headerButtons: { flexDirection: 'row', gap: 12 },
    greetText: { fontSize: 13, color: '#38BDF8', fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 }, 
    userName: { fontSize: 28, color: '#FFFFFF', fontWeight: '800', letterSpacing: -0.5 },
    
    glassBtn: {
        width: 48, height: 48, 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        borderRadius: 24, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)'
    },
    btnEmoji: { fontSize: 20 },
    notifDot: { position: 'absolute', top: 12, right: 12, width: 10, height: 10, backgroundColor: '#EF4444', borderRadius: 5, borderWidth: 2, borderColor: '#1E1B4B', zIndex: 1 },

    glassCard: { 
        backgroundColor: 'rgba(255, 255, 255, 0.07)', 
        padding: 24, borderRadius: 24, marginBottom: 28,
        borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    glassCardDanger: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' },
    
    statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    statusIconWrapper: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    bgDanger: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
    bgSafe: { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
    bgStandard: { backgroundColor: 'rgba(56, 189, 248, 0.2)' },
    
    statusTitle: { fontSize: 18, fontWeight: '700', marginLeft: 12, letterSpacing: -0.3 },
    textDanger: { color: '#FCA5A5' },
    textSafe: { color: '#86EFAC' },
    statusDescription: { fontSize: 15, lineHeight: 22, color: '#CBD5E1', fontWeight: '500' },

    reportBtn: { 
        flexDirection: 'row', paddingVertical: 20, paddingHorizontal: 24, 
        borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 28,
        shadowColor: '#FF416C', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 
    },
    reportBtnIcon: { color: '#FFFFFF', fontSize: 24, fontWeight: '600', marginRight: 10, marginTop: -2 },
    reportBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },

    gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 36 },
    gridGlassBtn: { 
        backgroundColor: 'rgba(255, 255, 255, 0.07)', width: '47%', padding: 20, 
        borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)'
    },
    gridIconWrapper: { width: 52, height: 52, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    gridIcon: { fontSize: 24 },
    gridText: { fontWeight: '700', color: '#F8FAFC', fontSize: 15 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
    sectionTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
    seeAll: { color: '#38BDF8', fontWeight: '700', fontSize: 13, letterSpacing: 0.5, marginBottom: 2 },

    emptyState: { paddingVertical: 40, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed' },
    emptyEmoji: { fontSize: 32, marginBottom: 12 },
    noData: { color: '#94A3B8', fontSize: 15, fontWeight: '500' },

    alertCard: { 
        flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.07)', padding: 16, borderRadius: 20, 
        marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' 
    },
    alertIconBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    alertIconText: { fontSize: 24 },
    alertInfo: { flex: 1, marginLeft: 16 },
    alertHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    alertTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeUrgent: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
    badgeVerified: { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    alertSub: { color: '#94A3B8', fontSize: 13, fontWeight: '500' }
});
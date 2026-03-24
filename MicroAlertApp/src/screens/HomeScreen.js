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
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/apiService';

// To display images from your backend correctly
const SERVER_URL = API.defaults.baseURL.replace('/api', ''); 

export default function HomeScreen({ navigation }) {
    const [userName, setUserName] = useState('User');
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    // ================= FETCH DATA =================
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Get User Name from local storage
            const name = await AsyncStorage.getItem('userName');
            if (name) setUserName(name);

            // 2. Get Approved Alerts from Backend
            // This calls the GET /reports route which returns only 'approved' ones
            const res = await API.get('/reports'); 
            setAlerts(res.data);
        } catch (error) {
            console.log("Error fetching home data:", error);
            // Don't alert here to avoid annoying the user on every refresh
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ================= LOGOUT LOGIC =================
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
        <SafeAreaView style={styles.container}>
            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
            >
                
                {/* Header Section */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.greetText}>GOOD MORNING</Text>
                        <Text style={styles.userName}>{userName}</Text>
                    </View>

                    <View style={styles.headerButtons}>
                        {/* Logout Button */}
                        <TouchableOpacity 
                            style={styles.logoutBtn}
                            onPress={handleLogout}
                        >
                            <Text style={styles.logoutIcon}>🚪</Text>
                        </TouchableOpacity>

                        {/* Notification Button */}
                        <TouchableOpacity 
                            style={styles.bellBtn}
                            onPress={() => navigation.navigate('Alerts')}
                        >
                            <View style={styles.notifDot} />
                            <Text style={styles.bellIcon}>🔔</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Hyperlocal Status Card (DYNAMIC) */}
                <View style={[
                    styles.statusCard, 
                    activeThreats > 0 && { borderColor: '#FECACA', backgroundColor: '#FFF1F1' }
                ]}>
                    <View style={styles.statusHeader}>
                        <Text style={styles.statusIcon}>{activeThreats > 0 ? "⚠️" : "🛡️"}</Text>
                        <Text style={[
                            styles.statusTitle, 
                            activeThreats > 0 && { color: '#DC2626' }
                        ]}>
                            Hyperlocal Status
                        </Text>
                    </View>
                    <Text style={styles.statusDescription}>
                        {activeThreats > 0 
                            ? `Attention! ${activeThreats} active incidents verified in your surrounding area.` 
                            : "No active threats detected in your immediate vicinity."}
                    </Text>
                </View>

                {/* Main Report Button */}
                <TouchableOpacity 
                    style={styles.reportBtn}
                    onPress={() => navigation.navigate('Report')}
                >
                    <Text style={styles.reportBtnText}>⊕ Report Disaster</Text>
                </TouchableOpacity>

                {/* Quick Action Grid */}
                <View style={styles.gridRow}>
                    
                    {/* View Alerts */}
                    <TouchableOpacity 
                        style={styles.gridBtn}
                        onPress={() => navigation.navigate('Alerts')}
                    >
                        <Text style={styles.gridIcon}>📡</Text>
                        <Text style={styles.gridText}>Live Feed</Text>
                    </TouchableOpacity>

                    {/* Resources */}
                    <TouchableOpacity 
                        style={styles.gridBtn} 
                        onPress={() => navigation.navigate('Resources')}
                    >
                        <Text style={styles.gridIcon}>📄</Text>
                        <Text style={styles.gridText}>Resources</Text>
                    </TouchableOpacity>

                </View>

                {/* Nearby Alerts Section (DYNAMIC) */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Nearby Alerts</Text>
                    <TouchableOpacity onPress={fetchData}>
                        <Text style={styles.seeAll}>REFRESH</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 20 }} />
                ) : alerts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.noData}>No active alerts found.</Text>
                    </View>
                ) : (
                    alerts.map((alert) => (
                        <TouchableOpacity 
                            key={alert._id} 
                            style={styles.alertCard}
                            onPress={() => navigation.navigate('Alerts')} // Or a Detail screen
                        >
                            <View style={[
                                styles.alertIconBox, 
                                alert.priority === 'urgent' && { backgroundColor: '#FEF2F2' }
                            ]}>
                                <Text style={styles.alertIconText}>
                                    {alert.disasterType === 'Fire' ? '🔥' : '⚠️'}
                                </Text>
                            </View>
                            <View style={styles.alertInfo}>
                                <View style={styles.alertHeaderRow}>
                                    <Text style={styles.alertTitle}>{alert.disasterType}</Text>
                                    <View style={alert.priority === 'urgent' ? styles.criticalBadge : styles.riskBadge}>
                                        <Text style={alert.priority === 'urgent' ? styles.badgeText : styles.riskText}>
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
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { padding: 20 },

    headerRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: 20, 
        marginBottom: 30 
    },

    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    greetText: { 
        fontSize: 14, 
        color: '#94A3B8', 
        fontWeight: 'bold' 
    },

    userName: { 
        fontSize: 28, 
        color: '#1E3A8A', 
        fontWeight: 'bold' 
    },

    logoutBtn: {
        width: 45, 
        height: 45, 
        backgroundColor: '#FEF2F2', 
        borderRadius: 25, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginRight: 10
    },

    logoutIcon: { fontSize: 18 },

    bellBtn: { 
        width: 45, 
        height: 45, 
        backgroundColor: '#F1F5F9', 
        borderRadius: 25, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },

    notifDot: { 
        position: 'absolute', 
        top: 10, 
        right: 12, 
        width: 8, 
        height: 8, 
        backgroundColor: 'red', 
        borderRadius: 4, 
        zIndex: 1 
    },

    bellIcon: { fontSize: 20 },

    statusCard: { 
        padding: 25, 
        borderRadius: 20, 
        borderWidth: 1, 
        borderColor: '#E2E8F0', 
        marginBottom: 25 
    },

    statusHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 15 
    },

    statusIcon: { fontSize: 20 },

    statusTitle: { 
        color: '#1E3A8A', 
        fontWeight: 'bold', 
        marginLeft: 10 
    },

    statusDescription: { 
        color: '#64748B', 
        fontSize: 15,
        lineHeight: 20
    },

    reportBtn: { 
        backgroundColor: '#DC2626', 
        padding: 20, 
        borderRadius: 15, 
        alignItems: 'center', 
        elevation: 5, 
        marginBottom: 25 
    },

    reportBtnText: { 
        color: '#FFFFFF', 
        fontSize: 20, 
        fontWeight: 'bold' 
    },

    gridRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 30 
    },

    gridBtn: { 
        backgroundColor: '#FFFFFF', 
        width: '47%', 
        padding: 20, 
        borderRadius: 15, 
        elevation: 3, 
        alignItems: 'center' 
    },

    gridIcon: { fontSize: 22 },

    gridText: { 
        fontWeight: 'bold', 
        color: '#1E3A8A', 
        marginTop: 10 
    },

    sectionHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 15 
    },

    sectionTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#1E3A8A' 
    },

    seeAll: { 
        color: '#DC2626', 
        fontWeight: 'bold',
        fontSize: 12
    },

    emptyState: {
        padding: 20,
        alignItems: 'center'
    },

    noData: { 
        color: '#94A3B8',
        fontSize: 14
    },

    alertCard: { 
        flexDirection: 'row', 
        backgroundColor: '#FFFFFF', 
        padding: 15, 
        borderRadius: 15, 
        elevation: 2, 
        marginBottom: 12, 
        alignItems: 'center' 
    },

    alertIconBox: { 
        width: 50, 
        height: 50, 
        backgroundColor: '#F0F9FF', 
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },

    alertIconText: { fontSize: 20 },

    alertInfo: { 
        flex: 1, 
        marginLeft: 15 
    },

    alertHeaderRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    },

    alertTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#1E3A8A' 
    },

    criticalBadge: { 
        backgroundColor: '#FEE2E2', 
        paddingHorizontal: 8, 
        paddingVertical: 2, 
        borderRadius: 10 
    },

    badgeText: { 
        color: '#DC2626', 
        fontSize: 10, 
        fontWeight: 'bold' 
    },

    riskBadge: { 
        backgroundColor: '#D1FAE5', 
        paddingHorizontal: 8, 
        paddingVertical: 2, 
        borderRadius: 10 
    },

    riskText: { 
        color: '#059669', 
        fontSize: 10, 
        fontWeight: 'bold' 
    },

    alertSub: { 
        color: '#64748B', 
        fontSize: 12, 
        marginTop: 4 
    }
});
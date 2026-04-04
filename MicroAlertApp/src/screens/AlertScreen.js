import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    StatusBar
} from 'react-native';
import API from '../api/apiService';
import LinearGradient from 'react-native-linear-gradient'; // Correct import for non-Expo

export default function AlertScreen({ navigation }) {

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        try {
            const res = await API.get('/reports');
            setAlerts(res.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    // Helper to pick an icon based on type (fallback to warning)
    const getAlertIcon = (type) => {
        const t = type?.toLowerCase() || '';
        if (t.includes('fire')) return '🔥';
        if (t.includes('flood') || t.includes('water')) return '🌊';
        if (t.includes('earthquake')) return '🏚️';
        if (t.includes('landslide')) return '⛰️';
        return '⚠️';
    };

    return (
        <LinearGradient colors={['#0F172A', '#1E1B4B']} style={styles.safeArea}>
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
                
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.glassBackBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                            <Text style={styles.backArrow}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Live Alerts</Text>
                        <View style={{ width: 44 }} /> {/* Spacer to center title */}
                    </View>

                    {/* Content */}
                    {loading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#FF416C" />
                            <Text style={styles.loadingText}>Fetching live reports...</Text>
                        </View>
                    ) : (
                        <ScrollView 
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        >
                            {alerts.length === 0 ? (
                                <View style={styles.centerContainer}>
                                    <Text style={styles.emptyEmoji}>🛡️</Text>
                                    <Text style={styles.emptyText}>No active alerts at the moment.</Text>
                                </View>
                            ) : (
                                alerts.map(alert => (
                                    <View key={alert._id} style={styles.glassCard}>
                                        <View style={styles.cardHeader}>
                                            <View style={styles.iconBox}>
                                                <Text style={styles.iconText}>{getAlertIcon(alert.type || alert.disasterType)}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.typeText}>{alert.type || alert.disasterType || 'Alert'}</Text>
                                                <View style={styles.liveBadge}>
                                                    <View style={styles.pulseDot} />
                                                    <Text style={styles.liveText}>LIVE</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <Text style={styles.descriptionText}>
                                            {alert.description || alert.address || "No details provided for this incident."}
                                        </Text>

                                        <View style={styles.divider} />

                                        <View style={styles.footerRow}>
                                            <Text style={styles.reporterIcon}>👤</Text>
                                            <Text style={styles.time}>
                                                Reported by: <Text style={styles.reporterName}>{alert.user?.fullName || "Verified User"}</Text>
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    )}
                </View>

            </SafeAreaView>
        </LinearGradient>
    );
}

// ================= STYLES =================
const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },

    // Header
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: 25 
    },
    glassBackBtn: { 
        width: 44, height: 44, 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        borderRadius: 22, justifyContent: 'center', alignItems: 'center', 
        borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' 
    },
    backArrow: { fontSize: 22, color: '#FFFFFF', marginTop: -2 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },

    // Status States
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    loadingText: { color: '#FF416C', marginTop: 15, fontWeight: '600', fontSize: 15 },
    emptyEmoji: { fontSize: 40, marginBottom: 15 },
    emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '500' },

    // Glass Card
    glassCard: { 
        backgroundColor: 'rgba(239, 68, 68, 0.05)', // Subtle red tint for alerts
        padding: 20, 
        borderRadius: 20, 
        marginBottom: 16,
        borderWidth: 1, 
        borderColor: 'rgba(239, 68, 68, 0.2)'
    },
    cardHeader: { 
        flexDirection: 'row', 
        alignItems: 'center',
        marginBottom: 12
    },
    iconBox: {
        width: 46, height: 46,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    iconText: { fontSize: 22 },
    typeText: { 
        color: '#FFFFFF', 
        fontWeight: '800', 
        fontSize: 18,
        marginBottom: 4,
        letterSpacing: 0.5
    },

    // Live Badge
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    pulseDot: {
        width: 6, height: 6,
        backgroundColor: '#FCA5A5',
        borderRadius: 3,
        marginRight: 6
    },
    liveText: {
        color: '#FCA5A5',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1
    },

    // Body
    descriptionText: {
        color: '#CBD5E1',
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
        marginBottom: 15
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        marginBottom: 12
    },
    
    // Footer
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    reporterIcon: {
        fontSize: 14,
        marginRight: 6
    },
    time: { 
        fontSize: 13, 
        color: '#94A3B8', 
        fontWeight: '500' 
    },
    reporterName: {
        color: '#E2E8F0',
        fontWeight: '700'
    }
});
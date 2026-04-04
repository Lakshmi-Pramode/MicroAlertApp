import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    PermissionsAndroid,
    Platform,
    Alert,
    TouchableOpacity,
    SafeAreaView,
    StatusBar
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import API from '../api/apiService';
import LinearGradient from 'react-native-linear-gradient';

export default function ResourcesScreen({ navigation }) {

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    // ================= LOGIC (UNCHANGED) =================

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

    const getUserLocation = async () => {
        const hasPermission = await requestLocationPermission();

        if (!hasPermission) {
            Alert.alert("Permission Denied", "Location access is required");
            return null;
        }

        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                position => resolve(position.coords),
                error => reject(error),
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000
                }
            );
        });
    };

    const getDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat2 || !lon2) return null;

        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const fetchResources = async () => {
        try {
            const userLoc = await getUserLocation();
            const res = await API.get('/resources');

            if (!userLoc) {
                setResources(res.data);
                setLoading(false);
                return;
            }

            const updated = res.data.map(item => {
                const distance = getDistance(
                    userLoc.latitude,
                    userLoc.longitude,
                    item.coordinates?.latitude,
                    item.coordinates?.longitude
                );
                return { ...item, distance };
            });

            updated.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));

            setResources(updated);
            setLoading(false);

        } catch (err) {
            console.log("FETCH ERROR:", err.message);
            Alert.alert("Error", "Failed to load resources");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    // ================= UI HELPERS =================
    
    // Assigns an emoji based on the resource type for better scanning
    const getIconForType = (type) => {
        const t = type?.toLowerCase() || '';
        if (t.includes('medical') || t.includes('hospital')) return '🏥';
        if (t.includes('shelter') || t.includes('camp')) return '⛺';
        if (t.includes('food') || t.includes('water')) return '🍲';
        if (t.includes('police') || t.includes('security')) return '🚓';
        if (t.includes('fire')) return '🚒';
        return '📦';
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
                        <Text style={styles.headerTitle}>Nearby Resources</Text>
                        <View style={{ width: 44 }} /> {/* Spacer to center title */}
                    </View>

                    {/* Content */}
                    {loading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color="#38BDF8" />
                            <Text style={styles.loadingText}>Locating closest resources...</Text>
                        </View>
                    ) : resources.length === 0 ? (
                        <View style={styles.centerContainer}>
                            <Text style={styles.emptyEmoji}>🗺️</Text>
                            <Text style={styles.emptyText}>No resources found in this area.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={resources}
                            keyExtractor={(item) => item._id}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            renderItem={({ item }) => (
                                <View style={styles.glassCard}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.titleRow}>
                                            <View style={styles.iconBox}>
                                                <Text style={styles.iconText}>{getIconForType(item.type)}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                                                <Text style={styles.typeText}>{item.type}</Text>
                                            </View>
                                        </View>
                                        
                                        {/* Distance Badge */}
                                        <View style={[styles.distanceBadge, !item.distance && styles.distanceBadgeMuted]}>
                                            <Text style={[styles.distanceText, !item.distance && styles.distanceTextMuted]}>
                                                {item.distance ? `${item.distance.toFixed(1)} km` : "N/A"}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.divider} />

                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoIcon}>📞</Text>
                                        <Text style={styles.infoText} selectable={true}>{item.contact || "No contact provided"}</Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoIcon}>📍</Text>
                                        <Text style={styles.infoText}>{item.location || "No address provided"}</Text>
                                    </View>
                                </View>
                            )}
                        />
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
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#38BDF8', marginTop: 15, fontWeight: '600', fontSize: 15 },
    emptyEmoji: { fontSize: 40, marginBottom: 15 },
    emptyText: { color: '#94A3B8', fontSize: 16, fontWeight: '500' },

    // Glass Card
    glassCard: { 
        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
        padding: 20, 
        borderRadius: 20, 
        marginBottom: 16,
        borderWidth: 1, 
        borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    cardHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 15
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10
    },
    iconBox: {
        width: 42, height: 42,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    iconText: { fontSize: 20 },
    title: { 
        color: '#FFFFFF', 
        fontWeight: '700', 
        fontSize: 17,
        marginBottom: 2
    },
    typeText: { 
        color: '#94A3B8', 
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },

    // Distance Badge
    distanceBadge: {
        backgroundColor: 'rgba(56, 189, 248, 0.15)', // Glowing Cyan tint
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12
    },
    distanceText: { color: '#38BDF8', fontWeight: '800', fontSize: 12 },
    distanceBadgeMuted: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
    distanceTextMuted: { color: '#64748B' },

    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 15
    },

    // Info Rows
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    infoIcon: { fontSize: 16, marginRight: 10 },
    infoText: { 
        color: '#CBD5E1', 
        fontSize: 14, 
        fontWeight: '500',
        flex: 1,
        lineHeight: 20
    }
});
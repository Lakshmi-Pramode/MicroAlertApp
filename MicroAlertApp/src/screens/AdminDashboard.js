import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminDashboard({ navigation }) {
    
    // Function to handle logout
    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            navigation.replace('Login');
        } catch (error) {
            Alert.alert("Error", "Failed to logout");
        }
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Welcome Admin</Text>
                    <Text style={styles.title}>Dashboard</Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Stats Section */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: '#1E3A8A' }]}>
                        <Text style={styles.statNum}>12</Text>
                        <Text style={styles.statLabel}>Active Alerts</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#1E40AF' }]}>
                        <Text style={styles.statNum}>45</Text>
                        <Text style={styles.statLabel}>Total Reports</Text>
                    </View>
                </View>

                {/* Recent Incident Reports */}
                <Text style={styles.sectionTitle}>Recent Incident Reports</Text>
                
                <TouchableOpacity style={styles.reportItem}>
                    <View style={styles.reportHeader}>
                        <Text style={styles.reportType}>Flood - Sector 4</Text>
                        <View style={styles.pendingBadge}>
                            <Text style={styles.pendingText}>PENDING</Text>
                        </View>
                    </View>
                    <Text style={styles.reportDetails}>Reported by: John Doe</Text>
                    <Text style={styles.reportTime}>10 mins ago</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.reportItem}>
                    <View style={styles.reportHeader}>
                        <Text style={styles.reportType}>Landslide - Hillside Road</Text>
                        <View style={[styles.pendingBadge, {backgroundColor: '#FEF3C7'}]}>
                            <Text style={[styles.pendingText, {color: '#D97706'}]}>REVIEWING</Text>
                        </View>
                    </View>
                    <Text style={styles.reportDetails}>Reported by: Sarah Smith</Text>
                    <Text style={styles.reportTime}>35 mins ago</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30,
    },
    welcomeText: {
        fontSize: 14,
        color: '#6B7280',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
    },
    logoutBtn: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    logoutText: {
        color: '#DC2626',
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statCard: {
        width: '48%',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 3,
    },
    statNum: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statLabel: {
        color: '#DBEAFE',
        fontSize: 12,
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 15,
    },
    reportItem: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 2,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reportType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    pendingBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    pendingText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#6B7280',
    },
    reportDetails: {
        fontSize: 13,
        color: '#4B5563',
    },
    reportTime: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 5,
    },
});
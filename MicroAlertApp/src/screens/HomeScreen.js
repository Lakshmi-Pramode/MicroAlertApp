import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

export default function HomeScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Header Section */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.greetText}>GOOD MORNING</Text>
                        <Text style={styles.userName}>Guest</Text>
                    </View>
                    <TouchableOpacity style={styles.bellBtn}>
                        <View style={styles.notifDot} />
                        <Text style={styles.bellIcon}>🔔</Text>
                    </TouchableOpacity>
                </View>

                {/* Hyperlocal Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <Text style={styles.statusIcon}>🛡️</Text>
                        <Text style={styles.statusTitle}>Hyperlocal Status</Text>
                    </View>
                    <Text style={styles.statusDescription}>
                        No active threats detected in Maple Avenue.
                    </Text>
                </View>

                {/* Main Action Button */}
                <TouchableOpacity style={styles.reportBtn}>
                    <Text style={styles.reportBtnText}>⊕ Report Disaster</Text>
                </TouchableOpacity>

                {/* Quick Action Grid */}
                <View style={styles.gridRow}>
                    <TouchableOpacity style={styles.gridBtn}>
                        <Text style={styles.gridIcon}>🔔</Text>
                        <Text style={styles.gridText}>View Alerts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.gridBtn} 
                        onPress={() => navigation.navigate('Resources')}
                    >
                        <Text style={styles.gridIcon}>📄</Text>
                        <Text style={styles.gridText}>Resources</Text>
                    </TouchableOpacity>
                </View>

                {/* Nearby Alerts Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Nearby Alerts</Text>
                    <TouchableOpacity><Text style={styles.seeAll}>SEE ALL</Text></TouchableOpacity>
                </View>

                {/* Alert Card 1 */}
                <View style={styles.alertCard}>
                    <View style={styles.alertIconBox}>
                        <Text style={styles.alertIconText}>⚠️</Text>
                    </View>
                    <View style={styles.alertInfo}>
                        <View style={styles.alertHeaderRow}>
                            <Text style={styles.alertTitle}>Flood</Text>
                            <View style={styles.criticalBadge}><Text style={styles.badgeText}>CRITICAL</Text></View>
                        </View>
                        <Text style={styles.alertSub}>Maple Avenue • 10 mins ago</Text>
                    </View>
                </View>

                {/* Alert Card 2 */}
                <View style={styles.alertCard}>
                    <View style={[styles.alertIconBox, {backgroundColor: '#FFFBEB'}]}>
                        <Text style={styles.alertIconText}>⚠️</Text>
                    </View>
                    <View style={styles.alertInfo}>
                        <View style={styles.alertHeaderRow}>
                            <Text style={styles.alertTitle}>Landslide</Text>
                            <View style={styles.riskBadge}><Text style={styles.riskText}>AT RISK</Text></View>
                        </View>
                        <Text style={styles.alertSub}>Hillside Road • 30 mins ago</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContent: { padding: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 30 },
    greetText: { fontSize: 14, color: '#94A3B8', fontWeight: 'bold' },
    userName: { fontSize: 28, color: '#1E3A8A', fontWeight: 'bold' },
    bellBtn: { width: 45, height: 45, backgroundColor: '#F1F5F9', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    notifDot: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, backgroundColor: 'red', borderRadius: 4, zIndex: 1 },
    statusCard: { padding: 25, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 25 },
    statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    statusTitle: { color: '#BFDBFE', fontWeight: 'bold', marginLeft: 10 },
    statusDescription: { color: '#BFDBFE', fontSize: 16 },
    reportBtn: { backgroundColor: '#DC2626', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 5, marginBottom: 25 },
    reportBtnText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
    gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    gridBtn: { backgroundColor: '#FFFFFF', width: '47%', padding: 20, borderRadius: 15, elevation: 3, alignItems: 'center' },
    gridText: { fontWeight: 'bold', color: '#1E3A8A', marginTop: 10 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E3A8A' },
    seeAll: { color: '#DC2626', fontWeight: 'bold' },
    alertCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 15, borderRadius: 15, elevation: 2, marginBottom: 12, alignItems: 'center' },
    alertIconBox: { width: 50, height: 50, backgroundColor: '#FEF2F2', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    alertInfo: { flex: 1, marginLeft: 15 },
    alertHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    alertTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A' },
    criticalBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    badgeText: { color: '#DC2626', fontSize: 10, fontWeight: 'bold' },
    riskBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    riskText: { color: '#D97706', fontSize: 10, fontWeight: 'bold' },
    alertSub: { color: '#64748B', fontSize: 12, marginTop: 4 }
});
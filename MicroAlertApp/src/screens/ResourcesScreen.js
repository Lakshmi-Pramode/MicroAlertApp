import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

export default function ResourcesScreen({ navigation }) {
    const ResourceItem = ({ name }) => (
        <View style={styles.resourceItem}>
            <View style={styles.dot} />
            <Text style={styles.itemName}>{name}</Text>
            <TouchableOpacity style={styles.contactBtn}>
                <Text style={styles.contactText}>CONTACT</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Disaster Resources</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Shelter Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconBox}><Text>🏠</Text></View>
                        <View>
                            <Text style={styles.cardTitle}>Shelter Locations</Text>
                            <Text style={styles.cardSub}>3 locations nearby</Text>
                        </View>
                    </View>
                    <ResourceItem name="Community Center A" />
                    <ResourceItem name="Red Cross Point" />
                </View>

                {/* Food Section */}
                <View style={styles.card}>
                    <View style={[styles.cardHeader, {backgroundColor: '#F0FDF4'}]}>
                        <View style={[styles.iconBox, {backgroundColor: '#DCFCE7'}]}><Text>ℹ️</Text></View>
                        <View>
                            <Text style={styles.cardTitle}>Food Distribution</Text>
                            <Text style={styles.cardSub}>5 locations nearby</Text>
                        </View>
                    </View>
                    <ResourceItem name="Community Center A" />
                    <ResourceItem name="Red Cross Point" />
                </View>

                {/* Medical Section */}
                <View style={styles.card}>
                    <View style={[styles.cardHeader, {backgroundColor: '#FEF2F2'}]}>
                        <View style={[styles.iconBox, {backgroundColor: '#FEE2E2'}]}><Text>🛡️</Text></View>
                        <View>
                            <Text style={styles.cardTitle}>Medical Assistance</Text>
                            <Text style={styles.cardSub}>2 locations nearby</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    backArrow: { fontSize: 24, color: '#1E3A8A', marginRight: 20 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E3A8A' },
    scrollContainer: { padding: 20 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 20, overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', padding: 15, alignItems: 'center', backgroundColor: '#F8FAFC' },
    iconBox: { width: 40, height: 40, backgroundColor: '#F1F5F9', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A' },
    cardSub: { fontSize: 12, color: '#64748B' },
    resourceItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    dot: { width: 8, height: 8, backgroundColor: '#22C55E', borderRadius: 4, marginRight: 10 },
    itemName: { flex: 1, color: '#1E3A8A', fontSize: 15 },
    contactBtn: { backgroundColor: '#EFF6FF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
    contactText: { color: '#2563EB', fontWeight: 'bold', fontSize: 12 }
});
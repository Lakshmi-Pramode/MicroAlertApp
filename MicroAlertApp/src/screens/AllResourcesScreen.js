import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    StyleSheet, 
    SafeAreaView, 
    Alert,
    ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import API from '../api/apiService';

export default function AllResources() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await API.get('/resources');
            setData(res.data);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        // 🧪 DEBUG: This alert proves the button click works
        console.log("Attempting to delete ID:", id);

        Alert.alert(
            "Confirm Delete",
            "Remove this resource permanently?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            // This calls: DELETE http://10.171.8.130:5000/api/resources/[id]
                            await API.delete(`/resources/${id}`);
                            
                            // Remove from UI immediately
                            setData(currentData => currentData.filter(item => item._id !== id));
                        } catch (error) {
                            console.log("Delete API Error:", error.response?.data || error.message);
                            Alert.alert("Error", "Server failed to delete the item.");
                        }
                    } 
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>← Back to Dashboard</Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => item._id.toString()}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <View style={styles.glassCard}>
                            <View style={styles.cardHeader}>
                                {/* Using a container with flex ensures the title doesn't cover the button */}
                                <View style={styles.titleContainer}>
                                    <Text style={styles.title}>{item.title}</Text>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{item.type}</Text>
                                    </View>
                                </View>
                                
                                <TouchableOpacity 
                                    onPress={() => handleDelete(item._id)}
                                    style={styles.deleteBtn}
                                    activeOpacity={0.6}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Makes the click area larger
                                >
                                    <Text style={styles.deleteIcon}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <View style={styles.infoRow}>
                                <Text style={styles.infoText}>📞 {item.contact}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoText}>📍 {item.location}</Text>
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A', paddingTop: 10 },
    backButton: { marginHorizontal: 15, marginBottom: 20, padding: 12, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, borderRadius: 12, alignItems: 'center' },
    backText: { color: '#38BDF8', fontSize: 16, fontWeight: '600' },
    
    glassCard: { marginHorizontal: 15, marginBottom: 15, padding: 20, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, borderRadius: 16 },
    
    cardHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 10 
    },
    titleContainer: { flex: 1, marginRight: 10 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
    
    badge: { alignSelf: 'flex-start', backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    badgeText: { color: '#38BDF8', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    
    infoRow: { marginTop: 6 },
    infoText: { fontSize: 14, color: '#CBD5E1' },
    
    deleteBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        zIndex: 999, // Ensures it's on top
    },
    deleteIcon: { fontSize: 18 }
});
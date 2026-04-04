import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // 1. Import the hook
import API from '../api/apiService';

export default function AllResources() {
    const [data, setData] = useState([]);
    const navigation = useNavigation(); // 2. Initialize the hook

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await API.get('/resources');
            setData(res.data);
        } catch (error) {
            console.error("Error fetching resources:", error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Dark Glass Back Button */}
            <TouchableOpacity 
                onPress={() => navigation.goBack()} // 3. Call goBack() here
                style={styles.backButton}
                activeOpacity={0.7}
            >
                <Text style={styles.backText}>← Back to Dashboard</Text>
            </TouchableOpacity>

            {/* Resources List */}
            <FlatList
                data={data}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <View style={styles.glassCard}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.subtitle}>{item.type}</Text>
                        
                        <View style={styles.infoRow}>
                            <Text style={styles.infoText}>📞 {item.contact}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoText}>📍 {item.location}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        paddingTop: 10,
    },
    backButton: {
        marginHorizontal: 15,
        marginBottom: 20,
        padding: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        alignItems: 'center',
    },
    backText: {
        color: '#E0E0E0',
        fontSize: 16,
        fontWeight: '600',
    },
    glassCard: {
        marginHorizontal: 15,
        marginBottom: 15,
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoRow: {
        marginTop: 6,
    },
    infoText: {
        fontSize: 15,
        color: '#E0E0E0',
    }
});
import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity,
    ActivityIndicator 
} from 'react-native';
import API from '../api/apiService';

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

    return (
        <View style={styles.container}>

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Live Alerts</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#1E3A8A" />
            ) : (
                <ScrollView>
                    {alerts.length === 0 ? (
                        <Text>No active alerts</Text>
                    ) : (
                        alerts.map(alert => (
                            <View key={alert._id} style={styles.card}>
                                <Text style={styles.type}>{alert.type}</Text>
                                <Text>{alert.description}</Text>
                                <Text style={styles.time}>
                                    Reported by: {alert.user?.fullName || "Unknown"}
                                </Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    back: { fontSize: 16, marginBottom: 20, color: '#1E3A8A', fontWeight: 'bold' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    card: { backgroundColor: '#F3F4F6', padding: 15, borderRadius: 12, marginBottom: 15 },
    type: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    time: { fontSize: 12, color: '#6B7280', marginTop: 5 }
});
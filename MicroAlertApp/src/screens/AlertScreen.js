import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import API from '../api/apiService';

export default function AlertScreen() {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        API.get('/reports')
            .then(res => setAlerts(res.data.filter(r => r.status === 'approved')))
            .catch(() => {});
    }, []);

    return (
        <ScrollView style={{ padding: 20 }}>
            {alerts.map(alert => (
                <View key={alert._id} style={{ marginBottom: 15 }}>
                    <Text style={{ fontWeight: 'bold' }}>{alert.type}</Text>
                    <Text>{alert.description}</Text>
                </View>
            ))}
        </ScrollView>
    );
}
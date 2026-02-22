import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import API from '../api/apiService';

export default function ReportScreen({ navigation }) {
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');

    const submitReport = async () => {
        try {
            await API.post('/reports', { type, description });
            Alert.alert("Success", "Report submitted for verification");
            navigation.goBack();
        } catch (err) {
            Alert.alert("Error", "Failed to submit report");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Report Disaster</Text>

            <TextInput
                style={styles.input}
                placeholder="Disaster Type (Flood, Fire...)"
                onChangeText={setType}
            />

            <TextInput
                style={styles.input}
                placeholder="Description"
                onChangeText={setDescription}
            />

            <TouchableOpacity style={styles.btn} onPress={submitReport}>
                <Text style={styles.btnText}>Submit</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, padding: 15, borderRadius: 10, marginBottom: 15 },
    btn: { backgroundColor: 'red', padding: 15, borderRadius: 10 },
    btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});
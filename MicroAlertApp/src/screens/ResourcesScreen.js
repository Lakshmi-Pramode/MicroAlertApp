import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    PermissionsAndroid,
    Platform,
    Alert
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import API from '../api/apiService';

export default function ResourcesScreen() {

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ Request Location Permission (IMPORTANT)
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

    // 📍 Get User Location
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

    // 📏 Distance Calculation (Haversine Formula)
    const getDistance = (lat1, lon1, lat2, lon2) => {

        // ✅ Prevent crash if coordinates missing
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

    // 🔄 Fetch Resources
    const fetchResources = async () => {
        try {
            const userLoc = await getUserLocation();

            const res = await API.get('/resources');

            // If location not available, just show data
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

            // Sort only if distance exists
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

    if (loading) {
        return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Nearby Resources</Text>

            <FlatList
                data={resources}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text>Type: {item.type}</Text>
                        <Text>Contact: {item.contact}</Text>
                        <Text>📍 {item.location}</Text>

                        <Text style={styles.distance}>
                            {item.distance
                                ? `${item.distance.toFixed(2)} km away`
                                : "Distance N/A"}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15
    },
    card: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: '#fff'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16
    },
    distance: {
        color: 'green',
        marginTop: 5
    }
});
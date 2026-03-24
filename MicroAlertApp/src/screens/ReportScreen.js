import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  PermissionsAndroid,
  Platform,
  ActivityIndicator
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import API from '../api/apiService';

export default function ReportScreen({ navigation }) {

  const [selectedType, setSelectedType] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState(''); // 🚨 NEW: State for place name
  const [loadingLocation, setLoadingLocation] = useState(false); // 🚨 NEW: Loading state

  const disasterTypes = ['Flood', 'Landslide', 'Fire', 'Other'];

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera',
          buttonPositive: 'OK'
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  // 🚨 NEW: Reverse Geocoding Function
  const fetchAddress = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
        { headers: { 'User-Agent': 'MicroAlertApp' } }
      );
      const data = await response.json();
      // display_name gives the full address string
      const displayAddress = data.display_name || "Location Name Not Found";
      setAddress(displayAddress);
    } catch (error) {
      console.log("Geocoding Error:", error);
      setAddress("Address lookup failed");
    }
  };

  // Capture Photo
  const capturePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert("Camera permission denied");
      return;
    }

    launchCamera(
      { mediaType: 'photo', quality: 0.8, saveToPhotos: true },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert("Camera Error", response.errorMessage || "Error opening camera");
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const file = response.assets[0];
          setMediaFile(file);
          setMediaType('photo');
          Alert.alert("Photo Captured");
        }
      }
    );
  };

  // Capture Video
  const captureVideo = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert("Camera permission denied");
      return;
    }

    launchCamera(
      { mediaType: 'video', videoQuality: 'high' },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert("Camera Error", response.errorMessage || "Error opening camera");
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const file = response.assets[0];
          setMediaFile(file);
          setMediaType('video');
          Alert.alert("Video Recorded");
        }
      }
    );
  };

  // Get Live Location
  const getLocation = () => {
    setLoadingLocation(true);
    
    Geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);
        
        fetchAddress(lat, lon).then(() => {
            setLoadingLocation(false);
            Alert.alert("Location Updated", "Current address captured successfully.");
        });
      },
      error => {
        setLoadingLocation(false);
        // 🚨 If it's a timeout, try one more time with lower accuracy
        Alert.alert("Location Error", "Could not get a precise lock. Try moving near a window or setting your emulator location.");
        console.log("GPS Error:", error);
      },
      { 
        enableHighAccuracy: true, // 🚨 Uses GPS instead of Network
        timeout: 15000,           // 🚨 Wait up to 15 seconds for a lock
        maximumAge: 0             // 🚨 Force a fresh location, don't use cache
      }
    );
  };

  // Submit Report
  const submitReport = async () => {
    if (!selectedType) {
      Alert.alert("Please select disaster type");
      return;
    }

    if (!mediaFile) {
      Alert.alert("Please capture photo or video");
      return;
    }

    if (!latitude || !longitude) {
      Alert.alert("Please detect location");
      return;
    }

    const formData = new FormData();
    formData.append('disasterType', selectedType);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    formData.append('address', address); // 🚨 NEW: Appending the place name

    // ⚡ Bulletproof FormData attachment
    formData.append('image', {
      uri: mediaFile.uri,
      type: mediaFile.type || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
      name: mediaFile.fileName || (mediaType === 'video' ? 'video.mp4' : 'photo.jpg')
    });

    try {
      await API.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Alert.alert("Success", "Report submitted successfully");

      // Reset form
      setSelectedType('');
      setMediaFile(null);
      setMediaType(null);
      setLatitude(null);
      setLongitude(null);
      setAddress('');

      navigation.goBack();

    } catch (err) {
      console.log(err.response || err.message);
      Alert.alert("Error", "Failed to submit report");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report Disaster</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.sectionTitle}>Disaster Type</Text>
        <View style={styles.typeGrid}>
          {disasterTypes.map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.typeButton, selectedType === type && styles.typeSelected]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.typeText, selectedType === type && styles.typeTextSelected]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.mediaRow}>
          <TouchableOpacity style={styles.mediaCard} onPress={capturePhoto}>
            <Text style={styles.mediaIcon}>📷</Text>
            <Text style={styles.mediaTitle}>Capture Live Photo</Text>
            <Text style={styles.mediaSub}>Real-time Evidence</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mediaCard} onPress={captureVideo}>
            <Text style={styles.mediaIcon}>🎥</Text>
            <Text style={styles.mediaTitle}>Record Live Video</Text>
            <Text style={styles.mediaSub}>Motion Evidence</Text>
          </TouchableOpacity>
        </View>

        {mediaFile && mediaType === 'photo' && (
          <Image source={{ uri: mediaFile.uri }} style={styles.preview} />
        )}
        {mediaFile && mediaType === 'video' && (
          <Text style={{ marginBottom: 20, color: '#111827' }}>🎥 Video Ready to Upload</Text>
        )}

        <Text style={styles.sectionTitle}>Live Location</Text>
        <TouchableOpacity 
            style={styles.locationCard} 
            onPress={getLocation}
            disabled={loadingLocation}
        >
          <Text style={styles.locationIcon}>📍</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.autoDetected}>
                {loadingLocation ? "DETECTING..." : "AUTO-DETECTED"}
            </Text>
            
            {loadingLocation ? (
                <ActivityIndicator size="small" color="#1E3A8A" style={{ alignSelf: 'flex-start', marginTop: 5 }} />
            ) : (
                <Text style={styles.locationText} numberOfLines={2}>
                    {address ? address : (latitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : "Tap to Detect Location")}
                </Text>
            )}

            {address && latitude && (
                <Text style={styles.coordsLabel}>
                    Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </Text>
            )}
          </View>
        </TouchableOpacity>

      </ScrollView>

      <TouchableOpacity style={styles.submitBtn} onPress={submitReport}>
        <Text style={styles.submitText}>Submit Report</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 20, paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
  back: { fontSize: 22, color: '#111827' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 15, color: '#374151' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  typeButton: { width: '48%', paddingVertical: 18, borderRadius: 15, backgroundColor: '#F3F4F6', alignItems: 'center', marginBottom: 15 },
  typeSelected: { backgroundColor: '#1E3A8A' },
  typeText: { fontSize: 15, fontWeight: '500', color: '#374151' },
  typeTextSelected: { color: '#FFFFFF' },
  mediaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  mediaCard: { width: '48%', borderWidth: 1.5, borderColor: '#D1D5DB', borderStyle: 'dashed', borderRadius: 18, paddingVertical: 30, alignItems: 'center', backgroundColor: '#FFFFFF' },
  mediaIcon: { fontSize: 28, marginBottom: 10 },
  mediaTitle: { fontWeight: '600', textAlign: 'center', marginBottom: 5, color: '#111827' },
  mediaSub: { fontSize: 12, color: '#6B7280' },
  preview: { width: '100%', height: 200, borderRadius: 15, marginBottom: 20 },
  locationCard: { flexDirection: 'row', backgroundColor: '#E0E7FF', padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 120 },
  locationIcon: { fontSize: 20, marginRight: 12 },
  autoDetected: { fontSize: 12, fontWeight: '700', color: '#1E40AF' },
  locationText: { fontSize: 14, color: '#1E3A8A', fontWeight: '500', marginTop: 2 },
  coordsLabel: { fontSize: 11, color: '#1E40AF', opacity: 0.7, marginTop: 4 },
  submitBtn: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#1E3A8A', padding: 18, borderRadius: 20, alignItems: 'center' },
  submitText: { color: '#FFFFFF', fontWeight: '600' }
});
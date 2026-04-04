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
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import API from '../api/apiService';
import LinearGradient from 'react-native-linear-gradient'; // Correct import for non-Expo

export default function ReportScreen({ navigation }) {

  const [selectedType, setSelectedType] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState(''); 
  const [loadingLocation, setLoadingLocation] = useState(false); 

  const disasterTypes = ['Flood', 'Landslide', 'Other'];

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

  const fetchAddress = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
        { headers: { 'User-Agent': 'MicroAlertApp' } }
      );
      const data = await response.json();
      const displayAddress = data.display_name || "Location Name Not Found";
      setAddress(displayAddress);
    } catch (error) {
      console.log("Geocoding Error:", error);
      setAddress("Address lookup failed");
    }
  };

  const capturePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    launchCamera(
      { 
        mediaType: 'photo', 
        quality: 0.4,       
        maxWidth: 1000,     
        maxHeight: 1000,    
        saveToPhotos: false 
      },
      response => {
        if (response.didCancel) return;
        if (response.assets && response.assets.length > 0) {
          setMediaFile(response.assets[0]);
          setMediaType('photo');
        }
      }
    );
  };

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

  const getLocation = () => {
    setLoadingLocation(true);
    
    const options = { 
      enableHighAccuracy: true, 
      timeout: 15000, 
      maximumAge: 10000 
    };

    Geolocation.getCurrentPosition(
      position => {
        const { latitude: lat, longitude: lon } = position.coords;
        setLatitude(lat);
        setLongitude(lon);
        fetchAddress(lat, lon).then(() => setLoadingLocation(false));
      },
      error => {
        if (error.code === 3 || error.code === 2) { 
            Geolocation.getCurrentPosition(
                position => {
                    const { latitude: lat, longitude: lon } = position.coords;
                    setLatitude(lat);
                    setLongitude(lon);
                    fetchAddress(lat, lon).then(() => setLoadingLocation(false));
                },
                err => {
                    setLoadingLocation(false);
                    Alert.alert("Location Error", "Please ensure GPS is on and you are not in a basement.");
                },
                { enableHighAccuracy: false, timeout: 15000 }
            );
        } else {
            setLoadingLocation(false);
            Alert.alert("Location Error", error.message);
        }
      },
      options
    );
  };

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
    formData.append('address', address); 

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
    <LinearGradient colors={['#0F172A', '#1E1B4B']} style={styles.safeArea}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        
        <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.glassBackBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Text style={styles.back}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Report Disaster</Text>
            <View style={{ width: 44 }} /> {/* Spacer for centering */}
          </View>

          {/* Disaster Type Section */}
          <Text style={styles.sectionTitle}>Disaster Type</Text>
          <View style={styles.typeGrid}>
            {disasterTypes.map(type => {
              const isSelected = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={styles.typeButtonWrapper}
                  onPress={() => setSelectedType(type)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={isSelected ? ['#38BDF8', '#3B82F6'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                    style={[styles.typeButton, isSelected && styles.typeButtonSelected]}
                  >
                    <Text style={[styles.typeText, isSelected && styles.typeTextSelected]}>
                      {type}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Media Capture Section */}
          <Text style={styles.sectionTitle}>Evidence (Photo or Video)</Text>
          <View style={styles.mediaRow}>
            <TouchableOpacity style={styles.mediaCard} onPress={capturePhoto} activeOpacity={0.6}>
              <View style={styles.iconCircle}>
                <Text style={styles.mediaIcon}>📷</Text>
              </View>
              <Text style={styles.mediaTitle}>Live Photo</Text>
              <Text style={styles.mediaSub}>Real-time Evidence</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaCard} onPress={captureVideo} activeOpacity={0.6}>
              <View style={styles.iconCircle}>
                <Text style={styles.mediaIcon}>🎥</Text>
              </View>
              <Text style={styles.mediaTitle}>Live Video</Text>
              <Text style={styles.mediaSub}>Motion Evidence</Text>
            </TouchableOpacity>
          </View>

          {/* Media Preview */}
          {mediaFile && mediaType === 'photo' && (
            <View style={styles.previewContainer}>
                <Image source={{ uri: mediaFile.uri }} style={styles.preview} />
                <Text style={styles.previewTag}>📸 Photo Attached</Text>
            </View>
          )}
          {mediaFile && mediaType === 'video' && (
            <View style={styles.videoReadyBadge}>
                <Text style={styles.videoReadyText}>🎥 Video Ready to Upload</Text>
            </View>
          )}

          {/* Location Section */}
          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Live Location</Text>
          <TouchableOpacity 
              style={styles.locationCard} 
              onPress={getLocation}
              disabled={loadingLocation}
              activeOpacity={0.7}
          >
            <View style={styles.locationIconBox}>
                <Text style={styles.locationEmoji}>📍</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.autoDetected}>
                  {loadingLocation ? "DETECTING COORDINATES..." : "AUTO-DETECTED"}
              </Text>
              
              {loadingLocation ? (
                  <ActivityIndicator size="small" color="#38BDF8" style={{ alignSelf: 'flex-start', marginTop: 5 }} />
              ) : (
                  <Text style={styles.locationText} numberOfLines={2}>
                      {address ? address : (latitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : "Tap to Detect Location")}
                  </Text>
              )}

              {address && latitude && (
                  <Text style={styles.coordsLabel}>
                      Lat: {latitude.toFixed(4)} | Lon: {longitude.toFixed(4)}
                  </Text>
              )}
            </View>
          </TouchableOpacity>

        </ScrollView>

        {/* Floating Submit Button */}
        <View style={styles.bottomContainer}>
            <TouchableOpacity onPress={submitReport} activeOpacity={0.8} style={styles.btnShadow}>
                <LinearGradient 
                    colors={['#FF416C', '#FF4B2B']} 
                    start={{ x: 0, y: 0 }} 
                    end={{ x: 1, y: 0 }}
                    style={styles.submitBtn}
                >
                    <Text style={styles.submitText}>Submit Report</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { 
      paddingHorizontal: 24, 
      paddingTop: 20, 
      paddingBottom: 120 // Extra space so scroll doesn't get hidden behind floating button
  },

  // Header
  header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      marginBottom: 35 
  },
  glassBackBtn: { 
      width: 44, height: 44, 
      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
      borderRadius: 22, justifyContent: 'center', alignItems: 'center', 
      borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', 
  },
  back: { fontSize: 22, color: '#FFFFFF', marginTop: -2 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 15, color: '#CBD5E1', letterSpacing: 0.5 },

  // Disaster Types
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  typeButtonWrapper: { width: '48%', marginBottom: 15 },
  typeButton: { 
      paddingVertical: 18, 
      borderRadius: 16, 
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  typeButtonSelected: {
      borderColor: '#38BDF8',
      shadowColor: '#38BDF8',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4
  },
  typeText: { fontSize: 15, fontWeight: '600', color: '#94A3B8' },
  typeTextSelected: { color: '#FFFFFF', fontWeight: '800' },

  // Media Capture
  mediaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  mediaCard: { 
      width: '48%', 
      borderWidth: 1.5, 
      borderColor: 'rgba(255, 255, 255, 0.2)', 
      borderStyle: 'dashed', 
      borderRadius: 20, 
      paddingVertical: 24, 
      alignItems: 'center', 
      backgroundColor: 'rgba(255, 255, 255, 0.03)' 
  },
  iconCircle: {
      width: 50, height: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12
  },
  mediaIcon: { fontSize: 24 },
  mediaTitle: { fontWeight: '700', textAlign: 'center', marginBottom: 4, color: '#FFFFFF', fontSize: 15 },
  mediaSub: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },

  // Previews
  previewContainer: { marginBottom: 25, position: 'relative' },
  preview: { width: '100%', height: 220, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  previewTag: { 
      position: 'absolute', top: 15, left: 15, 
      backgroundColor: 'rgba(0,0,0,0.7)', color: '#FFF', 
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, 
      fontSize: 12, fontWeight: '700', overflow: 'hidden'
  },
  videoReadyBadge: {
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      borderWidth: 1,
      borderColor: 'rgba(34, 197, 94, 0.4)',
      padding: 16,
      borderRadius: 16,
      marginBottom: 25,
      alignItems: 'center'
  },
  videoReadyText: { color: '#86EFAC', fontWeight: '700', fontSize: 14 },

  // Location
  locationCard: { 
      flexDirection: 'row', 
      backgroundColor: 'rgba(56, 189, 248, 0.1)', // Subtle cyan tint
      padding: 20, 
      borderRadius: 20, 
      alignItems: 'center', 
      borderWidth: 1,
      borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  locationIconBox: {
      width: 46, height: 46,
      backgroundColor: 'rgba(56, 189, 248, 0.2)',
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16
  },
  locationEmoji: { fontSize: 22 },
  autoDetected: { fontSize: 11, fontWeight: '800', color: '#38BDF8', letterSpacing: 0.5 },
  locationText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600', marginTop: 4, lineHeight: 22 },
  coordsLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '500', marginTop: 6 },

  // Submit Button (Floating)
  bottomContainer: {
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      paddingHorizontal: 24,
      paddingVertical: 20,
      backgroundColor: '#0F172A', // Match background to hide scrolling content underneath
      borderTopWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)'
  },
  btnShadow: { 
      shadowColor: '#FF416C', 
      shadowOffset: { width: 0, height: 6 }, 
      shadowOpacity: 0.4, 
      shadowRadius: 12, 
      elevation: 8 
  },
  submitBtn: { 
      paddingVertical: 20, 
      borderRadius: 18, 
      alignItems: 'center',
      justifyContent: 'center'
  },
  submitText: { color: '#FFFFFF', fontWeight: '800', fontSize: 18, letterSpacing: 0.5 }
});
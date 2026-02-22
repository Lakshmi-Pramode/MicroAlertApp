import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import API from '../api/apiService';

export default function ReportScreen({ navigation }) {

  const [selectedType, setSelectedType] = useState('');

  const disasterTypes = ['Flood', 'Landslide', 'Fire', 'Other'];

  const submitReport = async () => {
    if (!selectedType) {
      Alert.alert("Select Disaster Type", "Please choose a disaster type.");
      return;
    }

    try {
      await API.post('/reports', {
        type: selectedType,
        description: `${selectedType} reported`
      });

      Alert.alert("Submitted", "Report sent for AI verification");
      navigation.goBack();

    } catch (err) {
      Alert.alert("Error", "Failed to submit report");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report Disaster</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Disaster Type */}
        <Text style={styles.sectionTitle}>Disaster Type</Text>

        <View style={styles.typeGrid}>
          {disasterTypes.map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                selectedType === type && styles.typeSelected
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Text
                style={[
                  styles.typeText,
                  selectedType === type && styles.typeTextSelected
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Media Section */}
        <View style={styles.mediaRow}>

          <TouchableOpacity style={styles.mediaCard}>
            <Text style={styles.mediaIcon}>📷</Text>
            <Text style={styles.mediaTitle}>Capture Live Photo</Text>
            <Text style={styles.mediaSub}>AI Risk Check</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mediaCard}>
            <Text style={styles.mediaIcon}>🎥</Text>
            <Text style={styles.mediaTitle}>Record Live Video</Text>
            <Text style={styles.mediaSub}>Motion Analysis</Text>
          </TouchableOpacity>

        </View>

        {/* Location Section */}
        <Text style={styles.sectionTitle}>Live Location</Text>

        <View style={styles.locationCard}>
          <Text style={styles.locationIcon}>📍</Text>
          <View>
            <Text style={styles.autoDetected}>AUTO-DETECTED</Text>
            <Text style={styles.locationText}>
              Maple Avenue, Sector 4
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={submitReport}>
        <Text style={styles.submitText}>Submit for AI Verification</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingTop: 50
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30
  },

  back: {
    fontSize: 22,
    color: '#111827'
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 15,
    color: '#374151'
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30
  },

  typeButton: {
    width: '48%',
    paddingVertical: 18,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    marginBottom: 15
  },

  typeSelected: {
    backgroundColor: '#1E3A8A'
  },

  typeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151'
  },

  typeTextSelected: {
    color: '#FFFFFF'
  },

  mediaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30
  },

  mediaCard: {
    width: '48%',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 18,
    paddingVertical: 30,
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },

  mediaIcon: {
    fontSize: 28,
    marginBottom: 10
  },

  mediaTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5
  },

  mediaSub: {
    fontSize: 12,
    color: '#6B7280'
  },

  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#E0E7FF',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 120
  },

  locationIcon: {
    fontSize: 20,
    marginRight: 12
  },

  autoDetected: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF'
  },

  locationText: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500'
  },

  submitBtn: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#9CA3AF',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center'
  },

  submitText: {
    color: '#FFFFFF',
    fontWeight: '600'
  }

});
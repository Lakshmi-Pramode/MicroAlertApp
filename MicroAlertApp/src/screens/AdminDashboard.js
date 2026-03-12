import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/apiService';

// Replace with your laptop IPv4
const BASE_URL = "http://192.168.1.5:5000";

export default function AdminDashboard({ navigation }) {

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH REPORTS =================
  const fetchReports = async () => {
    try {

      const res = await API.get('/reports/admin/all');
      setReports(res.data);

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ================= UPDATE STATUS =================
  const updateStatus = async (id, status) => {

    try {

      await API.put(`/reports/${id}`, { status });

      Alert.alert("Success", `Report ${status}`);

      fetchReports();

    } catch (error) {

      Alert.alert("Error", "Failed to update report");

    }
  };

  // ================= LOGOUT =================
  const handleLogout = async () => {

    await AsyncStorage.clear();

    navigation.replace('Login');

  };

  const activeAlerts = reports.filter(r => r.status === 'approved').length;
  const totalReports = reports.length;

  return (

    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>

        <View>
          <Text style={styles.welcomeText}>Welcome Admin</Text>
          <Text style={styles.title}>Dashboard</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </View>

      {loading ? (

        <ActivityIndicator size="large" color="#1E3A8A" />

      ) : (

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Stats */}
          <View style={styles.statsRow}>

            <View style={[styles.statCard, { backgroundColor: '#1E3A8A' }]}>
              <Text style={styles.statNum}>{activeAlerts}</Text>
              <Text style={styles.statLabel}>Active Alerts</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#1E40AF' }]}>
              <Text style={styles.statNum}>{totalReports}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </View>

          </View>

          <Text style={styles.sectionTitle}>Incident Reports</Text>

          {reports.length === 0 ? (

            <Text>No reports available</Text>

          ) : (

            reports.map(report => (

              <View key={report._id} style={styles.reportCard}>

                {/* Disaster Type + Status */}
                <View style={styles.reportHeader}>

                  <Text style={styles.reportType}>
                    {report.disasterType}
                  </Text>

                  <View style={[
                    styles.statusBadge,
                    report.status === 'approved' && styles.approvedBadge,
                    report.status === 'rejected' && styles.rejectedBadge,
                    report.status === 'pending' && styles.pendingBadge
                  ]}>
                    <Text style={styles.statusText}>
                      {report.status.toUpperCase()}
                    </Text>
                  </View>

                </View>

                {/* URGENT ALERT */}
                {report.priority === "urgent" && (

                  <Text style={styles.urgentText}>
                    🚨 Multiple reports from same location
                  </Text>

                )}

                {/* MEDIA DISPLAY */}
                {report.mediaUrl && (

                  <>
                    {report.mediaType === 'video' ? (

                      <Text style={{ color: '#1E3A8A', marginBottom: 10 }}>
                        🎥 Video uploaded (Preview not supported)
                      </Text>

                    ) : (

                      <Image
                        source={{ uri: `${BASE_URL}/uploads/${report.mediaUrl}` }}
                        style={styles.image}
                      />

                    )}
                  </>

                )}

                {/* Description */}
                <Text style={styles.detailText}>
                  {report.description}
                </Text>

                {/* Location */}
                <Text style={styles.locationText}>
                  📍 Lat: {report.latitude || "N/A"} | Long: {report.longitude || "N/A"}
                </Text>

                {/* Action Buttons */}
                {report.status === 'pending' && (

                  <View style={styles.actionRow}>

                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => updateStatus(report._id, 'approved')}
                    >
                      <Text style={styles.btnText}>Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => updateStatus(report._id, 'rejected')}
                    >
                      <Text style={styles.btnText}>Reject</Text>
                    </TouchableOpacity>

                  </View>

                )}

              </View>

            ))

          )}

        </ScrollView>

      )}

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 25,
  },

  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },

  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },

  logoutText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
  },

  statNum: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  statLabel: {
    color: '#DBEAFE',
    fontSize: 12,
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  reportCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 18,
    elevation: 3,
  },

  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  reportType: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  urgentText: {
    color: '#DC2626',
    fontWeight: 'bold',
    marginBottom: 10
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  approvedBadge: {
    backgroundColor: '#D1FAE5',
  },

  rejectedBadge: {
    backgroundColor: '#FECACA',
  },

  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },

  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },

  detailText: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 5,
  },

  locationText: {
    fontSize: 13,
    color: '#1E3A8A',
    marginBottom: 5,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  approveBtn: {
    backgroundColor: '#16A34A',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },

  rejectBtn: {
    backgroundColor: '#DC2626',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },

  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

});
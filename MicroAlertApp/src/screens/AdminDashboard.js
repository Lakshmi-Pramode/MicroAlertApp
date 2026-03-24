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

// Derived from centralized API config to ensure 10.0.2.2 is used for images
const SERVER_URL = API.defaults.baseURL.replace('/api', ''); 

export default function AdminDashboard({ navigation }) {

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH ALL REPORTS =================
  const fetchReports = async () => {
    try {
      const res = await API.get('/reports/admin/all');
      setReports(res.data);
    } catch (error) {
      console.log("Fetch Error:", error);
      Alert.alert("Error", "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ================= UPDATE STATUS (APPROVE/REJECT) =================
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/reports/${id}`, { status });
      Alert.alert("Success", `Report ${status}`);
      fetchReports(); // Refresh list to show status change
    } catch (error) {
      console.log("Update Error:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to update report");
    }
  };

  // ================= PERMANENT DELETE =================
  const deleteReport = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "This will permanently wipe this report and its image from the database. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Permanently", 
          style: "destructive", 
          onPress: async () => {
            try {
              await API.delete(`/reports/${id}`);
              Alert.alert("Deleted", "Report has been successfully removed.");
              fetchReports(); // Refresh list
            } catch (err) {
              console.log("Delete Error:", err);
              Alert.alert("Error", "Could not delete report");
            }
          }
        }
      ]
    );
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

      {/* Header Section */}
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

          {/* Statistics Cards */}
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
            <Text style={styles.noData}>No reports available</Text>
          ) : (
            reports.map(report => (
              <View key={report._id} style={styles.reportCard}>

                {/* Card Header: Type and Status */}
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

                {/* Urgent Tag */}
                {report.priority === "urgent" && (
                  <Text style={styles.urgentText}>
                    🚨 Multiple reports from same location
                  </Text>
                )}

                {/* Media Display */}
                {report.mediaUrl && (
                  <>
                    {report.mediaType === 'video' ? (
                      <View style={styles.videoPlaceholder}>
                         <Text style={{ color: '#1E3A8A' }}>🎥 Video uploaded (Preview not supported)</Text>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: `${SERVER_URL}/uploads/${report.mediaUrl}` }}
                        style={styles.image}
                      />
                    )}
                  </>
                )}

                {/* Report Details */}
                <Text style={styles.detailText}>
                  {report.description}
                </Text>

                {/* 🚨 FIX: DISPLAYING THE ADDRESS NAME */}
                <View style={styles.locationContainer}>
                  <Text style={styles.locationLabel}>📍 Incident Location:</Text>
                  
                  {/* If address exists, show it. Otherwise, show coords as fallback */}
                  <Text style={styles.locationText} numberOfLines={2}>
                    {report.address ? report.address : `Lat: ${report.latitude}, Long: ${report.longitude}`}
                  </Text>

                  {/* Optional: Show small coordinates below the address for accuracy */}
                  {report.address && (
                    <Text style={styles.coordsSubText}>
                       Coords: ({report.latitude.toFixed(4)}, {report.longitude.toFixed(4)})
                    </Text>
                  )}
                </View>

                {/* --- CONDITIONAL ACTION BUTTONS --- */}

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

                {report.status === 'rejected' && (
                  <TouchableOpacity 
                    style={styles.deleteBtn} 
                    onPress={() => deleteReport(report._id)}
                  >
                    <Text style={styles.deleteBtnText}>🗑 Delete Permanently</Text>
                  </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 25 },
  welcomeText: { fontSize: 14, color: '#6B7280' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111827' },
  logoutBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#DC2626', fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statCard: { width: '48%', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 3 },
  statNum: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  statLabel: { color: '#DBEAFE', fontSize: 12, marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  noData: { textAlign: 'center', marginTop: 20, color: '#6B7280' },
  reportCard: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 15, marginBottom: 18, elevation: 3 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  reportType: { fontSize: 16, fontWeight: 'bold' },
  urgentText: { color: '#DC2626', fontWeight: 'bold', marginBottom: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  approvedBadge: { backgroundColor: '#D1FAE5' },
  rejectedBadge: { backgroundColor: '#FECACA' },
  pendingBadge: { backgroundColor: '#FEF3C7' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  image: { width: '100%', height: 180, borderRadius: 10, marginBottom: 10 },
  videoPlaceholder: { width: '100%', height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 10, marginBottom: 10 },
  detailText: { fontSize: 13, color: '#4B5563', marginBottom: 10 },
  
  // LOCATION SECTION STYLES
  locationContainer: { marginBottom: 15, backgroundColor: '#F9FAFB', padding: 10, borderRadius: 10 },
  locationLabel: { fontSize: 12, fontWeight: '700', color: '#1E3A8A', marginBottom: 4 },
  locationText: { fontSize: 13, color: '#1E3A8A', lineHeight: 18 },
  coordsSubText: { fontSize: 11, color: '#94A3B8', marginTop: 5 },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  approveBtn: { backgroundColor: '#16A34A', padding: 12, borderRadius: 10, width: '48%', alignItems: 'center' },
  rejectBtn: { backgroundColor: '#DC2626', padding: 12, borderRadius: 10, width: '48%', alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#FFF1F1', borderWidth: 1, borderColor: '#DC2626', padding: 14, borderRadius: 12, marginTop: 5, alignItems: 'center' },
  deleteBtnText: { color: '#DC2626', fontWeight: 'bold', fontSize: 14 }
});
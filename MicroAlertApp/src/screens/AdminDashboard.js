import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/apiService';
import LinearGradient from 'react-native-linear-gradient'; // Correct import for non-Expo

const SERVER_URL = API.defaults.baseURL.replace('/api', ''); 

export default function AdminDashboard({ navigation }) {

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null); 

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

  // ================= UPDATE STATUS =================
  const updateStatus = async (id, status) => {
    if (status === 'approved') setAnalyzingId(id);

    try {
      const res = await API.put(`/reports/${id}`, { status });
      
      if (status === 'approved') {
         Alert.alert(
             "AI Analysis Complete", 
             `Result: ${res.data.message}\nRisk Score: ${res.data.report?.riskScore || 0}/10\nNotes: ${res.data.report?.aiNotes || 'N/A'}`
         );
      } else {
         Alert.alert("Success", "Report manually rejected.");
      }

      fetchReports(); 
    } catch (error) {
      console.log("Update Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Failed to update report");
    } finally {
      setAnalyzingId(null);
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
              fetchReports();
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
    <LinearGradient colors={['#0F172A', '#1E1B4B']} style={styles.safeArea}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome Admin</Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.glassLogoutBtn} onPress={handleLogout} activeOpacity={0.7}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#F59E0B" />
              <Text style={styles.loadingText}>Syncing Server Data...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* Statistics Cards */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                    <Text style={{fontSize: 20}}>🚨</Text>
                </View>
                <Text style={styles.statNum}>{activeAlerts}</Text>
                <Text style={styles.statLabel}>Active Alerts</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.2)' }]}>
                    <Text style={{fontSize: 20}}>🗂️</Text>
                </View>
                <Text style={styles.statNum}>{totalReports}</Text>
                <Text style={styles.statLabel}>Total Reports</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Incident Database</Text>

            {reports.length === 0 ? (
              <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>🛡️</Text>
                  <Text style={styles.emptyText}>No reports in the system.</Text>
              </View>
            ) : (
              reports.map(report => (
                <View key={report._id} style={styles.reportCard}>

                  {/* Card Header: Type and Status */}
                  <View style={styles.reportHeader}>
                    <View style={styles.typeRow}>
                        <Text style={styles.reportType}>{report.disasterType}</Text>
                    </View>

                    <View style={[
                      styles.statusBadge,
                      report.status === 'approved' && styles.approvedBadge,
                      report.status === 'rejected' && styles.rejectedBadge,
                      report.status === 'pending' && styles.pendingBadge
                    ]}>
                      <Text style={[
                          styles.statusText,
                          report.status === 'approved' && styles.approvedText,
                          report.status === 'rejected' && styles.rejectedText,
                          report.status === 'pending' && styles.pendingText
                      ]}>
                        {report.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Urgent Tag */}
                  {report.priority === "urgent" && (
                    <View style={styles.urgentBadge}>
                        <Text style={styles.urgentText}>🚨 Multiple reports from same location</Text>
                    </View>
                  )}

                  {/* Media Display */}
                  {report.mediaUrl && (
                    <View style={styles.mediaContainer}>
                      {report.mediaType === 'video' ? (
                        <View style={styles.videoPlaceholder}>
                           <Text style={styles.videoText}>🎥 Video uploaded (Preview not supported)</Text>
                        </View>
                      ) : (
                        <Image
                          source={{ uri: `${SERVER_URL}/uploads/${report.mediaUrl}` }}
                          style={styles.image}
                        />
                      )}
                    </View>
                  )}

                  {/* Report Details */}
                  <Text style={styles.detailText}>{report.description}</Text>

                  {/* Location Box */}
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationLabel}>📍 Incident Location:</Text>
                    <Text style={styles.locationText} numberOfLines={2}>
                      {report.address ? report.address : `Lat: ${report.latitude}, Long: ${report.longitude}`}
                    </Text>
                    {report.address && (
                      <Text style={styles.coordsSubText}>
                          Coords: ({report.latitude.toFixed(4)}, {report.longitude.toFixed(4)})
                      </Text>
                    )}
                  </View>

                  {/* AI Analysis Box */}
                  {report.aiNotes ? (
                      <View style={styles.aiBox}>
                          <Text style={styles.aiTitle}>🤖 AI Analysis (Risk: {report.riskScore}/10)</Text>
                          <Text style={styles.aiText}>{report.aiNotes}</Text>
                      </View>
                  ) : null}

                  {/* --- CONDITIONAL ACTION BUTTONS --- */}
                  {report.status === 'pending' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.actionBtnWrapper}
                        onPress={() => updateStatus(report._id, 'approved')}
                        disabled={analyzingId === report._id}
                        activeOpacity={0.8}
                      >
                        <LinearGradient colors={['#10B981', '#059669']} style={styles.approveBtn}>
                            {analyzingId === report._id ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.btnText}>AI Approve</Text>
                            )}
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtnWrapper}
                        onPress={() => updateStatus(report._id, 'rejected')}
                        disabled={analyzingId === report._id}
                        activeOpacity={0.8}
                      >
                        <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.rejectBtn}>
                            <Text style={styles.btnText}>Reject</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Delete Button (Approved & Rejected) */}
                  {(report.status === 'rejected' || report.status === 'approved') && (
                    <TouchableOpacity 
                      style={styles.deleteBtn} 
                      onPress={() => deleteReport(report._id)}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.deleteBtnText}>🗑 Delete Permanently</Text>
                    </TouchableOpacity>
                  )}

                </View>
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  // Header
  header: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingHorizontal: 20,
      marginTop: 20, 
      marginBottom: 25 
  },
  welcomeText: { fontSize: 13, color: '#F59E0B', fontWeight: '700', letterSpacing: 1 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  glassLogoutBtn: { 
      backgroundColor: 'rgba(239, 68, 68, 0.1)', 
      paddingHorizontal: 16, 
      paddingVertical: 10, 
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  logoutText: { color: '#FCA5A5', fontWeight: '700', fontSize: 13 },

  // Loading / Empty States
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#F59E0B', marginTop: 15, fontWeight: '600', fontSize: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 60, padding: 30, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderStyle: 'dashed' },
  emptyEmoji: { fontSize: 40, marginBottom: 15 },
  emptyText: { color: '#94A3B8', fontSize: 15, fontWeight: '500' },

  // Stats Row
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statCard: { 
      width: '48%', 
      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
      padding: 20, 
      borderRadius: 20, 
      alignItems: 'flex-start',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  statIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statNum: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  statLabel: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 15, letterSpacing: 0.5 },

  // Report Card
  reportCard: { 
      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
      padding: 20, 
      borderRadius: 24, 
      marginBottom: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeRow: { flexDirection: 'row', alignItems: 'center' },
  reportType: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  
  // Status Badges
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  approvedBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' },
  rejectedBadge: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' },
  pendingBadge: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  approvedText: { color: '#34D399' },
  rejectedText: { color: '#FCA5A5' },
  pendingText: { color: '#FBBF24' },

  urgentBadge: { backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: 10, borderRadius: 10, marginBottom: 15 },
  urgentText: { color: '#FCA5A5', fontWeight: '700', fontSize: 13 },

  // Media
  mediaContainer: { marginBottom: 15 },
  image: { width: '100%', height: 200, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  videoPlaceholder: { width: '100%', height: 80, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  videoText: { color: '#38BDF8', fontWeight: '600', fontSize: 13 },

  detailText: { fontSize: 15, color: '#CBD5E1', marginBottom: 15, lineHeight: 22, fontWeight: '500' },
  
  // Location
  locationContainer: { backgroundColor: 'rgba(56, 189, 248, 0.05)', padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.1)' },
  locationLabel: { fontSize: 12, fontWeight: '700', color: '#38BDF8', marginBottom: 6 },
  locationText: { fontSize: 14, color: '#E0F2FE', lineHeight: 20, fontWeight: '500' },
  coordsSubText: { fontSize: 12, color: '#94A3B8', marginTop: 8, fontWeight: '500' },

  // AI Box
  aiBox: { backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  aiTitle: { fontWeight: '700', color: '#34D399', marginBottom: 6, fontSize: 13 },
  aiText: { color: '#A7F3D0', fontSize: 14, lineHeight: 20, fontWeight: '500' },

  // Buttons
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  actionBtnWrapper: { width: '48%' },
  approveBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
  
  deleteBtn: { backgroundColor: 'rgba(239, 68, 68, 0.05)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', padding: 16, borderRadius: 14, marginTop: 15, alignItems: 'center' },
  deleteBtnText: { color: '#FCA5A5', fontWeight: '700', fontSize: 14 }
});
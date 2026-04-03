import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import AdminDashboard from '../screens/AdminDashboard';
import ReportScreen from '../screens/ReportScreen';
import AlertScreen from '../screens/AlertScreen';

// ✅ NEW SCREENS
import AgencyLogin from '../screens/AgencyLoginScreen';
import AgencyDashboard from '../screens/AgencyDashboardScreen';
import AllResources from '../screens/AllResourcesScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>

                {/* 🔐 Auth */}
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />

                {/* 👤 User */}
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Report" component={ReportScreen} />
                <Stack.Screen name="Alerts" component={AlertScreen} />
                <Stack.Screen name="Resources" component={ResourcesScreen} />

                {/* 🛠 Admin */}
                <Stack.Screen name="AdminDashboard" component={AdminDashboard} />

                {/* 🚑 Agency (NEW FEATURE) */}
                <Stack.Screen name="AgencyLogin" component={AgencyLogin} />
                <Stack.Screen name="AgencyDashboard" component={AgencyDashboard} />
                <Stack.Screen name="AllResources" component={AllResources} />

            </Stack.Navigator>
        </NavigationContainer>
    );
}
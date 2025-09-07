import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Screens
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import StudentTabNavigator from './navigation/StudentTabNavigator';
import LoadingScreen from './screens/LoadingScreen';
import EventDetailsScreen from './screens/student/EventDetailsScreen';

// Define the stack navigator types
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  StudentTabs: undefined;
  EventDetails: { eventId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Navigation component that handles auth state
const Navigation = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Authenticated routes
          <>
            <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />
            <Stack.Screen 
              name="EventDetails" 
              component={EventDetailsScreen} 
              options={{
                headerShown: false,
                presentation: 'modal'
              }}
            />
          </>
        ) : (
          // Auth routes
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main App component
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navigation />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
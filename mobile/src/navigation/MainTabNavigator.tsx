import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/main/HomeScreen';
import DiscoverScreen from '../screens/main/DiscoverScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CreateWorkoutScreen from '../screens/workout/CreateWorkoutScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 8,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Maps" 
        component={DiscoverScreen}
        options={{
          tabBarLabel: 'Maps',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📍</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Record" 
        component={CreateWorkoutScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => (
            <View style={styles.recordFab} accessibilityLabel="Create workout">
              <Text style={styles.recordIcon}>●</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Groups" 
        component={DiscoverScreen}
        options={{
          tabBarLabel: 'Groups',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="You" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'You',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📊</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  recordFab: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    backgroundColor: '#FF6B35',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  recordIcon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

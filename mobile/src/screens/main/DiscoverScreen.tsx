import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function DiscoverScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Find new workouts and people</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.placeholder}>Discover workouts</Text>
        <Text style={styles.placeholderSubtext}>
          Browse public workouts from the community
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  placeholder: {
    fontSize: 18,
    color: '#999',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
});

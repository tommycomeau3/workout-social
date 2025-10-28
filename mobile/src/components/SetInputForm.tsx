import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface Set {
  set_number: number;
  reps: number;
  weight: number;
  rest_time: number;
}

interface SetInputFormProps {
  sets: Set[];
  onUpdateSet: (setIndex: number, field: keyof Set, value: number) => void;
  onRemoveSet: (setIndex: number) => void;
  onAddSet: () => void;
}

export default function SetInputForm({ sets, onUpdateSet, onRemoveSet, onAddSet }: SetInputFormProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Set Details</Text>
      
      {sets.map((set, index) => (
        <View key={index} style={styles.setContainer}>
          <View style={styles.setHeader}>
            <Text style={styles.setNumber}>Set {set.set_number}</Text>
            {sets.length > 1 && (
              <TouchableOpacity
                style={styles.removeSetButton}
                onPress={() => onRemoveSet(index)}
              >
                <Text style={styles.removeSetText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reps</Text>
              <TextInput
                style={styles.input}
                value={set.reps.toString()}
                onChangeText={(text) => onUpdateSet(index, 'reps', parseInt(text) || 0)}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                value={set.weight.toString()}
                onChangeText={(text) => onUpdateSet(index, 'weight', parseFloat(text) || 0)}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rest (min)</Text>
              <TextInput
                style={styles.input}
                value={set.rest_time.toString()}
                onChangeText={(text) => onUpdateSet(index, 'rest_time', parseFloat(text) || 0)}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      ))}
      
      <TouchableOpacity style={styles.addSetButton} onPress={onAddSet}>
        <Text style={styles.addSetButtonText}>+ Add Set</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  setContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  removeSetButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeSetText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  addSetButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addSetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

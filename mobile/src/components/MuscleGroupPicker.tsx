import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface MuscleGroupPickerProps {
  selectedMuscleGroup: string;
  onSelectMuscleGroup: (muscleGroup: string) => void;
}

const MUSCLE_GROUPS = [
  { id: 'chest', name: 'Chest', emoji: '💪' },
  { id: 'back', name: 'Back', emoji: '🦾' },
  { id: 'shoulders', name: 'Shoulders', emoji: '🤸' },
  { id: 'biceps', name: 'Biceps', emoji: '💪' },
  { id: 'triceps', name: 'Triceps', emoji: '💪' },
  { id: 'legs', name: 'Legs', emoji: '🦵' },
  { id: 'glutes', name: 'Glutes', emoji: '🍑' },
  { id: 'core', name: 'Core', emoji: '🎯' },
  { id: 'cardio', name: 'Cardio', emoji: '🏃' },
  { id: 'full_body', name: 'Full Body', emoji: '🏋️' },
];

export default function MuscleGroupPicker({ selectedMuscleGroup, onSelectMuscleGroup }: MuscleGroupPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Muscle Group</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {MUSCLE_GROUPS.map((muscleGroup) => (
          <TouchableOpacity
            key={muscleGroup.id}
            style={[
              styles.muscleGroupButton,
              selectedMuscleGroup === muscleGroup.id && styles.selectedMuscleGroup
            ]}
            onPress={() => onSelectMuscleGroup(muscleGroup.id)}
          >
            <Text style={styles.muscleGroupEmoji}>{muscleGroup.emoji}</Text>
            <Text style={[
              styles.muscleGroupText,
              selectedMuscleGroup === muscleGroup.id && styles.selectedMuscleGroupText
            ]}>
              {muscleGroup.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  scrollView: {
    marginHorizontal: -20,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  muscleGroupButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  selectedMuscleGroup: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  muscleGroupEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  muscleGroupText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  selectedMuscleGroupText: {
    color: 'white',
  },
});

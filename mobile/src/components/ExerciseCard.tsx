import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Exercise {
  id: number;
  name: string;
  description: string;
  muscle_group: string;
  equipment_type: string;
}

interface Set {
  set_number: number;
  reps: number;
  weight: number;
  rest_time: number;
}

interface ExerciseCardProps {
  exercise: Exercise;
  sets: Set[];
  onRemove: () => void;
}

export default function ExerciseCard({ exercise, sets, onRemove }: ExerciseCardProps) {
  const getEquipmentEmoji = (equipmentType: string) => {
    switch (equipmentType.toLowerCase()) {
      case 'barbell':
        return '🏋️';
      case 'dumbbell':
        return '🏋️‍♂️';
      case 'bodyweight':
        return '🤸';
      case 'machine':
        return '🏋️‍♀️';
      case 'cable':
        return '🔗';
      case 'kettlebell':
        return '⚡';
      default:
        return '💪';
    }
  };

  const getMuscleGroupEmoji = (muscleGroup: string) => {
    switch (muscleGroup.toLowerCase()) {
      case 'chest':
        return '💪';
      case 'back':
        return '🦾';
      case 'shoulders':
        return '🤸';
      case 'biceps':
        return '💪';
      case 'triceps':
        return '💪';
      case 'legs':
        return '🦵';
      case 'glutes':
        return '🍑';
      case 'core':
        return '🎯';
      case 'cardio':
        return '🏃';
      case 'full_body':
        return '🏋️';
      default:
        return '💪';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.equipmentEmoji}>
            {getEquipmentEmoji(exercise.equipment_type)}
          </Text>
          <View style={styles.exerciseDetails}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <View style={styles.exerciseMeta}>
              <Text style={styles.muscleGroup}>
                {getMuscleGroupEmoji(exercise.muscle_group)} {exercise.muscle_group}
              </Text>
              <Text style={styles.equipmentType}>
                {exercise.equipment_type}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.setsContainer}>
        <Text style={styles.setsTitle}>Sets ({sets.length})</Text>
        {sets.map((set, index) => (
          <View key={index} style={styles.setRow}>
            <Text style={styles.setNumber}>Set {set.set_number}</Text>
            <View style={styles.setDetails}>
              <Text style={styles.setDetail}>
                {set.reps} reps
              </Text>
              <Text style={styles.setDetail}>
                {set.weight} lbs
              </Text>
              <Text style={styles.setDetail}>
                {set.rest_time} min rest
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  equipmentEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  muscleGroup: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
    textTransform: 'capitalize',
  },
  equipmentType: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  setsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
  },
  setsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    minWidth: 50,
  },
  setDetails: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  setDetail: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    minWidth: 60,
  },
});

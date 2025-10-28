import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { apiService } from '../services/api';

interface Exercise {
  id: number;
  name: string;
  description: string;
  muscle_group: string;
  equipment_type: string;
}

interface ExercisePickerProps {
  muscleGroup: string;
  selectedExercise: Exercise | null;
  onSelectExercise: (exercise: Exercise) => void;
}

export default function ExercisePicker({ muscleGroup, selectedExercise, onSelectExercise }: ExercisePickerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (muscleGroup) {
      loadExercises();
    }
  }, [muscleGroup]);

  const loadExercises = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getExercisesByMuscleGroup(muscleGroup);
      setExercises(response.exercises || []);
    } catch (err) {
      console.error('Error loading exercises:', err);
      setError('Failed to load exercises');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Select Exercise</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Select Exercise</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadExercises}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Exercise</Text>
      <ScrollView 
        style={styles.exerciseList}
        showsVerticalScrollIndicator={false}
      >
        {exercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            style={[
              styles.exerciseButton,
              selectedExercise?.id === exercise.id && styles.selectedExercise
            ]}
            onPress={() => onSelectExercise(exercise)}
          >
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseEmoji}>
                {getEquipmentEmoji(exercise.equipment_type)}
              </Text>
              <View style={styles.exerciseInfo}>
                <Text style={[
                  styles.exerciseName,
                  selectedExercise?.id === exercise.id && styles.selectedExerciseText
                ]}>
                  {exercise.name}
                </Text>
                <Text style={styles.exerciseEquipment}>
                  {exercise.equipment_type}
                </Text>
              </View>
            </View>
            {exercise.description && (
              <Text style={[
                styles.exerciseDescription,
                selectedExercise?.id === exercise.id && styles.selectedExerciseDescription
              ]}>
                {exercise.description}
              </Text>
            )}
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseList: {
    maxHeight: 200,
  },
  exerciseButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedExercise: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  selectedExerciseText: {
    color: '#007AFF',
  },
  exerciseEquipment: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 18,
  },
  selectedExerciseDescription: {
    color: '#007AFF',
  },
});

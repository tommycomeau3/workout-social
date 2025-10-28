import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MuscleGroupPicker from '../../components/MuscleGroupPicker';
import ExercisePicker from '../../components/ExercisePicker';
import SetInputForm from '../../components/SetInputForm';
import ExerciseCard from '../../components/ExerciseCard';
import { apiService } from '../../services/api';

interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  sets: Set[];
}

interface Set {
  set_number: number;
  reps: number;
  weight: number;
  rest_time: number;
}

interface WorkoutExercise {
  exercise: Exercise;
  sets: Set[];
}

export default function CreateWorkoutScreen() {
  const navigation = useNavigation();
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  
  // Exercise selection state
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentSets, setCurrentSets] = useState<Set[]>([]);
  
  // Added exercises
  const [addedExercises, setAddedExercises] = useState<WorkoutExercise[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  // Initialize with one empty set
  useEffect(() => {
    if (currentSets.length === 0) {
      setCurrentSets([{
        set_number: 1,
        reps: 0,
        weight: 0,
        rest_time: 0
      }]);
    }
  }, []);

  const handleAddSet = () => {
    const newSet: Set = {
      set_number: currentSets.length + 1,
      reps: 0,
      weight: 0,
      rest_time: 0
    };
    setCurrentSets([...currentSets, newSet]);
  };

  const handleUpdateSet = (setIndex: number, field: keyof Set, value: number) => {
    const updatedSets = currentSets.map((set, index) => 
      index === setIndex ? { ...set, [field]: value } : set
    );
    setCurrentSets(updatedSets);
  };

  const handleRemoveSet = (setIndex: number) => {
    if (currentSets.length > 1) {
      const updatedSets = currentSets.filter((_, index) => index !== setIndex);
      // Renumber sets
      const renumberedSets = updatedSets.map((set, index) => ({
        ...set,
        set_number: index + 1
      }));
      setCurrentSets(renumberedSets);
    }
  };

  const handleAddExercise = () => {
    if (!selectedExercise) {
      Alert.alert('Error', 'Please select an exercise');
      return;
    }

    if (currentSets.some(set => set.reps === 0 || set.weight === 0)) {
      Alert.alert('Error', 'Please fill in all set details');
      return;
    }

    const workoutExercise: WorkoutExercise = {
      exercise: selectedExercise,
      sets: currentSets
    };

    setAddedExercises([...addedExercises, workoutExercise]);
    
    // Reset for next exercise
    setSelectedMuscleGroup('');
    setSelectedExercise(null);
    setCurrentSets([{
      set_number: 1,
      reps: 0,
      weight: 0,
      rest_time: 0
    }]);
    setShowExercisePicker(false);
  };

  const handleRemoveExercise = (index: number) => {
    const updatedExercises = addedExercises.filter((_, i) => i !== index);
    setAddedExercises(updatedExercises);
  };

  const handleSaveWorkout = async () => {
    if (!workoutTitle.trim()) {
      Alert.alert('Error', 'Please enter a workout title');
      return;
    }

    if (addedExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    setIsLoading(true);
    try {
      // Create workout
      const workoutData = {
        title: workoutTitle,
        date: workoutDate,
        duration: workoutDuration ? parseInt(workoutDuration) : null,
        notes: workoutNotes,
        is_public: true
      };

      const workoutResponse = await apiService.createWorkout(workoutData);
      const workoutId = workoutResponse.workout.id;

      // Add exercises and sets
      for (const workoutExercise of addedExercises) {
        const exerciseResponse = await apiService.addExerciseToWorkout(workoutId, {
          exercise_id: workoutExercise.exercise.id,
          order_in_workout: addedExercises.indexOf(workoutExercise) + 1
        });

        const workoutExerciseId = exerciseResponse.workout_exercise.id;

        // Add sets
        for (const set of workoutExercise.sets) {
          await apiService.addSetsToExercise(workoutExerciseId, {
            set_number: set.set_number,
            reps: set.reps,
            weight: set.weight,
            rest_time: set.rest_time
          });
        }
      }

      Alert.alert('Success', 'Workout created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating workout:', error);
      Alert.alert('Error', 'Failed to create workout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Workout</Text>
        <TouchableOpacity 
          onPress={handleSaveWorkout}
          disabled={isLoading}
        >
          <Text style={[styles.headerButton, styles.saveButton, isLoading && styles.disabledButton]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Workout Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={workoutTitle}
              onChangeText={setWorkoutTitle}
              placeholder="Enter workout title"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                value={workoutDate}
                onChangeText={setWorkoutDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Duration (min)</Text>
              <TextInput
                style={styles.input}
                value={workoutDuration}
                onChangeText={setWorkoutDuration}
                placeholder="60"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={workoutNotes}
              onChangeText={setWorkoutNotes}
              placeholder="Add notes about your workout..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Exercise Selection Flow */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Exercise</Text>
          
          <MuscleGroupPicker
            selectedMuscleGroup={selectedMuscleGroup}
            onSelectMuscleGroup={setSelectedMuscleGroup}
          />

          {selectedMuscleGroup && (
            <ExercisePicker
              muscleGroup={selectedMuscleGroup}
              selectedExercise={selectedExercise}
              onSelectExercise={setSelectedExercise}
            />
          )}

          {selectedExercise && (
            <SetInputForm
              sets={currentSets}
              onUpdateSet={handleUpdateSet}
              onRemoveSet={handleRemoveSet}
              onAddSet={handleAddSet}
            />
          )}

          {selectedExercise && (
            <TouchableOpacity 
              style={styles.addExerciseButton}
              onPress={handleAddExercise}
            >
              <Text style={styles.addExerciseButtonText}>+ Add Exercise</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Exercise List */}
        {addedExercises.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Added Exercises ({addedExercises.length})</Text>
            {addedExercises.map((workoutExercise, index) => (
              <ExerciseCard
                key={index}
                exercise={workoutExercise.exercise}
                sets={workoutExercise.sets}
                onRemove={() => handleRemoveExercise(index)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  saveButton: {
    fontWeight: '600',
  },
  disabledButton: {
    color: '#ccc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addExerciseButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  addExerciseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

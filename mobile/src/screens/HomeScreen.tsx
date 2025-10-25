import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Workout {
  id: number;
  title: string;
  date: string;
  duration: number;
  notes: string;
  user_id: number;
  username: string;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
}

export default function HomeScreen({ navigation }: any) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    if (!token) return;

    try {
      const response = await api.getFeed(token);
      if (response.data) {
        setWorkouts(response.data.feed || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const handleLike = async (workoutId: number) => {
    if (!token) return;

    try {
      const workout = workouts.find(w => w.id === workoutId);
      if (!workout) return;

      if (workout.is_liked) {
        await api.unlikeWorkout(token, workoutId.toString());
        setWorkouts(prev => prev.map(w => 
          w.id === workoutId 
            ? { ...w, is_liked: false, like_count: w.like_count - 1 }
            : w
        ));
      } else {
        await api.likeWorkout(token, workoutId.toString());
        setWorkouts(prev => prev.map(w => 
          w.id === workoutId 
            ? { ...w, is_liked: true, like_count: w.like_count + 1 }
            : w
        ));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const renderWorkout = ({ item }: { item: Workout }) => (
    <TouchableOpacity style={styles.workoutCard}>
      <View style={styles.workoutHeader}>
        <Text style={styles.username}>@{item.username}</Text>
        <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      
      <Text style={styles.workoutTitle}>{item.title}</Text>
      
      {item.notes && (
        <Text style={styles.workoutNotes}>{item.notes}</Text>
      )}
      
      <View style={styles.workoutStats}>
        <Text style={styles.statText}>
          {item.duration ? `${item.duration} min` : 'No duration'}
        </Text>
      </View>
      
      <View style={styles.workoutActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Text style={[styles.actionText, item.is_liked && styles.likedText]}>
            ❤️ {item.like_count}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>💬 {item.comment_count}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Feed</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateWorkout')}
        >
          <Text style={styles.createButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={workouts}
        renderItem={renderWorkout}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No workouts in your feed yet</Text>
            <Text style={styles.emptySubtext}>Follow some users to see their workouts!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  workoutCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  workoutNotes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  workoutStats: {
    marginBottom: 12,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  workoutActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },
  likedText: {
    color: '#FF3B30',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { eventAPI, registrationAPI } from '../../api/apiClient';
import { Event, EventWithStats } from '../../types';

// Define navigation type
type EventBrowserScreenNavigationProp = NativeStackNavigationProp<{
  EventDetails: { eventId: string };
}>;

const EventBrowserScreen = () => {
  const navigation = useNavigation<EventBrowserScreenNavigationProp>();
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // Event types and their colors
  const eventTypes = [
    { type: '', label: 'All' },
    { type: 'Workshop', label: 'Workshop' },
    { type: 'Fest', label: 'Fest' },
    { type: 'Seminar', label: 'Seminar' },
    { type: 'Conference', label: 'Conference' },
    { type: 'Sports', label: 'Sports' },
    { type: 'Cultural', label: 'Cultural' },
  ];

  const eventTypeColors: Record<string, string> = {
    Workshop: '#3B82F6', // Blue
    Fest: '#EC4899', // Pink
    Seminar: '#10B981', // Green
    Conference: '#8B5CF6', // Purple
    Sports: '#F59E0B', // Amber
    Cultural: '#EF4444', // Red
  };

  // Helper functions
  const isEventPast = (eventDate: string) => {
    return new Date(eventDate) < new Date();
  };

  const isRegistered = (eventId: string) => {
    return registeredEventIds.includes(eventId);
  };

  // Fetch events and registrations
  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsData, registrationsData] = await Promise.all([
        eventAPI.getEvents(),
        registrationAPI.getMyRegistrations(),
      ]);

      setEvents(eventsData);
      setRegisteredEventIds(
        registrationsData.map((registration: any) => registration.event_id)
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load events. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Register for an event
  const handleRegister = async (eventId: string) => {
    try {
      await registrationAPI.registerForEvent(eventId);
      setRegisteredEventIds([...registeredEventIds, eventId]);
      Alert.alert('Success', 'You have successfully registered for this event!');
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error.response?.data?.detail || 'Could not register for this event. Please try again.'
      );
    }
  };

  // Filter events based on search term and type filter
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.collegeName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === '' || event.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Render event card
  const renderEventCard = ({ item }: { item: EventWithStats }) => {
    const isPast = isEventPast(item.date);
    const registered = isRegistered(item.id);
    const eventDate = new Date(item.date);

    return (
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
      >
        <View style={styles.eventHeader}>
          <View 
            style={[styles.eventTypeTag, { backgroundColor: eventTypeColors[item.type] || '#6B7280' }]}
          >
            <Text style={styles.eventTypeText}>{item.type}</Text>
          </View>
          <Text style={styles.eventDate}>
            {format(eventDate, 'MMM d, yyyy')} at {format(eventDate, 'h:mm a')}
          </Text>
        </View>

        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventLocation}>
          <Feather name="map-pin" size={14} color="#6B7280" /> {item.location}
        </Text>
        <Text style={styles.eventCollege}>
          <Feather name="home" size={14} color="#6B7280" /> {item.collegeName}
        </Text>

        <Text style={styles.eventDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.eventStats}>
          <View style={styles.statItem}>
            <Feather name="users" size={14} color="#6B7280" />
            <Text style={styles.statText}>{item.registrationCount} registered</Text>
          </View>
          <View style={styles.statItem}>
            <Feather name="check-circle" size={14} color="#6B7280" />
            <Text style={styles.statText}>{item.attendanceCount} attended</Text>
          </View>
          {item.averageRating && (
            <View style={styles.statItem}>
              <Feather name="star" size={14} color="#F59E0B" />
              <Text style={styles.statText}>{item.averageRating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {!isPast && !registered && (
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => handleRegister(item.id)}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        )}

        {!isPast && registered && (
          <View style={styles.registeredButton}>
            <Feather name="check" size={16} color="#fff" />
            <Text style={styles.registeredButtonText}>Registered</Text>
          </View>
        )}

        {isPast && (
          <View style={styles.pastEventButton}>
            <Text style={styles.pastEventButtonText}>Event Ended</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render type filter buttons
  const renderTypeFilters = () => (
    <FlatList
      horizontal
      data={eventTypes}
      keyExtractor={(item) => item.type}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.filterButton,
            typeFilter === item.type && styles.filterButtonActive,
          ]}
          onPress={() => setTypeFilter(item.type)}
        >
          <Text
            style={[
              styles.filterButtonText,
              typeFilter === item.type && styles.filterButtonTextActive,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      )}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersContainer}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {renderTypeFilters()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEventCard}
          contentContainerStyle={styles.eventsList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="calendar" size={50} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No events found</Text>
              <Text style={styles.emptyText}>
                {searchTerm || typeFilter
                  ? 'Try changing your search or filters'
                  : 'Check back later for upcoming events'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#6366F1',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#4B5563',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  eventsList: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTypeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  eventTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  eventCollege: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  eventStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  registerButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registeredButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registeredButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  pastEventButton: {
    backgroundColor: '#9CA3AF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pastEventButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default EventBrowserScreen;
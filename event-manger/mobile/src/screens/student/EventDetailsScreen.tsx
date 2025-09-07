import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

// Types
import { EventWithStats, Registration, Attendance, Feedback } from '../../types';

// API
import { eventAPI, registrationAPI, attendanceAPI, feedbackAPI } from '../../api/apiClient';

// Define the navigation params
export type EventDetailsParams = {
  EventDetails: { eventId: string };
};

type EventDetailsScreenRouteProp = RouteProp<EventDetailsParams, 'EventDetails'>;
type EventDetailsScreenNavigationProp = NativeStackNavigationProp<EventDetailsParams, 'EventDetails'>;

type Props = {
  route: EventDetailsScreenRouteProp;
  navigation: EventDetailsScreenNavigationProp;
};

const EventDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState<EventWithStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Feedback modal state
  const [feedbackModalVisible, setFeedbackModalVisible] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  
  // QR Code modal state
  const [qrModalVisible, setQrModalVisible] = useState<boolean>(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch event details
      const eventData = await eventAPI.getEvent(eventId);
      setEvent(eventData);
      
      // Fetch user's registration for this event
      const registrations = await registrationAPI.getMyRegistrations();
      const eventRegistration = registrations.find((reg: Registration) => reg.eventId === eventId) || null;
      setRegistration(eventRegistration);
      
      // If registered, fetch attendance and feedback
      if (eventRegistration) {
        try {
          // Fetch attendance data
          const attendances = await attendanceAPI.getMyAttendances();
          const eventAttendance = attendances.find((att: Attendance) => 
            att.registrationId === eventRegistration.id
          ) || null;
          setAttendance(eventAttendance);
          
          // Fetch feedback data
          const feedbacks = await feedbackAPI.getMyFeedbacks();
          const eventFeedback = feedbacks.find((fb: Feedback) => {
            return fb.registrationId === eventRegistration.id;
          }) || null;
          setFeedback(eventFeedback);
        } catch (attendanceErr) {
          console.error('Error fetching attendance or feedback:', attendanceErr);
          // Don't set the main error state as we still have the event data
        }
      }
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      await registrationAPI.registerForEvent(eventId);
      Alert.alert('Success', 'You have successfully registered for this event!');
      fetchEventDetails(); // Refresh data
    } catch (err) {
      console.error('Registration error:', err);
      Alert.alert('Error', 'Failed to register for this event. Please try again.');
    }
  };
  
  const handleSubmitFeedback = async () => {
    try {
      // Check if we have a registration ID from the current registration
      if (!registration) {
        Alert.alert('Error', 'Registration information not found.');
        return;
      }
      
      // Use the submitFeedback method with the correct parameters
      // The API expects eventId, rating, and comment
      await feedbackAPI.submitFeedback(eventId, rating, comment);
      
      setFeedbackModalVisible(false);
      setComment('');
      setRating(5);
      Alert.alert('Success', 'Thank you for your feedback!');
      fetchEventDetails(); // Refresh data to update feedback status
    } catch (err) {
      console.error('Feedback submission error:', err);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  };

  const isEventPast = (date: string) => {
    return new Date(date) < new Date();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={50} color="#EF4444" />
        <Text style={styles.errorText}>{error || 'Event not found'}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPastEvent = isEventPast(event.date);
  const hasAttended = !!attendance;
  const hasFeedback = !!feedback;

  // Render feedback modal
  // Generate QR code data with event information
  const generateQRData = () => {
    return JSON.stringify({
      type: 'attendance',
      eventId: eventId,
      timestamp: Date.now()
    });
  };
  
  const renderFeedbackModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={feedbackModalVisible}
      onRequestClose={() => setFeedbackModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Event Feedback</Text>
            <TouchableOpacity onPress={() => setFeedbackModalVisible(false)}>
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalLabel}>Rating</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity 
                key={star} 
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Feather 
                  name="star"
                  size={32} 
                  color={star <= rating ? "#F59E0B" : "#D1D5DB"} 
                />
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.modalLabel}>Comments</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Share your thoughts about this event"
            multiline
            numberOfLines={4}
          />
          
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmitFeedback}
          >
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Render QR code modal
  const renderQRModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={qrModalVisible}
      onRequestClose={() => setQrModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Event QR Code</Text>
            <TouchableOpacity onPress={() => setQrModalVisible(false)}>
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.qrContainer}>
            <QRCode
              value={generateQRData()}
              size={200}
              color="#000000"
              backgroundColor="#ffffff"
            />
          </View>
          
          <Text style={styles.qrInstructions}>
            Show this QR code to the event organizer to mark your attendance
          </Text>
        </View>
      </View>
    </Modal>
  );
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#6366F1" />
        </TouchableOpacity>
        <View style={styles.eventTypeTag}>
          <Text style={styles.eventTypeText}>{event.type}</Text>
        </View>
      </View>

      <Text style={styles.title}>{event.title}</Text>
      
      <View style={styles.infoRow}>
        <Feather name="map-pin" size={18} color="#6366F1" />
        <Text style={styles.infoText}>{event.location}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Feather name="calendar" size={18} color="#6366F1" />
        <Text style={styles.infoText}>
          {new Date(event.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <Feather name="home" size={18} color="#6366F1" />
        <Text style={styles.infoText}>{event.collegeName}</Text>
      </View>

      {event.maxAttendees && (
        <View style={styles.infoRow}>
          <Feather name="users" size={18} color="#6366F1" />
          <Text style={styles.infoText}>
            {event.registrationCount}/{event.maxAttendees} registered
          </Text>
        </View>
      )}

      {event.averageRating && (
        <View style={styles.infoRow}>
          <Feather name="star" size={18} color="#6366F1" />
          <Text style={styles.infoText}>
            {event.averageRating.toFixed(1)} rating
          </Text>
        </View>
      )}

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.description}>{event.description}</Text>
      </View>

      <View style={styles.statusContainer}>
        {isPastEvent ? (
          <>
            {registration ? (
              <>
                {hasAttended ? (
                  <View style={styles.attendedTag}>
                    <Feather name="check-circle" size={18} color="#fff" />
                    <Text style={styles.statusTagText}>Attended</Text>
                  </View>
                ) : (
                  <View style={styles.missedTag}>
                    <Feather name="x-circle" size={18} color="#fff" />
                    <Text style={styles.statusTagText}>Missed</Text>
                  </View>
                )}

                {hasFeedback ? (
                  <View style={styles.feedbackGivenTag}>
                    <Feather name="message-circle" size={18} color="#fff" />
                    <Text style={styles.statusTagText}>Feedback Given</Text>
                  </View>
                ) : hasAttended && (
                  <TouchableOpacity 
                    style={styles.feedbackButton}
                    onPress={() => setFeedbackModalVisible(true)}
                  >
                    <Text style={styles.feedbackButtonText}>Give Feedback</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text style={styles.notRegisteredText}>You were not registered for this event</Text>
            )}
          </>
        ) : (
          <>
            {registration ? (
              <View style={styles.registeredTag}>
                <Feather name="check" size={18} color="#fff" />
                <Text style={styles.statusTagText}>Registered</Text>
              </View>
            ) : (
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.registerButton}
                  onPress={handleRegister}
                >
                  <Text style={styles.registerButtonText}>Register Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        
        {/* QR Code Button - Show only for registered upcoming events */}
        {!isPastEvent && registration && (
          <TouchableOpacity 
            style={styles.qrButton}
            onPress={() => setQrModalVisible(true)}
          >
            <Feather name="check-square" size={18} color="#fff" />
            <Text style={styles.qrButtonText}>Show QR Code</Text>
          </TouchableOpacity>
        )}
      </View>
      {renderFeedbackModal()}
      {renderQRModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6366F1',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  backButtonText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  eventTypeTag: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  eventTypeText: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 8,
  },
  descriptionContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
  },
  statusContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  registeredTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  attendedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  missedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  feedbackGivenTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusTagText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  registerButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  feedbackButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  feedbackButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  notRegisteredText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  // Feedback modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starButton: {
    padding: 5,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  qrButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  qrButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 20,
  },
  qrInstructions: {
    textAlign: 'center',
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
  },
});

export default EventDetailsScreen;
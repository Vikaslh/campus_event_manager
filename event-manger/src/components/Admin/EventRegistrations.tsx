import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, UserCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { EventWithStats } from '../../types';
import { registrationAPI, attendanceAPI } from '../../lib/apiClient';

interface EventRegistrationsProps {
  event: EventWithStats;
  onBack: () => void;
}

interface RegistrationWithAttendance {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  timestamp: string;
  hasAttended: boolean;
  attendanceId?: string;
  checkInTime?: string;
}

export const EventRegistrations: React.FC<EventRegistrationsProps> = ({
  event,
  onBack,
}) => {
  const [registrations, setRegistrations] = useState<RegistrationWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('all'); // 'all', 'attended', 'not-attended'

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        // Fetch all registrations for this event
        const allRegistrations = await registrationAPI.getAllRegistrations();
        const eventRegistrations = allRegistrations.filter(
          (reg: { event_id: number }) => reg.event_id.toString() === event.id
        );

        // Fetch all attendance records
        const allAttendance = await attendanceAPI.getAllAttendance();

        // Map registrations with attendance data
        const registrationsWithAttendance = eventRegistrations.map((reg: { 
          id: number;
          student_id: number;
          student_name: string;
          student_email: string;
          event_id: number;
          created_at: string;
        }) => {
          const attendance = allAttendance.find(
            (att: { registration_id: number; id: number; check_in_time: string }) => 
              att.registration_id.toString() === reg.id.toString()
          );

          return {
            id: reg.id.toString(),
            studentId: reg.student_id.toString(),
            studentName: reg.student_name || 'Unknown Student',
            studentEmail: reg.student_email || 'No email provided',
            timestamp: reg.created_at,
            hasAttended: !!attendance,
            attendanceId: attendance ? attendance.id.toString() : undefined,
            checkInTime: attendance ? attendance.check_in_time : undefined,
          };
        });

        setRegistrations(registrationsWithAttendance);
      } catch (error) {
        console.error('Failed to fetch registrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [event.id]);

  const handleMarkAttendance = async (registrationId: string) => {
    try {
      const newAttendance = await attendanceAPI.createAttendance(
        parseInt(registrationId),
        parseInt(event.id)
      );

      // Update the local state
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId
            ? {
                ...reg,
                hasAttended: true,
                attendanceId: newAttendance.id.toString(),
                checkInTime: newAttendance.check_in_time,
              }
            : reg
        )
      );
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      alert('Failed to mark attendance. Please try again.');
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAttendance =
      attendanceFilter === 'all' ||
      (attendanceFilter === 'attended' && reg.hasAttended) ||
      (attendanceFilter === 'not-attended' && !reg.hasAttended);

    return matchesSearch && matchesAttendance;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Registrations: {event.title}</h1>
      </div>

      <Card className="space-y-4 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="primary">{event.type}</Badge>
            <span className="text-sm text-gray-500">
              {event.registrationCount} Registrations | {event.attendanceCount} Attended
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="border rounded px-3 py-1 text-sm"
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
            >
              <option value="all">All Students</option>
              <option value="attended">Attended</option>
              <option value="not-attended">Not Attended</option>
            </select>
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registrations...</p>
        </Card>
      ) : filteredRegistrations.length > 0 ? (
        <div className="space-y-4">
          {filteredRegistrations.map((registration) => (
            <Card key={registration.id} className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-900">{registration.studentName}</h3>
                  <p className="text-sm text-gray-500">{registration.studentEmail}</p>
                  <p className="text-xs text-gray-400">
                    Registered on: {new Date(registration.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {registration.hasAttended ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="success">
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Attended
                        </span>
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {registration.checkInTime
                          ? new Date(registration.checkInTime).toLocaleString()
                          : ''}
                      </span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleMarkAttendance(registration.id)}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Mark Attendance
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <X className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations found</h3>
          <p className="text-gray-500">
            {searchTerm || attendanceFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'No students have registered for this event yet.'}
          </p>
        </Card>
      )}
    </div>
  );
};
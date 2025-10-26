"use client";
import Loader from "@/components/common/Loader";
import api from "@/api/apiClient";
import { useAuthStore } from "@/store/user.store";
import { format, parseISO } from "date-fns";
import { Plus, Video, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/core/ProtectedRoute";
import Head from "next/head";

// Mock "Start Meeting" function
async function startNewMeeting(router, user) {
  try {
    const mockMeeting = {
      zoomMeetingId: `mock_${Date.now()}`,
      title: "New Instant Meeting",
      participants: [user._id],
    };
    
    // 1. Call backend to create the meeting document
    const response = await api.post('/meetings/start', mockMeeting);
    const newMeeting = response.data.data;
    
    // 2. Redirect to the "live" meeting room
    router.push(`/meeting/live/${newMeeting._id}`);

  } catch (err) {
    console.error("Failed to start meeting:", err);
    alert("Error: Could not start meeting.");
  }
}

function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user's meetings
    const fetchMeetings = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const response = await api.get('/meetings');
        setMeetings(response.data.data);
      } catch (err) {
        console.error("Failed to fetch meetings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeetings();
  }, [user]);

  const handleStartMeeting = () => {
    if (!user) return;
    startNewMeeting(router, user);
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard - MeetMind</title>
      </Head>
      <div>
        <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>
        
        {/* --- Action Buttons --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={handleStartMeeting}
            className="p-6 bg-blue-600 rounded-lg text-left hover:bg-blue-700 transition-all"
          >
            <Plus className="mb-2" />
            <h3 className="text-lg font-semibold">Start Instant Meeting</h3>
            <p className="text-sm text-blue-200">Launch a new meeting and start recording.</p>
          </button>
          {/* Mock buttons */}
          <button className="p-6 bg-gray-700 rounded-lg text-left cursor-not-allowed opacity-50">
            <Video className="mb-2" />
            <h3 className="text-lg font-semibold">Join a Meeting</h3>
            <p className="text-sm text-gray-300">Enter a meeting ID to join.</p>
          </button>
          <button className="p-6 bg-gray-700 rounded-lg text-left cursor-not-allowed opacity-50">
            <Calendar className="mb-2" />
            <h3 className="text-lg font-semibold">Schedule for Later</h3>
            <p className="text-sm text-gray-300">Integrate with your calendar.</p>
          </button>
        </div>
        
        {/* --- Meeting List --- */}
        <h2 className="text-2xl font-bold mb-4">Past Meetings</h2>
        <div className="bg-gray-800 rounded-lg shadow-lg">
          {isLoading ? (
            <Loader text="Fetching meetings..." />
          ) : meetings.length === 0 ? (
            <p className="p-6 text-gray-400">You have no past meetings.</p>
          ) : (
            <ul className="divide-y divide-gray-700">
              {meetings.map((meeting) => (
                <li key={meeting._id} className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
                    <p className="text-sm text-gray-400">
                      {format(parseISO(meeting.startTime), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      meeting.status === 'COMPLETED' ? 'bg-green-800 text-green-200' :
                      meeting.status === 'PROCESSING' ? 'bg-yellow-800 text-yellow-200' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {meeting.status}
                    </span>
                    {meeting.status === 'COMPLETED' && (
                      <Link href={`/meeting/${meeting._id}`} className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        View Summary <ArrowRight size={16} />
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
export default DashboardPage;

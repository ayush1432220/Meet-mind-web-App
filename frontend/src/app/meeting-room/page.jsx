"use client";
import { useMeetingStore } from "@/store/meeting.store";
import { socket } from "@/utils/socket.client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation"; // Use next/router
import { useEffect, useState } from "react";
import api from "@/api/apiClient";
import ProtectedRoute from "@/components/core/ProtectedRoute";
import Head from "next/head";
import ParticipantList from "@/components/meetings/ParticipantList";
import LiveTranscript from "@/components/meetings/LiveTranscript";

// --- This component mocks the Zoom SDK behavior ---
// It emits socket events that the backend socket.handler.js will receive
function MockZoomSDK({ meetingId }) {
  const { setActiveSpeaker, addTranscriptLine } = useMeetingStore();

  useEffect(() => {
    if (!meetingId) return;

    // --- MOCK LIVE TRANSCRIPT & SPEAKER ---
    const mockTranscript = [
      { speaker: '102', name: 'Maria Garcia', text: 'Okay, so the main goal for this sprint is the payment gateway.' },
      { speaker: '101', name: 'Alex Johnson (You)', text: 'Agreed. I can take the lead on the API integration.' },
      { speaker: '103', name: 'David Kim', text: 'I\'ll handle the frontend components for the checkout form.' },
      { speaker: '102', name: 'Maria Garcia', text: 'Great. Alex, what\'s the deadline for the API?' },
      { speaker: '101', name: 'Alex Johnson (You)', text: 'I should have the endpoints ready by Friday EOD.' },
      { speaker: '103', name: 'David Kim', text: 'Perfect. That gives me the weekend to test.' },
      { speaker: '102', name: 'Maria Garcia', text: 'Okay, so action items: Alex to handle API by Friday. David to handle frontend.' },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i >= mockTranscript.length) {
        clearInterval(interval);
        setActiveSpeaker(null);
        return;
      }

      const line = mockTranscript[i];
      const entry = { 
        speakerName: line.name, 
        text: line.text, 
        timestamp: new Date().toISOString() 
      };

      // 1. Update local UI (via Zustand)
      setActiveSpeaker(line.speaker);
      addTranscriptLine(entry);

      // 2. Emit events to backend
      socket.emit('meeting:speaker_change', {
        meetingId,
        zoomUserId: line.speaker,
        userName: line.name,
      });
      socket.emit('meeting:transcript_update', {
        meetingId,
        transcriptEntry: entry,
      });

      i++;
    }, 3000); // New speaker/line every 3 seconds

    return () => clearInterval(interval);
  }, [meetingId, setActiveSpeaker, addTranscriptLine]);

  return null; // This component renders nothing
}

// --- The Main Page Component ---
function LiveMeetingPage() {
  const router = useRouter();
  const { id: meetingId } = router.query; // Get dynamic param
  const [isEnding, setIsEnding] = useState(false);
  const { transcript, resetMeeting } = useMeetingStore();

  useEffect(() => {
    // Reset store on join
    resetMeeting();
    
    // Join socket room
    if (meetingId) {
      socket.emit('meeting:join', meetingId);
    }
    
    return () => {
      // Leave room on unmount
      if (meetingId) {
        socket.emit('meeting:leave', meetingId);
      }
    };
  }, [meetingId, resetMeeting]);

  const handleEndMeeting = async () => {
    if (!meetingId) return;
    setIsEnding(true);
    try {
      // Send the *full transcript* to the backend to be processed
      await api.post(`/meetings/${meetingId}/end`, {
        transcript: transcript,
      });
      
      // Redirect to the summary page
      router.push(`/meeting/${meetingId}`);

    } catch (err) {
      console.error("Failed to end meeting:", err);
      alert("Error: Could not end meeting.");
      setIsEnding(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Live Meeting - MeetMind</title>
      </Head>
      <div className="flex h-[calc(100vh-120px)] w-full text-white">
        <MockZoomSDK meetingId={meetingId} /> {/* This component simulates the meeting */}
        
        {/* Main Content (Mock Video Area) */}
        <main className="flex-1 flex flex-col p-4 bg-gray-800 rounded-lg">
          <div className="flex-1 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-2xl">
              Mock Zoom SDK Area
            </span>
          </div>
          
          <LiveTranscript />
          
          {/* Controls */}
          <div className="flex justify-center items-center h-20 space-x-4">
            <button 
              onClick={handleEndMeeting}
              disabled={isEnding}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-900 flex items-center gap-2"
            >
              {isEnding && <Loader2 className="animate-spin" size={20} />}
              End Meeting for All
            </button>
          </div>
        </main>

        <ParticipantList />
      </div>
    </ProtectedRoute>
  );
}

export default LiveMeetingPage;

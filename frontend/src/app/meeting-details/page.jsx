"use client";
import Loader from "@/components/common/Loader";
import api from "@/api/apiClient";
import { format, parseISO } from "date-fns";
import { CheckCheck, ClipboardList, Clock, Info, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Use next/router
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/core/ProtectedRoute";
import Head from "next/head";

function MeetingDetailsPage() {
  const router = useRouter();
  const { id: meetingId } = router.query;
  const [meeting, setMeeting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!meetingId) return;

    // Fetch initial data
    const fetchMeeting = async () => {
      try {
        // Don't set loading to true on refetch
        if (!meeting) setIsLoading(true);
        
        const response = await api.get(`/meetings/${meetingId}`);
        setMeeting(response.data.data);
        
        // If status is still processing, set up a poll
        if (response.data.data.status === 'PROCESSING') {
          setTimeout(fetchMeeting, 5000); // Poll every 5 seconds
        }
      } catch (err) {
        console.error("Failed to fetch meeting:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeeting();
    
    // In a real app with socket.io broadcasting, you'd listen here:
    // socket.on('meeting:processed', (data) => {
    //   if (data.meetingId === meetingId) fetchMeeting();
    // });
    // return () => socket.off('meeting:processed');

  }, [meetingId, meeting]); // re-run if meeting state changes

  if (isLoading) {
    return <Loader text="Loading meeting details..." />;
  }
  
  if (!meeting) {
    return <p className="text-center text-red-400">Meeting not found.</p>;
  }
  
  // Special view for "PROCESSING" status
  if (meeting.status === 'PROCESSING') {
    return (
      <>
        <Head><title>Processing Meeting...</title></Head>
        <div className="text-center p-12 bg-gray-800 rounded-lg">
            <Loader2 className="h-16 w-16 animate-spin text-blue-400 mx-auto" />
            <h2 className="text-3xl font-bold mt-6 mb-2">Processing Your Meeting</h2>
            <p className="text-lg text-gray-300">
              MeetMind is analyzing your transcript, generating a summary, and extracting tasks.
            </p>
            <p className="text-gray-400 mt-2">This page will automatically refresh when it's ready.</p>
        </div>
      </>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>{meeting.title} - Summary</title>
      </Head>
      <div>
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>
        
        {/* Header */}
        <h1 className="text-4xl font-bold mb-2">{meeting.title}</h1>
        <p className="text-lg text-gray-400 mb-6">
          {format(parseISO(meeting.startTime), "EEEE, MMMM d, yyyy")}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content: Summary & Tasks */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Summary */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Info size={24} /> AI Summary
              </h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {meeting.summary || 'No summary was generated.'}
              </p>
            </div>
            
            {/* Key Decisions */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <CheckCheck size={24} /> Key Decisions
              </h2>
              {meeting.keyDecisions?.length > 0 ? (
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  {meeting.keyDecisions.map((decision, idx) => (
                    <li key={idx}>{decision}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No key decisions were extracted.</p>
              )}
            </div>
            
            {/* Action Items / Tasks */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <ClipboardList size={24} /> Action Items
              </h2>
              {meeting.actionItems?.length > 0 ? (
                <ul className="space-y-3">
                  {meeting.actionItems.map((task) => (
                    <li key={task._id} className="p-4 bg-gray-700 rounded-md flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">{task.title}</p>
                        <span className="text-sm text-gray-300">
                          Assignee: {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                        </span>
                      </div>
                      <span className="text-sm text-yellow-300">
                        {task.deadline !== 'N/A' ? `Due: ${task.deadline}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No action items were assigned.</p>
              )}
            </div>
          </div>

          {/* Sidebar: Meta Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock size={20} /> Details
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li><strong>Status:</strong> <span className="text-green-400">{meeting.status}</span></li>
                <li><strong>Started:</strong> {format(parseISO(meeting.startTime), "h:mm a")}</li>
                <li><strong>Ended:</strong> {format(parseISO(meeting.endTime), "h:mm a")}</li>
              </ul>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users size={20} /> Participants
              </h3>
              <ul className="space-y-2 text-gray-300">
                {meeting.participants.map((p) => (
                  <li key={p._id} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    {p.name} {p._id === meeting.host && '(Host)'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
export default MeetingDetailsPage;

import { useMeetingStore } from '@/store/meeting.store';
import { Mic, Users } from 'lucide-react';

export default function ParticipantList() {
  const { participants, activeSpeakerId } = useMeetingStore();

  return (
    <aside className="w-72 bg-gray-800 p-4 ml-4 rounded-lg overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Users size={20} className="mr-2" /> Participants ({participants.length})
      </h2>
      <div className="space-y-3">
        {participants.map((p) => (
          <div
            key={p.id}
            className={`flex items-center justify-between p-3 rounded-lg 
              ${p.id === activeSpeakerId 
                ? 'bg-blue-600 border-2 border-blue-400 shadow-lg' // Highlight active speaker
                : 'bg-gray-700'
              } transition-all duration-300`}
          >
            <span className="font-medium">{p.name}</span>
            <Mic size={16} className={p.id === activeSpeakerId ? 'text-white' : 'text-gray-400'} />
          </div>
        ))}
      </div>
    </aside>
  );
}

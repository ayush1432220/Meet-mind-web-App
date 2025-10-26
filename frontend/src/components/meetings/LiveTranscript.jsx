import { useMeetingStore } from '@/store/meeting.store';
import { MessageSquare } from 'lucide-react';

export default function LiveTranscript() {
  const { transcript } = useMeetingStore();

  return (
    <div className="h-48 mt-4 bg-gray-900 rounded-lg p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center">
        <MessageSquare size={16} className="mr-2" /> Live Transcript
      </h3>
      <div className="space-y-2">
        {transcript.map((line, idx) => (
          <p key={idx} className="text-sm">
            <strong className="text-blue-300">{line.speakerName}:</strong>{' '}
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}

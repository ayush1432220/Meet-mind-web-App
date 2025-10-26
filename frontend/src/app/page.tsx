import Head from 'next/head';
import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export default function Page() {
  return (
    <>
      <Head>
        <title>MeetMind - AI Meeting Assistant</title>
      </Head>
      <div className="flex flex-col items-center justify-center text-center py-20">
        <BrainCircuit className="text-blue-400" size={80} />
        <h1 className="text-5xl font-bold mt-6">Welcome to MeetMind</h1>
        <p className="text-xl text-gray-300 mt-4">
          Your intelligent assistant for summarizing meetings and tracking tasks.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </>
  );
}

import { Loader2 } from "lucide-react";

export default function Loader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
      <p className="mt-4 text-gray-400">{text}</p>
    </div>
  );
}
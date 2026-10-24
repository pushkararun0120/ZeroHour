import { CitizenApp } from "@/components/citizen/citizen-app";
import { SessionProvider } from "@/components/session-provider";

export default function Home() {
  return (
    <SessionProvider role="citizen">
      <CitizenApp />
    </SessionProvider>
  );
}
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FaArrowLeft } from "react-icons/fa6";
import { Cpu } from "lucide-react";

export default function Sensors() {
  useEffect(() => {
    document.title = "Sensors | FlexPark";
  }, []);

  const router = useRouter();

  return (
    <div className="fp-surface">
      <main className="fp-content flex flex-col w-full items-center px-3 py-4 sm:px-6">
        <div className="w-full max-w-[1600px] flex flex-col gap-3 min-h-[calc(100vh-7rem)]">
          <div className="fp-panel h-fit w-full flex flex-wrap gap-2 p-3">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              <FaArrowLeft className="mr-1" />
              Back
            </Button>
          </div>

          <div className="fp-panel grow w-full flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Cpu className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Sensors
              </h1>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Sensor management lives on your main dashboard. Create and
                assign sensors to parking slots from there.
              </p>
            </div>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

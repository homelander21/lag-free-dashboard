import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import type { useTelemetry } from "../../hooks/useTelemetry";
import { CalibrationOverlay } from "../shared/Overlays";

export function LayoutShell({
  telemetryApi,
  children
}: {
  telemetryApi: ReturnType<typeof useTelemetry>;
  children: ReactNode;
}) {
  const { telemetry } = telemetryApi;

  return (
    <div className="relative">
      <CalibrationOverlay telemetry={telemetry} />
      <div className="mx-auto flex min-h-screen w-[min(1440px,100%)]">
        <Sidebar telemetry={telemetry} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar telemetry={telemetry} connection={telemetryApi.connection} />
          <main className="min-w-0 flex-1 p-5">
            <div className="transition-opacity duration-200 ease-out">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}


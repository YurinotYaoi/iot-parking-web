import { auth } from "@/lib/configs/firebaseClient";
import type { SpotData } from "@/models/layout";

const getResponseData = async <T,>(response: Response): Promise<T> => {
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || result.error || "Grid update failed");
  }
  return result.data as T;
};

export function createGridSpotDraft(
  row: number,
  col: number,
  status: "available" | "occupied" | "reserved",
  layoutId?: string,
): SpotData {
  const draftId = `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    slotId: draftId,
    slotName: `Slot ${row + 1}-${col + 1}`,
    vehicleType: "any",
    rowNo: String(row + 1),
    columnNo: String(col + 1),
    floor: "1",
    layoutId,
    status,
    isDraft: true,
  };
}

const getAuthorizationHeader = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return `Bearer ${await user.getIdToken()}`;
};
export async function updateGridSpotStatus(
  slotId: string,
  status: "available" | "occupied" | "reserved",
): Promise<void> {
  const authorization = await getAuthorizationHeader();
  const response = await fetch(`/api/spots/${slotId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify({ status, forcedOccupied: false }),
  });
  await getResponseData<unknown>(response);
}

export async function setGridSpotForceOccupied(slotId: string, forced: boolean): Promise<void> {
  const authorization = await getAuthorizationHeader();
  const response = await fetch(`/api/spots/${slotId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify({
      status: forced ? "occupied" : "available",
      forcedOccupied: forced,
    }),
  });
  await getResponseData<unknown>(response);
}

export async function updateGridSpotDetails(
  slotId: string,
  details: { slotName: string; vehicleType: string },
): Promise<void> {
  const authorization = await getAuthorizationHeader();
  const response = await fetch(`/api/spots/${slotId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify(details),
  });
  await getResponseData<unknown>(response);
}

export async function assignSensorToGridSpot(sensorId: string, slotId: string): Promise<void> {
  const authorization = await getAuthorizationHeader();
  const response = await fetch(`/api/sensors/${sensorId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify({ spotId: slotId, assigned: true }),
  });
  await getResponseData<unknown>(response);
}

export async function removeSensorFromGridSpot(sensorId: string): Promise<void> {
  const authorization = await getAuthorizationHeader();
  const response = await fetch(`/api/sensors/${sensorId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify({ spotId: null, assigned: false }),
  });
  await getResponseData<unknown>(response);
}

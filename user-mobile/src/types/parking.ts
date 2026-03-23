export type UserProfile = {
  name: string;
  email: string;
  phone: string;
};

export type ParkingCoordinate = {
  latitude: number;
  longitude: number;
};

export type ParkingSlotStatus = 'Available' | 'Occupied';

export type ParkingSlot = {
  id: string;
  locationName: string;
  status: ParkingSlotStatus;
  distance: string;
  rate: string;
  coordinate: ParkingCoordinate;
};
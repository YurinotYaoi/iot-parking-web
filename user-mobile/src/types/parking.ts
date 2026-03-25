export type UserProfile = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  fullName?: string;
};

export type UpdateProfile = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
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

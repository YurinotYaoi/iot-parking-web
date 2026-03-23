import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ParkingSlot } from './parking';

export type AuthStackParamList = {
  SignIn: undefined;
  Login: undefined;
};

export type AppStackParamList = {
  Dashboard: undefined;
  Location: {
    slot: ParkingSlot;
  };
  EditAccount: undefined;
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;

export type SignInScreenProps = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export type DashboardScreenProps = NativeStackScreenProps<AppStackParamList, 'Dashboard'>;
export type LocationScreenProps = NativeStackScreenProps<AppStackParamList, 'Location'>;
export type EditAccountScreenProps = NativeStackScreenProps<AppStackParamList, 'EditAccount'>;
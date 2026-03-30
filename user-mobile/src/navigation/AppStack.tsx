import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/app/DashboardScreen';
import EditAccountScreen from '../screens/app/EditAccountScreen';
import LocationScreen from '../screens/app/LocationScreen';
import type { AppStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack = () => {
  return (
    <Stack.Navigator id={undefined} initialRouteName="Dashboard">
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Location"
        component={LocationScreen}
        options={{ title: 'Parking Location' }}
      />
      <Stack.Screen
        name="EditAccount"
        component={EditAccountScreen}
        options={{
          presentation: 'modal',
          title: 'Edit Account',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppStack;

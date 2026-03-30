import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { AppStackParamList } from '../../types/navigation';
import { colors, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Location'>;

const LocationScreen = ({ route }: Props) => {
  const { slot } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={styles.title}>{slot.locationName}</Text>
          </View>
          <Text style={styles.metaText}>Status: {slot.status}</Text>
          <Text style={styles.metaText}>Distance: {slot.distance}</Text>
          <Text style={styles.metaText}>Rate: {slot.rate}</Text>
        </View>

        <MapView
          style={styles.map}
          initialRegion={{
            latitude: slot.coordinate.latitude,
            longitude: slot.coordinate.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={slot.coordinate} title={slot.locationName} description={`${slot.status} • ${slot.rate}`} />
        </MapView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  metaText: {
    color: colors.muted,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  map: {
    flex: 1,
    borderRadius: radius.xl,
  },
});

export default LocationScreen;
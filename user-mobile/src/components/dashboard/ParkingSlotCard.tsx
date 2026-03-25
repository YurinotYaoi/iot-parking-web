import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows, spacing } from '../../theme';

type ParkingSlot = {
  id: string;
  locationName: string;
  status: 'Available' | 'Occupied';
  distance: string;
  rate: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
};

type ParkingSlotCardProps = {
  slot: ParkingSlot;
  onPressLink: () => void;
};

const ParkingSlotCard = ({ slot, onPressLink }: ParkingSlotCardProps) => {
  const isAvailable = slot.status === 'Available';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.locationName}>{slot.locationName}</Text>
        <View
          style={[
            styles.statusPill,
            isAvailable ? styles.availablePill : styles.occupiedPill,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isAvailable ? styles.availableText : styles.occupiedText,
            ]}
          >
            {slot.status}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Distance</Text>
          <Text style={styles.metaValue}>{slot.distance}</Text>
        </View>

        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Rate</Text>
          <Text style={styles.metaValue}>{slot.rate}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onPressLink}
        style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
      >
        <Text style={styles.linkText}>Link</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  locationName: {
    color: colors.text,
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginRight: spacing.md,
  },
  statusPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  availablePill: {
    backgroundColor: colors.successLight,
  },
  occupiedPill: {
    backgroundColor: colors.dangerLight,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  availableText: {
    color: colors.success,
  },
  occupiedText: {
    color: colors.danger,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  metaBlock: {
    flex: 1,
  },
  metaLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  metaValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  linkText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.9,
  },
});

export default ParkingSlotCard;
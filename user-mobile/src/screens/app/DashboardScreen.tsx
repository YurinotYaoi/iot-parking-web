import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Header from '../../components/dashboard/Header';
import ParkingSlotCard from '../../components/dashboard/ParkingSlotCard';
import mockSlots from '../../data/mockSlots';
import { useAuth } from '../../hooks/useAuth';
import type { AppStackParamList } from '../../types/navigation';
import type { ParkingSlot } from '../../types/parking';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Dashboard'>;

const DashboardScreen = ({ navigation }: Props) => {
  const { user } = useAuth();

  const renderItem = ({ item }: { item: ParkingSlot }) => (
    <ParkingSlotCard
      slot={item}
      onPressLink={() => navigation.navigate('Location', { slot: item })}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={mockSlots}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Header name={user?.name ?? 'Driver'} onPressSettings={() => navigation.navigate('EditAccount')} />
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Nearby Parking Availability</Text>
              <Text style={styles.summaryText}>
                Explore live slot status and tap any location to view it on the map.
              </Text>
            </View>
            <Text style={styles.sectionTitle}>Available locations</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerContainer: {
    marginBottom: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.lg,
    marginTop: spacing.lg,
    
  },
  summaryTitle: {
    color: colors.surface,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  summaryText: {
    color: colors.surface,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.92,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.lg,
  },
  separator: {
    height: spacing.md,
  },
});

export default DashboardScreen;

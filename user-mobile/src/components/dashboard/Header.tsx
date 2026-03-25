import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

type HeaderProps = {
  name: string;
  onPressSettings: () => void;
};

const Header = ({ name, onPressSettings }: HeaderProps) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.caption}>Welcome back</Text>
        <Text style={styles.title}>{name}</Text>
      </View>

      <Pressable
        accessibilityLabel="Open account settings"
        accessibilityRole="button"
        onPress={onPressSettings}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <Ionicons name="settings-outline" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    borderRadius: 22,
    width: 44,
  },
  pressed: {
    opacity: 0.8,
  },
});

export default Header;
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import { useAuth } from '../../hooks/useAuth';
import type { AppStackParamList } from '../../types/navigation';
import { colors, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'EditAccount'>;

const EditAccountScreen = ({ navigation }: Props) => {
  const { user, logout, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [middleName, setMiddleName] = useState(user?.middleName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState(user?.password ?? '');

  useEffect(() => {
    setFirstName(user?.firstName ?? '');
    setMiddleName(user?.middleName ?? '');
    setLastName(user?.lastName ?? '');
    setEmail(user?.email ?? '');
    setPassword(user?.password ?? '');
  }, [user]);

  const isDisabled = useMemo(
    () =>
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim(),
    [email, firstName, lastName, password]
  );

  const handleSave = () => {
    updateProfile({
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: password.trim(),
    });
    Alert.alert('Profile updated', 'Your account details have been saved.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Edit Account</Text>
            <Text style={styles.subtitle}>
              Update your profile information and keep your contact details current.
            </Text>

            <AppInput
              label="First Name"
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <AppInput
              label="Middle Name"
              placeholder="Enter your middle name"
              value={middleName}
              onChangeText={setMiddleName}
            />
            <AppInput
              label="Last Name"
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
            />
            <AppInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AppInput
              label="Password"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.buttonGroup}>
              <AppButton
                title="Save Changes"
                onPress={handleSave}
                disabled={isDisabled}
              />
              <AppButton
                title="Cancel"
                onPress={() => navigation.goBack()}
                variant="secondary"
              />
              <AppButton title="Log Out" onPress={logout} variant="ghost" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonGroup: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});

export default EditAccountScreen;

/*import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const SignInScreen = ({ navigation }: Props) => {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fullName = useMemo(
    () =>
      [firstName.trim(), middleName.trim(), lastName.trim()]
        .filter(Boolean)
        .join(' '),
    [firstName, middleName, lastName]
  );

  const isDisabled = useMemo(
    () => !firstName.trim() || !email.trim() || !password.trim(),
    [email, firstName, password]
  );

  const handleRegister = () => {
    register({
      name: fullName,
      email: email.trim(),
      phone: '',
    });
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
          <View style={styles.content}>
            <View style={styles.heroCard}>
              <Text style={styles.eyebrow}>fleXpark</Text>
              <Text style={styles.title}>Create your Parking Account</Text>
              <Text style={styles.subtitle}>
                Register to discover available parking spots near you in seconds.
              </Text>
            </View>

            <View style={styles.formCard}>
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
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <AppButton
                title="Create Account"
                onPress={handleRegister}
                disabled={isDisabled}
                style={styles.primaryButton}
              />
              <AppButton
                title="Already have an account? Log in"
                onPress={() => navigation.navigate('Login')}
                variant="ghost"
              />
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
  content: {
    gap: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  eyebrow: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
});

export default SignInScreen;*/

import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const SignInScreen = ({ navigation }: Props) => {
  const { register } = useAuth();
  
  // 1. Added State for Confirm Password
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fullName = useMemo(
    () =>
      [firstName.trim(), middleName.trim(), lastName.trim()]
        .filter(Boolean)
        .join(' '),
    [firstName, middleName, lastName]
  );

  // 2. Enhanced Validation Logic
  const isDisabled = useMemo(() => {
    const hasRequiredFields = 
      firstName.trim() && 
      lastName.trim() && 
      email.trim() && 
      password.length >= 6;
    
    const passwordsMatch = password === confirmPassword;
    
    return !hasRequiredFields || !passwordsMatch;
  }, [email, firstName, lastName, password, confirmPassword]);

  const handleRegister = () => {

    // Check passwords match BEFORE calling the function
  if (password !== confirmPassword) {
    // Show an alert or error message
    return;
  }
    register({
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: password.trim(), 
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        // 3. Optimized Keyboard Behavior
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.heroCard}>
              <Text style={styles.eyebrow}>FleXpark</Text>
              <Text style={styles.title}>Create your Parking Account</Text>
              <Text style={styles.subtitle}>
                Register to discover available parking spots near you in seconds.
              </Text>
            </View>

            <View style={styles.formCard}>
              <AppInput
                label="First Name"
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={setFirstName}
              />

              <AppInput
                label="Middle Name"
                placeholder="Optional"
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

              {/* 4. New Confirm Password Input */}
              <AppInput
                label="Confirm Password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                // Visual feedback if passwords don't match
                error={confirmPassword && password !== confirmPassword ? "Passwords do not match" : undefined}
              />

              <AppButton
                title="Create Account"
                onPress={handleRegister}
                disabled={isDisabled}
                style={styles.primaryButton}
              />
              
              <AppButton
                title="Already have an account? Log in"
                onPress={() => navigation.navigate('Login')}
                variant="ghost"
              />
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
  content: {
    gap: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  eyebrow: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
});

export default SignInScreen;

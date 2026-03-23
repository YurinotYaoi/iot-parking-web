
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../types/navigation';
import { colors, radius, spacing } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isDisabled = useMemo(
    () => !email.trim() || password.length < 6,
    [email, password]
  );

  const handleLogin = () => {
    login({
      email: email.trim(),
      password: password.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        // 'padding' is usually best for iOS, while Android often handles 
        // resizing automatically if 'behavior' is undefined or set to 'height'
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        // This offset helps if your header or safe area is pushing content down
        keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.heroCard}>
                <Text style={styles.eyebrow}>Welcome Back</Text>
                <Text style={styles.title}>Log in to continue</Text>
                <Text style={styles.subtitle}>
                  Access your parking dashboard and review nearby slot availability.
                </Text>
              </View>

              <View style={styles.formCard}>
                <AppInput
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                <AppInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                />

                <AppButton
                  title="Log In"
                  onPress={handleLogin}
                  disabled={isDisabled}
                  style={styles.primaryButton}
                />
                
                <AppButton
                  title="Need an account? Sign up"
                  onPress={() => navigation.navigate('SignIn')}
                  variant="ghost"
                />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
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

export default LoginScreen;
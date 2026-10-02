// src/screens/SignUpScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassSheet from '../components/UI/GlassSheet';
import { PrimaryButton, GhostButton } from '../components/UI/Buttons';
import Scene from '../components/World/Scene';
import { useAuth } from '../context/AuthContext';
import theme from '../theme/moodWorldTheme';
import { moderateScale, verticalScale, scaledFontSize } from '../theme/scaling';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen({ navigation, route }) {
  const isLoginInitially = route?.params?.isLogin ?? false;
  const [isLoginMode, setIsLoginMode] = useState(isLoginInitially);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Account creation email verification step
  const [isVerifyingSignup, setIsVerifyingSignup] = useState(false);
  const [signupCode, setSignupCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  // Forgot password flow states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { signup, login, verifyEmail, sendVerificationEmail, forgotPassword, resetPassword } = useAuth();

  useEffect(() => {
    if (route?.params?.isLogin !== undefined) {
      setIsLoginMode(route.params.isLogin);
      setErrorMessage('');
      setIsVerifyingSignup(false);
    }
  }, [route?.params?.isLogin]);

  // Handle Sign Up & Log In
  const handleSubmit = async () => {
    setErrorMessage('');
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (!isLoginMode) {
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!acceptedPolicy) {
        setErrorMessage('Please accept the Terms & Privacy Policy to continue.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isLoginMode) {
        const res = await login({ email: trimmedEmail, password });
        if (!res.success) {
          setErrorMessage(res.error || 'Invalid email or password.');
        }
      } else {
        const res = await signup({
          name: name.trim() || 'Explorer',
          email: trimmedEmail,
          password,
        });

        if (res.success && res.requiresVerification) {
          // Account created: transition to email verification step immediately!
          setPendingEmail(trimmedEmail);
          setIsVerifyingSignup(true);
          setErrorMessage('');
        } else if (!res.success) {
          setErrorMessage(res.error || 'Sign up failed. Please try again.');
        }
      }
    } catch (e) {
      setErrorMessage('Network connection error. Please verify the server is running.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Email Verification at Account Creation
  const handleConfirmSignupCode = async () => {
    setErrorMessage('');
    if (!signupCode || signupCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await verifyEmail(signupCode.trim(), pendingEmail);
      if (res.success) {
        // Authenticated session is set by AuthContext; user enters MoodWorld!
      } else {
        setErrorMessage(res.error || 'Invalid verification code. Please try again.');
      }
    } catch (e) {
      setErrorMessage('Error verifying code. Please check your network.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Resending Code during Signup Verification
  const handleResendSignupCode = async () => {
    setResendStatus('Resending code...');
    setErrorMessage('');
    try {
      const res = await sendVerificationEmail(pendingEmail);
      if (res.success) {
        setResendStatus('✓ New code sent to your email.');
      } else {
        setErrorMessage(res.error || 'Failed to resend code.');
        setResendStatus('');
      }
    } catch (e) {
      setErrorMessage('Network error resending code.');
      setResendStatus('');
    }
  };

  // Handle Forgot Password Flow
  const handleSendResetCode = async () => {
    setForgotError('');
    if (!forgotEmail || !EMAIL_REGEX.test(forgotEmail.trim())) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    setForgotSubmitting(true);
    try {
      const res = await forgotPassword(forgotEmail.trim());
      if (res.success) {
        setForgotSuccess(res.message || 'Code sent to your email.');
        setForgotStep(2);
      } else {
        setForgotError(res.error || 'Failed to send reset code.');
      }
    } catch (e) {
      setForgotError('Network error. Please try again.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    setForgotError('');
    if (!forgotCode || forgotCode.trim().length !== 6) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    setForgotSubmitting(true);
    try {
      const res = await resetPassword(forgotEmail.trim(), forgotCode.trim(), forgotNewPassword);
      if (res.success) {
        setForgotSuccess('Password updated successfully! You can now log in.');
        setTimeout(() => {
          setShowForgotModal(false);
          setPassword(forgotNewPassword);
        }, 1600);
      } else {
        setForgotError(res.error || 'Failed to reset password.');
      }
    } catch (e) {
      setForgotError('Network error. Please try again.');
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + verticalScale(14), 48),
              paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 36 : 24) + 24,
              paddingHorizontal: Math.min(moderateScale(22), screenWidth * 0.07),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Navigation Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (isVerifyingSignup) {
                setIsVerifyingSignup(false);
                setErrorMessage('');
              } else {
                navigation.goBack();
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          {/* Screen Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isVerifyingSignup
                ? 'Verify Email'
                : isLoginMode
                ? 'Welcome Back'
                : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {isVerifyingSignup
                ? `Enter the 6-digit activation code sent to\n${pendingEmail}`
                : isLoginMode
                ? 'Sign in to access your emotional universe.'
                : 'Begin logging your authenticated emotional journey.'}
            </Text>
          </View>

          {/* Main Frosted Glass Form Sheet */}
          <GlassSheet style={styles.formSheet}>
            {/* Top Segmented Mode Switcher (Log In vs Sign Up) */}
            {!isVerifyingSignup && (
              <View style={styles.segmentContainer}>
                <TouchableOpacity
                  style={[styles.segmentBtn, !isLoginMode && styles.segmentBtnActive]}
                  onPress={() => {
                    setIsLoginMode(false);
                    setErrorMessage('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentText, !isLoginMode && styles.segmentTextActive]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentBtn, isLoginMode && styles.segmentBtnActive]}
                  onPress={() => {
                    setIsLoginMode(true);
                    setErrorMessage('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentText, isLoginMode && styles.segmentTextActive]}>
                    Log In
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Error Banner */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* CASE 1: Account Creation Verification Step */}
            {isVerifyingSignup ? (
              <View style={styles.verifyStepContainer}>
                {resendStatus ? (
                  <Text style={styles.resendStatusText}>{resendStatus}</Text>
                ) : null}

                <TextInput
                  placeholder="000000"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={styles.signupCodeInput}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={signupCode}
                  onChangeText={(t) => {
                    setSignupCode(t);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoFocus
                />

                {submitting ? (
                  <ActivityIndicator size="large" color="#60A5FA" style={{ marginVertical: 14 }} />
                ) : (
                  <PrimaryButton
                    label="Verify & Enter MoodWorld"
                    onPress={handleConfirmSignupCode}
                    style={styles.actionButton}
                  />
                )}

                <View style={styles.verifyActionsRow}>
                  <TouchableOpacity onPress={handleResendSignupCode} activeOpacity={0.7}>
                    <Text style={styles.resendLinkText}>Resend Code</Text>
                  </TouchableOpacity>
                  <Text style={{ color: 'rgba(255,255,255,0.3)' }}>•</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsVerifyingSignup(false);
                      setErrorMessage('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resendLinkText}>Edit Email</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* CASE 2: Standard Login / Signup Inputs */
              <>
                {!isLoginMode && (
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <TextInput
                      placeholder="e.g. Maya Lin"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      style={styles.input}
                      value={name}
                      onChangeText={(t) => {
                        setName(t);
                        if (errorMessage) setErrorMessage('');
                      }}
                      autoCorrect={false}
                    />
                  </View>
                )}

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    placeholder="name@example.com"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      if (errorMessage) setErrorMessage('');
                    }}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      placeholder="At least 6 characters"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      style={styles.passwordInput}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      value={password}
                      onChangeText={(t) => {
                        setPassword(t);
                        if (errorMessage) setErrorMessage('');
                      }}
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.eyeText}>{showPassword ? '👁️' : '🙈'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password link in Login mode */}
                {isLoginMode && (
                  <TouchableOpacity
                    style={styles.forgotPassBtn}
                    onPress={() => {
                      setForgotEmail(email.trim());
                      setShowForgotModal(true);
                      setForgotStep(1);
                      setForgotError('');
                      setForgotSuccess('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.forgotPassText}>Forgot password?</Text>
                  </TouchableOpacity>
                )}

                {!isLoginMode && (
                  <TouchableOpacity
                    style={styles.policyRow}
                    onPress={() => {
                      setAcceptedPolicy(!acceptedPolicy);
                      if (errorMessage) setErrorMessage('');
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.checkbox, acceptedPolicy && styles.checkboxActive]}>
                      {acceptedPolicy && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.policyText}>
                      I accept the{' '}
                      <Text
                        style={styles.link}
                        onPress={() => navigation.navigate('PolicyInstruction')}
                      >
                        Terms & Privacy Policy
                      </Text>
                    </Text>
                  </TouchableOpacity>
                )}

                {submitting ? (
                  <ActivityIndicator size="large" color="#60A5FA" style={{ marginVertical: 14 }} />
                ) : (
                  <PrimaryButton
                    label={isLoginMode ? 'Sign In' : 'Create Account'}
                    onPress={handleSubmit}
                    style={styles.actionButton}
                  />
                )}

                {/* Footer Switch */}
                <TouchableOpacity
                  style={styles.toggleRow}
                  onPress={() => {
                    setIsLoginMode(!isLoginMode);
                    setErrorMessage('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.toggleText}>
                    {isLoginMode
                      ? "Don't have an account? "
                      : 'Already have an account? '}
                    <Text style={styles.toggleTextBold}>
                      {isLoginMode ? 'Sign Up' : 'Log In'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </GlassSheet>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <View style={styles.modalOverlay}>
          <GlassSheet style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {forgotStep === 1 ? 'Reset Password' : 'Enter Reset Code'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowForgotModal(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {forgotError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{forgotError}</Text>
              </View>
            ) : null}

            {forgotSuccess ? (
              <View style={styles.successBox}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successText}>{forgotSuccess}</Text>
              </View>
            ) : null}

            {forgotStep === 1 ? (
              <>
                <Text style={styles.modalSubtitle}>
                  Enter the email address registered with MoodWorld. We'll send a 6-digit reset code.
                </Text>
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                />
                <PrimaryButton
                  label={forgotSubmitting ? 'Sending...' : 'Send Reset Code'}
                  onPress={handleSendResetCode}
                  style={styles.actionButton}
                />
              </>
            ) : (
              <>
                <Text style={styles.modalSubtitle}>
                  Enter the 6-digit code and choose a new password.
                </Text>
                <TextInput
                  placeholder="6-Digit Reset Code"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={styles.input}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={forgotCode}
                  onChangeText={setForgotCode}
                />
                <TextInput
                  placeholder="New Password (min 6 characters)"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  style={styles.input}
                  secureTextEntry
                  value={forgotNewPassword}
                  onChangeText={setForgotNewPassword}
                />
                <PrimaryButton
                  label={forgotSubmitting ? 'Updating...' : 'Update Password'}
                  onPress={handleResetPasswordSubmit}
                  style={styles.actionButton}
                />
              </>
            )}
          </GlassSheet>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: theme.radius.chip,
    marginBottom: verticalScale(14),
  },
  backButtonText: {
    ...theme.type.label,
    color: '#FFF',
    fontSize: scaledFontSize(13),
  },
  header: {
    marginBottom: verticalScale(18),
  },
  title: {
    ...theme.type.hero,
    fontSize: scaledFontSize(36),
    color: '#FFF',
  },
  subtitle: {
    ...theme.type.body,
    fontSize: scaledFontSize(14),
    color: theme.ui.textSoft,
    marginTop: 6,
    lineHeight: 20,
  },
  formSheet: {
    gap: 14,
    padding: 20,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 4,
    marginBottom: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  segmentText: {
    ...theme.type.button,
    fontSize: scaledFontSize(13),
    color: theme.ui.textSoft,
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.55)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    color: '#FECACA',
    fontSize: scaledFontSize(13),
    flex: 1,
    lineHeight: 18,
  },
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
    ...theme.type.label,
    color: theme.ui.textSoft,
    fontSize: scaledFontSize(12),
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: theme.radius.button,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#FFF',
    fontSize: scaledFontSize(15),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: theme.radius.button,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#FFF',
    fontSize: scaledFontSize(15),
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  eyeText: {
    fontSize: 18,
  },
  forgotPassBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginTop: -4,
  },
  forgotPassText: {
    ...theme.type.chip,
    color: '#60A5FA',
    fontSize: scaledFontSize(12),
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FFF',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  policyText: {
    ...theme.type.chip,
    fontSize: scaledFontSize(12),
    color: theme.ui.textSoft,
    flex: 1,
    lineHeight: 18,
  },
  link: {
    color: '#60A5FA',
    textDecorationLine: 'underline',
  },
  actionButton: {
    marginTop: 6,
    width: '100%',
    paddingVertical: 16,
  },
  toggleRow: {
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 4,
  },
  toggleText: {
    color: theme.ui.textSoft,
    fontSize: scaledFontSize(14),
  },
  toggleTextBold: {
    color: '#60A5FA',
    fontWeight: '700',
  },
  verifyStepContainer: {
    gap: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendStatusText: {
    color: '#4ADE80',
    fontSize: scaledFontSize(12),
    textAlign: 'center',
  },
  signupCodeInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: theme.radius.button,
    paddingVertical: 16,
    paddingHorizontal: 20,
    color: '#FFF',
    fontSize: 26,
    letterSpacing: 8,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    width: '100%',
  },
  verifyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  resendLinkText: {
    ...theme.type.chip,
    color: '#60A5FA',
    fontSize: scaledFontSize(13),
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  modalSheet: {
    width: '100%',
    maxWidth: 420,
    gap: 14,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    ...theme.type.heading,
    fontSize: scaledFontSize(22),
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalCloseText: {
    color: theme.ui.textSoft,
    fontSize: 18,
    fontWeight: '600',
  },
  modalSubtitle: {
    ...theme.type.body,
    color: theme.ui.textSoft,
    fontSize: scaledFontSize(13),
    lineHeight: 18,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  successIcon: {
    color: '#4ADE80',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successText: {
    color: '#BBF7D0',
    fontSize: scaledFontSize(13),
    flex: 1,
    lineHeight: 18,
  },
});
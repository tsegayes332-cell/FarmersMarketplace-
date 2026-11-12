import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    dispatch(clearError());
    dispatch(loginUser({ email: email.trim(), password }));
  };

  const fillQuickAccount = (quickEmail) => {
    setEmail(quickEmail);
    setPassword('Password123!');
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Brand Hero Top */}
      <View style={styles.brandHero}>
        <View style={styles.logoBadge}>
          <Icon name="sprout" size={32} color="#15803D" />
        </View>
        <Text style={styles.brandName}>Farmers Marketplace</Text>
        <Text style={styles.brandTagline}>Ethiopia's Direct Agricultural Trade Platform</Text>
      </View>

      {/* Login Card */}
      <View style={styles.card}>
        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.welcomeSubtext}>Sign in to access your farm products & orders</Text>

        {error && (
          <View style={styles.errorBox}>
            <Icon name="alert-circle-outline" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.inputLabel}>Email Address</Text>
        <View style={styles.inputWrap}>
          <Icon name="email-outline" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="e.g. buyer@demo.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.inputWrap}>
          <Icon name="lock-outline" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.88}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.loginBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={styles.noAccountText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}> Register</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Demo Logins Helper */}
      <View style={styles.demoSection}>
        <Text style={styles.demoTitle}>⚡ Quick Demo Sign In</Text>
        <View style={styles.demoRow}>
          <TouchableOpacity
            style={styles.demoPill}
            onPress={() => fillQuickAccount('buyer@demo.com')}
          >
            <Text style={styles.demoPillText}>Buyer Demo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoPill}
            onPress={() => fillQuickAccount('farmer@demo.com')}
          >
            <Text style={styles.demoPillText}>Farmer Demo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoPill}
            onPress={() => fillQuickAccount('transporter@demo.com')}
          >
            <Text style={styles.demoPillText}>Transporter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#15803D',
  },
  brandTagline: {
    fontSize: 12.5,
    color: '#4B5563',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  welcomeSubtext: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 13.5,
    color: '#111827',
  },
  loginBtn: {
    backgroundColor: '#15803D',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    elevation: 3,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  loginBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  noAccountText: {
    fontSize: 13,
    color: '#6B7280',
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  demoSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
});

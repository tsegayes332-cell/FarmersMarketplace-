import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('BUYER');

  const handleRegister = () => {
    dispatch(clearError());
    dispatch(registerUser({ name: name.trim(), email: email.trim(), phone: phone.trim(), password, role }));
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.brandHero}>
        <Text style={styles.title}>Create an Account</Text>
        <Text style={styles.subtitle}>Join Farmers Marketplace to trade fresh crops</Text>
      </View>

      <View style={styles.card}>
        {error && (
          <View style={styles.errorBox}>
            <Icon name="alert-circle-outline" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Role Selector Tabs */}
        <Text style={styles.inputLabel}>I want to join as a:</Text>
        <View style={styles.roleTabs}>
          {[
            { key: 'BUYER', label: 'Buyer / Consumer', icon: 'cart-outline' },
            { key: 'FARMER', label: 'Farmer / Producer', icon: 'sprout' },
            { key: 'TRANSPORTER', label: 'Transporter', icon: 'truck-delivery-outline' }
          ].map((item) => {
            const isSelected = role === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.roleTab, isSelected && styles.roleTabActive]}
                onPress={() => setRole(item.key)}
              >
                <Icon 
                  name={item.icon} 
                  size={18} 
                  color={isSelected ? '#FFFFFF' : '#4B5563'} 
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.roleTabText, isSelected && styles.roleTabTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          placeholder="e.g. Abebe Bikila"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
          style={styles.textInput}
        />

        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          placeholder="e.g. abebe@example.com"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.textInput}
        />

        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          placeholder="e.g. +251 911 223 344"
          placeholderTextColor="#9CA3AF"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.textInput}
        />

        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          placeholder="••••••••"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.textInput}
        />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.88}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.haveAccountText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}> Sign In</Text>
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
    paddingVertical: 30,
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#15803D',
  },
  subtitle: {
    fontSize: 13,
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
  roleTabs: {
    marginBottom: 14,
    gap: 6,
  },
  roleTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roleTabActive: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#111827',
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: '#15803D',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  haveAccountText: {
    fontSize: 13,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
});

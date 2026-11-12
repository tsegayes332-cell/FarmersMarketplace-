import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, updateUserProfile } from '../../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ProfileScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => dispatch(logoutUser())
      }
    ]);
  };

  const changeLanguage = async (lng) => {
    i18n.changeLanguage(lng);
    await AsyncStorage.setItem('@app_language', lng);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await dispatch(updateUserProfile({ name: name.trim(), phone: phone.trim() })).unwrap();
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80' }}
            style={styles.avatar}
          />
          <View style={styles.roleTag}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        </View>

        {editing ? (
          <View style={styles.editForm}>
            <Text style={styles.inputLabel}>{t('profile.name_label')}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.textInput}
              placeholder={t('profile.name_label')}
            />
            <Text style={styles.inputLabel}>{t('profile.phone_label')}</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.textInput}
              placeholder="+251 9..."
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>{t('profile.save')}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditing(false)}
              >
                <Text style={styles.cancelBtnText}>{t('profile.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.phone && <Text style={styles.userPhone}>{user.phone}</Text>}

            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => setEditing(true)}
            >
              <Icon name="pencil" size={14} color="#15803D" />
              <Text style={styles.editProfileText}>{t('profile.edit_profile')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Language Selector */}
      <View style={styles.cardSection}>
        <Text style={styles.sectionHeader}>{t('profile.preferred_language')}</Text>
        <View style={styles.languageRow}>
          {[
            { code: 'en', label: 'English' },
            { code: 'am', label: 'አማርኛ' },
            { code: 'om', label: 'Afaan Oromoo' }
          ].map(lang => {
            const isSelected = i18n.language === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => changeLanguage(lang.code)}
                style={[styles.langPill, isSelected && styles.langPillActive]}
              >
                <Text style={[styles.langText, isSelected && styles.langTextActive]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Account Info Cards */}
      <View style={styles.cardSection}>
        <Text style={styles.sectionHeader}>{t('profile.marketplace_info')}</Text>
        
        <View style={styles.infoRow}>
          <Icon name="shield-check" size={20} color="#15803D" />
          <Text style={styles.infoTitle}>{t('profile.account_status')}</Text>
          <Text style={styles.infoValue}>{t('profile.verified_active')}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="map-marker-outline" size={20} color="#15803D" />
          <Text style={styles.infoTitle}>{t('profile.region_country')}</Text>
          <Text style={styles.infoValue}>{t('profile.ethiopia')}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="cash" size={20} color="#15803D" />
          <Text style={styles.infoTitle}>{t('profile.supported_payments')}</Text>
          <Text style={styles.infoValue}>{t('profile.payments_value')}</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Icon name="logout" size={18} color="#DC2626" style={{ marginRight: 6 }} />
        <Text style={styles.logoutText}>{t('profile.sign_out')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 110,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#15803D',
  },
  roleTag: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    backgroundColor: '#15803D',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 1,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  editProfileText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
    marginLeft: 4,
  },
  editForm: {
    width: '100%',
    marginTop: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
    marginBottom: 10,
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#15803D',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelBtnText: {
    color: '#4B5563',
    fontWeight: '700',
    fontSize: 13,
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  languageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  langPillActive: {
    backgroundColor: '#15803D',
    borderColor: '#15803D',
  },
  langText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4B5563',
  },
  langTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoTitle: {
    fontSize: 13,
    color: '#374151',
    marginLeft: 10,
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 4,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
});

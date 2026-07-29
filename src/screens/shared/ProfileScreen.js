import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Avatar, Button, useTheme, Card, TextInput, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, updateUserProfile } from '../../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleLogout = () => {
    ReactNativeHapticFeedback.trigger('notificationWarning');
    dispatch(logoutUser());
  };

  const changeLanguage = async (lng) => {
    ReactNativeHapticFeedback.trigger('impactLight');
    i18n.changeLanguage(lng);
    await AsyncStorage.setItem('@app_language', lng);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.validation'), t('profile.validation_name_empty'));
      return;
    }
    setSaving(true);
    try {
      await dispatch(updateUserProfile({ name: name.trim(), phone: phone.trim() })).unwrap();
      setEditing(false);
      Alert.alert(t('common.success'), t('profile.success_updated'));
    } catch (error) {
      Alert.alert(t('common.error'), error || t('profile.error_update_failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setEditing(false);
  };

  if (!user) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Avatar.Text size={80} label={user.name.substring(0, 2).toUpperCase()} />
        {editing ? (
          <>
            <TextInput
              mode="outlined"
              label={t('profile.name_label')}
              value={name}
              onChangeText={setName}
              style={{ width: '100%', marginTop: 15 }}
            />
            <TextInput
              mode="outlined"
              label={t('profile.phone_label')}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={{ width: '100%', marginTop: 10 }}
            />
            <View style={{ flexDirection: 'row', marginTop: 15, gap: 10 }}>
              <Button mode="contained" onPress={handleSave} disabled={saving} style={{ flex: 1 }}>
                {saving ? <ActivityIndicator color="#fff" size={16} /> : t('common.save')}
              </Button>
              <Button mode="outlined" onPress={handleCancel} style={{ flex: 1 }}>{t('common.cancel')}</Button>
            </View>
          </>
        ) : (
          <>
            <Text variant="headlineSmall" style={{ marginTop: 15, fontWeight: 'bold' }}>{user.name}</Text>
            <Text variant="bodyMedium" style={{ color: 'gray' }}>{user.email}</Text>
            {user.phone && <Text variant="bodyMedium" style={{ color: 'gray' }}>{user.phone}</Text>}
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{user.role}</Text>
            </View>
          </>
        )}
      </View>

      <Card style={styles.card}>
        <Card.Title title={t('profile.language')} />
        <Card.Content style={styles.languageRow}>
          <Button mode={i18n.language === 'en' ? 'contained' : 'outlined'} onPress={() => changeLanguage('en')}>English</Button>
          <Button mode={i18n.language === 'am' ? 'contained' : 'outlined'} onPress={() => changeLanguage('am')}>አማርኛ</Button>
          <Button mode={i18n.language === 'om' ? 'contained' : 'outlined'} onPress={() => changeLanguage('om')}>Afaan Oromoo</Button>
        </Card.Content>
      </Card>

      {!editing && (
        <Button mode="contained" icon="pencil" style={styles.actionBtn} onPress={() => setEditing(true)}>
          {t('profile.edit_profile')}
        </Button>
      )}

      <Button 
        mode="outlined" 
        icon="logout" 
        textColor={theme.colors.error} 
        style={[styles.actionBtn, { borderColor: theme.colors.error }]} 
        onPress={handleLogout}
      >
        {t('profile.logout')}
      </Button>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 10 },
  card: { marginBottom: 20 },
  languageRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 10 },
  actionBtn: { paddingVertical: 5, marginBottom: 15 }
});

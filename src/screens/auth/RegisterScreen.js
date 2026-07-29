import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, useTheme, ActivityIndicator, RadioButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { useTranslation } from 'react-i18next';

export default function RegisterScreen({ navigation }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('BUYER');

  const handleRegister = () => {
    dispatch(clearError());
    dispatch(registerUser({ name, email, phone, password, role }));
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.title}>{t('auth.register_title')}</Text>
      
      {error && <Text style={{ color: theme.colors.error, marginBottom: 10, textAlign: 'center' }}>{error}</Text>}

      <TextInput label={t('auth.full_name')} mode="outlined" value={name} onChangeText={setName} style={styles.input} />
      <TextInput label={t('auth.email')} mode="outlined" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
      <TextInput label={t('auth.phone_number')} mode="outlined" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
      <TextInput label={t('auth.password')} mode="outlined" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <Text variant="titleMedium" style={{ marginTop: 10 }}>{t('auth.i_am_a')}</Text>
      <RadioButton.Group onValueChange={newValue => setRole(newValue)} value={role}>
        <View style={styles.radioRow}>
          <RadioButton value="BUYER" />
          <Text>{t('auth.buyer')}</Text>
        </View>
        <View style={styles.radioRow}>
          <RadioButton value="FARMER" />
          <Text>{t('auth.farmer')}</Text>
        </View>
      </RadioButton.Group>

      <Button mode="contained" onPress={handleRegister} disabled={isLoading} style={styles.button}>
        {isLoading ? <ActivityIndicator color="white" /> : t('auth.register')}
      </Button>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.primary }}>
          {t('auth.login_link')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  title: { textAlign: 'center', marginBottom: 30, fontWeight: 'bold' },
  input: { marginBottom: 15 },
  button: { paddingVertical: 5, marginTop: 10 },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 }
});

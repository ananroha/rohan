import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { UserRole } from '../../types';
import { OnboardingStackParamList } from '../../navigation';

type Props = StackScreenProps<OnboardingStackParamList, 'RoleSelect'>;

export function RoleSelectScreen({ navigation }: Props) {
  const [role, setRole] = useState<UserRole | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How will you use WeCe?</Text>
        <Text style={styles.subtitle}>You can switch anytime later.</Text>
      </View>

      <View style={styles.cards}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setRole('user')}
          style={[
            styles.card,
            role === 'user' && { borderColor: Colors.tealDeep, borderWidth: 2 },
          ]}
        >
          <Text style={styles.emoji}>🚻</Text>
          <Text style={styles.cardTitle}>Find a toilet</Text>
          <Text style={styles.cardBody}>I need to find a WC nearby</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setRole('partner')}
          style={[
            styles.card,
            role === 'partner' && { borderColor: Colors.coral, borderWidth: 2 },
          ]}
        >
          <Text style={styles.emoji}>🏪</Text>
          <Text style={styles.cardTitle}>List my business</Text>
          <Text style={styles.cardBody}>I'm a café or restaurant owner</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !role && styles.buttonDisabled]}
          disabled={!role}
          activeOpacity={0.85}
          onPress={() => role && navigation.navigate('Auth', { role })}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontFamily: Fonts.brand,
    fontSize: 32,
    color: Colors.ink,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.gray,
    marginTop: 8,
  },
  cards: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.cream2,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.grayLight,
    marginBottom: 16,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 20,
    color: Colors.ink,
    marginBottom: 4,
  },
  cardBody: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.gray,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  button: {
    backgroundColor: Colors.tealDeep,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 18,
    color: Colors.white,
  },
});

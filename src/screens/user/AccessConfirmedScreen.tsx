import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { MapStackParamList } from '../../navigation';

type Props = StackScreenProps<MapStackParamList, 'AccessConfirmed'>;

export function AccessConfirmedScreen({ navigation, route }: Props) {
  const { partnerName, amountCents } = route.params;
  const timestamp = new Date().toLocaleString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <View style={styles.checkCircle}>
          <Text style={styles.check}>✓</Text>
        </View>
        <Text style={styles.title}>Access Confirmed!</Text>
        <Text style={styles.partner}>{partnerName}</Text>
        <Text style={styles.amount}>€{(amountCents / 100).toFixed(2)} · {timestamp}</Text>

        <View style={styles.mockBadge}>
          <Text style={styles.mockBadgeText}>MOCK PAYMENT</Text>
        </View>

        <Text style={styles.subtitle}>Show this to staff</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.success },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  check: { fontSize: 64, color: Colors.success },
  title: { fontFamily: Fonts.brand, fontSize: 36, color: Colors.white },
  partner: { fontFamily: Fonts.bodyBold, fontSize: 20, color: Colors.white, marginTop: 12 },
  amount: { fontFamily: Fonts.body, fontSize: 14, color: Colors.white, marginTop: 6, opacity: 0.9 },
  mockBadge: {
    backgroundColor: Colors.mock,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 20,
  },
  mockBadgeText: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.white },
  subtitle: { fontFamily: Fonts.body, fontSize: 15, color: Colors.white, marginTop: 20, opacity: 0.9 },
  footer: { paddingHorizontal: 24, paddingBottom: 24 },
  button: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: { fontFamily: Fonts.bodyBold, fontSize: 18, color: Colors.success },
});

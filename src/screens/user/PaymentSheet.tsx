import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { mockPayment } from '../../api/payments';
import { useAppStore } from '../../store/useAppStore';
import { MapStackParamList } from '../../navigation';

type Props = StackScreenProps<MapStackParamList, 'PaymentSheet'>;

export function PaymentSheet({ navigation, route }: Props) {
  const { toiletId, partnerId, partnerName, amountCents } = route.params;
  const { user } = useAppStore();
  const [paying, setPaying] = useState(false);

  const credits = user?.credits_cents ?? 0;

  async function handlePay() {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to pay.');
      return;
    }
    setPaying(true);
    try {
      await mockPayment(user.id, partnerId, toiletId, amountCents);
      navigation.replace('AccessConfirmed', { partnerName, amountCents });
    } catch (e: any) {
      Alert.alert('Payment failed', e?.message ?? 'Please try again.');
    } finally {
      setPaying(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.grabber} />
      <TouchableOpacity style={styles.close} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={styles.partner}>{partnerName}</Text>
        <Text style={styles.partnerSub}>Partner café · entry pass</Text>

        <Text style={styles.amount}>€{(amountCents / 100).toFixed(2)}</Text>

        <View style={styles.mockBadge}>
          <Text style={styles.mockBadgeText}>MOCK PAYMENT</Text>
        </View>

        <View style={styles.creditsRow}>
          <Text style={styles.creditsLabel}>WeCe Credits</Text>
          <Text style={styles.creditsValue}>€{(credits / 100).toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.payBtn, paying && styles.payBtnDisabled]}
          disabled={paying}
          onPress={handlePay}
        >
          {paying ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.payText}>Pay with WeCe Credits</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>Real payments coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream2 },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.grayLight,
    alignSelf: 'center',
    marginTop: 12,
  },
  close: { position: 'absolute', top: 12, right: 16, padding: 8 },
  closeText: { fontSize: 20, color: Colors.gray },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  partner: { fontFamily: Fonts.brand, fontSize: 30, color: Colors.ink },
  partnerSub: { fontFamily: Fonts.body, fontSize: 14, color: Colors.gray, marginTop: 4 },
  amount: { fontFamily: Fonts.bodyBold, fontSize: 56, color: Colors.coral, marginVertical: 20 },
  mockBadge: {
    backgroundColor: Colors.mock,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  mockBadgeText: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.white },
  creditsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.cream,
    borderRadius: 14,
  },
  creditsLabel: { fontFamily: Fonts.body, fontSize: 15, color: Colors.ink },
  creditsValue: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.tealDeep },
  payBtn: {
    width: '100%',
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: Colors.tealDeep,
  },
  payBtnDisabled: { opacity: 0.6 },
  payText: { fontFamily: Fonts.bodyBold, fontSize: 17, color: Colors.white },
  note: { fontFamily: Fonts.body, fontSize: 13, color: Colors.gray, marginTop: 16 },
});

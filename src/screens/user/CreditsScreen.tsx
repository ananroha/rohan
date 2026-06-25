import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { useAppStore } from '../../store/useAppStore';
import { getUserPayments } from '../../api/payments';
import { ProfileStackParamList } from '../../navigation';

type Props = StackScreenProps<ProfileStackParamList, 'Credits'>;

const TOPUPS = [500, 1000, 2000];

export function CreditsScreen({ navigation }: Props) {
  const { user } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await getUserPayments(user.id);
        if (mounted) setHistory(data ?? []);
      } catch {
        // ignore; show empty history
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  const balance = user?.credits_cents ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WeCe Credits</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current balance</Text>
          <Text style={styles.balance}>€{(balance / 100).toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.whyCard} onPress={() => setExpanded((e) => !e)}>
          <View style={styles.whyHeader}>
            <Text style={styles.whyTitle}>Why credits?</Text>
            <Text style={styles.whyChevron}>{expanded ? '▲' : '▼'}</Text>
          </View>
          {expanded && (
            <Text style={styles.whyBody}>
              Card networks charge a flat fee on every tiny payment, which makes a single €1
              entry uneconomical. Topping up WeCe Credits in larger amounts means one card fee
              covers many visits — so more of your money reaches partner cafés.
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Top up</Text>
        <View style={styles.topupRow}>
          {TOPUPS.map((cents) => (
            <TouchableOpacity
              key={cents}
              style={styles.topupTile}
              onPress={() =>
                Alert.alert('Coming soon', 'Top-ups will be available in a future update.')
              }
            >
              <Text style={styles.topupAmount}>€{(cents / 100).toFixed(0)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Transaction history</Text>
        {loading ? (
          <ActivityIndicator color={Colors.tealDeep} style={{ marginTop: 16 }} />
        ) : history.length === 0 ? (
          <Text style={styles.empty}>No transactions yet.</Text>
        ) : (
          history.map((p) => (
            <View key={p.id} style={styles.txRow}>
              <View>
                <Text style={styles.txName}>{p.toilets?.name ?? 'Partner entry'}</Text>
                <Text style={styles.txDate}>
                  {new Date(p.created_at).toLocaleDateString('en-GB')}
                </Text>
              </View>
              <Text style={styles.txAmount}>-€{(p.amount_cents / 100).toFixed(2)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.tealDeep, width: 50 },
  headerTitle: { fontFamily: Fonts.brand, fontSize: 22, color: Colors.ink },
  scroll: { padding: 16, paddingBottom: 40 },
  balanceCard: {
    backgroundColor: Colors.cream2,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: { fontFamily: Fonts.body, fontSize: 14, color: Colors.gray },
  balance: { fontFamily: Fonts.bodyBold, fontSize: 44, color: Colors.tealDeep, marginTop: 8 },
  whyCard: {
    backgroundColor: Colors.cream2,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  whyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  whyTitle: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.ink },
  whyChevron: { color: Colors.gray },
  whyBody: { fontFamily: Fonts.body, fontSize: 14, color: Colors.gray, lineHeight: 21, marginTop: 12 },
  sectionTitle: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.ink, marginTop: 28, marginBottom: 12 },
  topupRow: { flexDirection: 'row', gap: 12 },
  topupTile: {
    flex: 1,
    backgroundColor: Colors.cream2,
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.grayLight,
  },
  topupAmount: { fontFamily: Fonts.bodyBold, fontSize: 22, color: Colors.tealDeep },
  empty: { fontFamily: Fonts.body, fontSize: 14, color: Colors.gray, marginTop: 8 },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  txName: { fontFamily: Fonts.body, fontSize: 15, color: Colors.ink },
  txDate: { fontFamily: Fonts.body, fontSize: 12, color: Colors.gray, marginTop: 2 },
  txAmount: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.coral },
});

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, PinColors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { RaindropPin } from '../../components/RaindropPin';
import { PillBadge } from '../../components/PillBadge';
import { getPartnerToilet } from '../../api/partner';
import { getPartnerPayments as fetchPartnerPayments } from '../../api/payments';
import { signOut } from '../../api/auth';
import { useAppStore } from '../../store/useAppStore';
import { Toilet, Payment } from '../../types';
import { PartnerStackParamList } from '../../navigation';

type Props = StackScreenProps<PartnerStackParamList, 'PartnerDashboard'>;

function isToday(d: string): boolean {
  const date = new Date(d);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function isThisWeek(d: string): boolean {
  const date = new Date(d).getTime();
  return Date.now() - date < 7 * 24 * 60 * 60 * 1000;
}

export function PartnerDashboardScreen({ navigation }: Props) {
  const { user, clearAuth } = useAppStore();
  const [toilet, setToilet] = useState<Toilet | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        if (!user) {
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          const t = await getPartnerToilet(user.id);
          if (mounted) setToilet(t);
          const p = await fetchPartnerPayments(user.id);
          if (mounted) setPayments(p ?? []);
        } catch (e: any) {
          if (mounted) Alert.alert('Error', e?.message ?? 'Could not load dashboard.');
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [user])
  );

  async function handleSignOut() {
    try {
      await signOut();
      clearAuth();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not sign out.');
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.coral} />
      </View>
    );
  }

  if (!toilet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <RaindropPin color={Colors.coral} size={90} />
          <Text style={styles.emptyTitle}>No listing yet</Text>
          <Text style={styles.emptyBody}>Register your business to start welcoming guests.</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('RegisterBusiness')}
          >
            <Text style={styles.primaryBtnText}>Register business</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signOutLink} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const today = payments.filter((p) => isToday(p.created_at)).length;
  const week = payments.filter((p) => isThisWeek(p.created_at)).length;
  const revenue = payments.reduce((sum, p) => sum + p.amount_cents, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.greeting}>Hi, {toilet.name}</Text>

        <View style={styles.listingCard}>
          <RaindropPin color={PinColors.partner} size={40} />
          <View style={styles.listingBody}>
            <Text style={styles.listingName}>{toilet.name}</Text>
            <View style={styles.badgeRow}>
              <PillBadge label="partner" variant="partner" />
              {toilet.wheelchair ? <PillBadge label="accessible" variant="accessible" /> : null}
            </View>
            <Text style={styles.listingPrice}>€{(toilet.price_cents / 100).toFixed(2)} per use</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat value={String(today)} label="Scans today" />
          <Stat value={String(week)} label="This week" />
          <Stat value={`€${(revenue / 100).toFixed(2)}`} label="Revenue" />
        </View>

        <View style={styles.ratingCard}>
          <Text style={styles.ratingLabel}>Rating</Text>
          <Text style={styles.ratingValue}>★ —</Text>
          <Text style={styles.ratingHint}>Ratings appear after your first reviews.</Text>
        </View>

        <View style={styles.payoutCard}>
          <Text style={styles.payoutTitle}>Connect payout</Text>
          <Text style={styles.payoutBody}>
            Real payouts via Stripe Connect are coming in v2. For now, scans use mock payments.
          </Text>
        </View>

        <View style={styles.links}>
          <LinkBtn label="📊  Analytics" onPress={() => navigation.navigate('PartnerAnalytics')} />
          <LinkBtn label="✏️  Edit Listing" onPress={() => navigation.navigate('EditListing')} />
          <LinkBtn label="🔳  My QR" onPress={() => navigation.navigate('MyQR')} />
        </View>

        <TouchableOpacity style={styles.signOutLink} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function LinkBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.linkBtn} onPress={onPress}>
      <Text style={styles.linkLabel}>{label}</Text>
      <Text style={styles.linkChevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cream,
    padding: 24,
  },
  emptyTitle: { fontFamily: Fonts.brand, fontSize: 26, color: Colors.ink, marginTop: 20 },
  emptyBody: { fontFamily: Fonts.body, fontSize: 15, color: Colors.gray, textAlign: 'center', marginTop: 8 },
  primaryBtn: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: Colors.coral,
    borderRadius: 14,
  },
  primaryBtnText: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.white },
  scroll: { padding: 16, paddingBottom: 40 },
  greeting: { fontFamily: Fonts.brand, fontSize: 28, color: Colors.ink, marginBottom: 16 },
  listingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream2,
    borderRadius: 18,
    padding: 16,
  },
  listingBody: { flex: 1, marginLeft: 14 },
  listingName: { fontFamily: Fonts.bodyBold, fontSize: 18, color: Colors.ink },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  listingPrice: { fontFamily: Fonts.body, fontSize: 14, color: Colors.gray, marginTop: 6 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.cream2,
    borderRadius: 18,
    paddingVertical: 18,
    marginTop: 16,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: Fonts.bodyBold, fontSize: 20, color: Colors.coral },
  statLabel: { fontFamily: Fonts.body, fontSize: 12, color: Colors.gray, marginTop: 4 },
  ratingCard: { backgroundColor: Colors.cream2, borderRadius: 18, padding: 18, marginTop: 16 },
  ratingLabel: { fontFamily: Fonts.body, fontSize: 13, color: Colors.gray },
  ratingValue: { fontFamily: Fonts.bodyBold, fontSize: 24, color: Colors.ink, marginTop: 4 },
  ratingHint: { fontFamily: Fonts.body, fontSize: 12, color: Colors.gray, marginTop: 4 },
  payoutCard: {
    marginTop: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.coral,
    borderRadius: 18,
    padding: 18,
  },
  payoutTitle: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.coral },
  payoutBody: { fontFamily: Fonts.body, fontSize: 14, color: Colors.gray, marginTop: 6, lineHeight: 20 },
  links: { marginTop: 16, backgroundColor: Colors.cream2, borderRadius: 18, overflow: 'hidden' },
  linkBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cream,
  },
  linkLabel: { fontFamily: Fonts.body, fontSize: 16, color: Colors.ink },
  linkChevron: { fontSize: 22, color: Colors.gray },
  signOutLink: { marginTop: 24, alignItems: 'center' },
  signOutText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.coral },
});

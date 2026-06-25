import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, PinColors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { RaindropPin } from '../../components/RaindropPin';
import { PillBadge } from '../../components/PillBadge';
import { FreshnessBadge } from '../../components/FreshnessBadge';
import { getToiletById } from '../../api/toilets';
import { submitFeedback } from '../../api/feedback';
import { useAppStore } from '../../store/useAppStore';
import { Toilet } from '../../types';
import { MapStackParamList } from '../../navigation';

type Props = StackScreenProps<MapStackParamList, 'Detail'>;

function formatDistance(meters?: number): string {
  if (meters == null) return '';
  if (meters < 1000) return `${Math.round(meters)} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
}

export function DetailScreen({ navigation, route }: Props) {
  const { toiletId, toilet: passed } = route.params;
  const { user, savedToiletIds, toggleSaved } = useAppStore();
  const [toilet, setToilet] = useState<Toilet | null>(passed ?? null);
  const [loading, setLoading] = useState(!passed);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (passed) return;
    let mounted = true;
    (async () => {
      try {
        const t = await getToiletById(toiletId);
        if (mounted) setToilet(t);
      } catch (e: any) {
        Alert.alert('Error', e?.message ?? 'Could not load this toilet.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toiletId, passed]);

  async function handleFeedback(vote: 'accurate' | 'closed') {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to give feedback.');
      return;
    }
    setSubmitting(true);
    try {
      await submitFeedback(toiletId, user.id, vote);
      Alert.alert('Thanks!', vote === 'accurate' ? 'Marked as still here.' : 'Reported as wrong.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not submit feedback.');
    } finally {
      setSubmitting(false);
    }
  }

  function navigate() {
    if (!toilet) return;
    const { lat, lng } = toilet;
    const url = Platform.select({
      ios: `maps://app?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });
    Linking.openURL(
      url ?? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    ).catch(() =>
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`)
    );
  }

  if (loading || !toilet) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.tealDeep} />
      </View>
    );
  }

  const pinColor = PinColors[toilet.type];
  const isSaved = savedToiletIds.includes(toilet.id);
  const title = toilet.name || 'Public WC';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.headerBg, { backgroundColor: pinColor }]}>
          <SafeAreaView edges={['top']}>
            <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>‹ Back</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <RaindropPin color={Colors.white} size={64} />
              <View style={styles.headerBadge}>
                <PillBadge label={toilet.type} variant={toilet.type} />
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.coords}>
            {toilet.lat.toFixed(5)}, {toilet.lng.toFixed(5)}
          </Text>

          <View style={styles.metaRow}>
            <FreshnessBadge lastConfirmedAt={toilet.last_confirmed_at} />
            {toilet.distance_meters != null && (
              <Text style={styles.distance}>{formatDistance(toilet.distance_meters)}</Text>
            )}
          </View>

          <View style={styles.pillRow}>
            {toilet.type === 'paid' && toilet.price_cents > 0 && (
              <PillBadge label={`€${(toilet.price_cents / 100).toFixed(2)}`} variant="paid" />
            )}
            {toilet.type === 'partner' && <PillBadge label="~€1" variant="partner" />}
            {toilet.wheelchair && <PillBadge label="accessible" variant="accessible" />}
            {toilet.status === 'reported_closed' && (
              <PillBadge label="reported closed" variant="closed" />
            )}
          </View>

          <Section title="Amenities">
            <View style={styles.amenities}>
              <Amenity emoji="♿" label="Wheelchair" available={!!toilet.wheelchair} />
              <Amenity emoji="🍼" label="Baby change" available={!!toilet.baby_change} />
            </View>
          </Section>

          <Section title="Opening hours">
            <Text style={styles.sectionText}>{toilet.opening_hours || 'Not specified'}</Text>
          </Section>

          <Section title="Photos">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.addPhoto}
                onPress={() => Alert.alert('Coming soon', 'Photo uploads are on the way.')}
              >
                <Text style={styles.addPhotoText}>＋{'\n'}Add photo</Text>
              </TouchableOpacity>
            </ScrollView>
          </Section>

          <View style={styles.feedbackRow}>
            <TouchableOpacity
              style={[styles.feedbackBtn, styles.feedbackUp]}
              disabled={submitting}
              onPress={() => handleFeedback('accurate')}
            >
              <Text style={styles.feedbackUpText}>👍 Still here!</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.feedbackBtn, styles.feedbackDown]}
              disabled={submitting}
              onPress={() => handleFeedback('closed')}
            >
              <Text style={styles.feedbackDownText}>👎 Something's wrong</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={() => toggleSaved(toilet.id)}>
            <Text style={styles.saveText}>{isSaved ? '❤️ Saved' : '🤍 Save'}</Text>
          </TouchableOpacity>

          {toilet.type === 'partner' && toilet.partner_id && (
            <TouchableOpacity
              style={styles.payBtn}
              onPress={() =>
                navigation.navigate('PaymentSheet', {
                  toiletId: toilet.id,
                  partnerId: toilet.partner_id!,
                  partnerName: title,
                  amountCents: toilet.price_cents || 100,
                })
              }
            >
              <Text style={styles.payText}>Pay €1 & enter</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.navBtn} onPress={navigate}>
            <Text style={styles.navText}>🧭 Navigate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Amenity({ emoji, label, available }: { emoji: string; label: string; available: boolean }) {
  return (
    <View style={[styles.amenity, !available && styles.amenityOff]}>
      <Text style={styles.amenityEmoji}>{emoji}</Text>
      <Text style={[styles.amenityLabel, !available && styles.amenityLabelOff]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.cream },
  scroll: { paddingBottom: 32 },
  headerBg: { paddingBottom: 28 },
  back: { padding: 16 },
  backText: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.white },
  headerCenter: { alignItems: 'center', marginTop: 8 },
  headerBadge: { marginTop: 12 },
  body: { paddingHorizontal: 20, marginTop: -12 },
  title: { fontFamily: Fonts.brand, fontSize: 30, color: Colors.ink, marginTop: 16 },
  coords: { fontFamily: Fonts.body, fontSize: 13, color: Colors.gray, marginTop: 4 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  distance: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.tealDark },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  section: { marginTop: 24 },
  sectionTitle: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.ink, marginBottom: 10 },
  sectionText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.gray },
  amenities: { flexDirection: 'row', gap: 12 },
  amenity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream2,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  amenityOff: { opacity: 0.4 },
  amenityEmoji: { fontSize: 18, marginRight: 8 },
  amenityLabel: { fontFamily: Fonts.body, fontSize: 14, color: Colors.ink },
  amenityLabelOff: { color: Colors.gray },
  addPhoto: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.grayLight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
  },
  feedbackRow: { flexDirection: 'row', gap: 12, marginTop: 28 },
  feedbackBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  feedbackUp: { backgroundColor: Colors.teal },
  feedbackUpText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.white },
  feedbackDown: { backgroundColor: Colors.cream2, borderWidth: 1, borderColor: Colors.grayLight },
  feedbackDownText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ink },
  saveBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: Colors.cream2,
    borderWidth: 1,
    borderColor: Colors.grayLight,
  },
  saveText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.ink },
  payBtn: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: Colors.coral,
  },
  payText: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.white },
  navBtn: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: Colors.tealDeep,
  },
  navText: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.white },
});

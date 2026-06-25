import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { getPartnerPayments } from '../../api/payments';
import { useAppStore } from '../../store/useAppStore';
import { Payment } from '../../types';
import { PartnerStackParamList } from '../../navigation';

type Props = StackScreenProps<PartnerStackParamList, 'PartnerAnalytics'>;

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function lastSevenDayCounts(payments: Payment[]): number[] {
  const counts = new Array(7).fill(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const p of payments) {
    const d = new Date(p.created_at);
    d.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff < 7) {
      counts[6 - diff] += 1;
    }
  }
  return counts;
}

function busiestHour(payments: Payment[]): string {
  if (payments.length === 0) return '—';
  const hours = new Array(24).fill(0);
  payments.forEach((p) => {
    hours[new Date(p.created_at).getHours()] += 1;
  });
  let max = 0;
  let hour = 0;
  hours.forEach((c, h) => {
    if (c > max) {
      max = c;
      hour = h;
    }
  });
  return `${hour}:00–${hour + 1}:00`;
}

export function PartnerAnalyticsScreen({ navigation }: Props) {
  const { user } = useAppStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await getPartnerPayments(user.id);
        if (mounted) setPayments(data ?? []);
      } catch {
        // show empty chart
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  const counts = lastSevenDayCounts(payments);
  const max = Math.max(1, ...counts);

  const CHART_W = 300;
  const CHART_H = 160;
  const barW = 26;
  const gap = (CHART_W - barW * 7) / 8;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator color={Colors.coral} style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Scans · last 7 days</Text>
            <View style={styles.chartCard}>
              <Svg width={CHART_W} height={CHART_H + 24}>
                <Line
                  x1={0}
                  y1={CHART_H}
                  x2={CHART_W}
                  y2={CHART_H}
                  stroke={Colors.grayLight}
                  strokeWidth={1}
                />
                {counts.map((c, i) => {
                  const h = (c / max) * (CHART_H - 10);
                  const x = gap + i * (barW + gap);
                  const y = CHART_H - h;
                  return (
                    <Rect
                      key={i}
                      x={x}
                      y={y}
                      width={barW}
                      height={h}
                      rx={6}
                      fill={Colors.coral}
                    />
                  );
                })}
              </Svg>
              <View style={styles.labelsRow}>
                {DAY_LABELS.map((d) => (
                  <Text key={d} style={styles.dayLabel}>
                    {d}
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Busiest hour</Text>
              <Text style={styles.statValue}>{busiestHour(payments)}</Text>
            </View>

            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>Tips</Text>
              <Text style={styles.tip}>• Place your QR sticker at eye level near the entrance.</Text>
              <Text style={styles.tip}>• Mention "WeCe welcome" in your window to attract visitors.</Text>
              <Text style={styles.tip}>• Keep your opening hours up to date for better ranking.</Text>
            </View>
          </>
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
  back: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.coral, width: 50 },
  headerTitle: { fontFamily: Fonts.brand, fontSize: 22, color: Colors.ink },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.ink, marginBottom: 12 },
  chartCard: { backgroundColor: Colors.cream2, borderRadius: 18, padding: 16, alignItems: 'center' },
  labelsRow: { flexDirection: 'row', justifyContent: 'space-between', width: 300, marginTop: 4 },
  dayLabel: { fontFamily: Fonts.body, fontSize: 11, color: Colors.gray, width: 34, textAlign: 'center' },
  statCard: { backgroundColor: Colors.cream2, borderRadius: 18, padding: 18, marginTop: 16 },
  statLabel: { fontFamily: Fonts.body, fontSize: 13, color: Colors.gray },
  statValue: { fontFamily: Fonts.bodyBold, fontSize: 22, color: Colors.ink, marginTop: 4 },
  tipsCard: { backgroundColor: Colors.cream2, borderRadius: 18, padding: 18, marginTop: 16 },
  tipsTitle: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.ink, marginBottom: 10 },
  tip: { fontFamily: Fonts.body, fontSize: 14, color: Colors.gray, lineHeight: 22 },
});

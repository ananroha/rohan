import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, PinColors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { Toilet } from '../types';
import { RaindropPin } from './RaindropPin';
import { PillBadge } from './PillBadge';
import { FreshnessBadge } from './FreshnessBadge';

interface ToiletCardProps {
  toilet: Toilet;
  onPress: () => void;
  style?: object;
}

function formatDistance(meters?: number): string {
  if (meters == null) return '';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function ToiletCard({ toilet, onPress, style }: ToiletCardProps) {
  const pinColor = PinColors[toilet.type];
  const title = toilet.name || 'Public WC';
  const distance = formatDistance(toilet.distance_meters);

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.pinWrap}>
        <RaindropPin color={pinColor} size={32} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.badgeRow}>
          <PillBadge label={toilet.type} variant={toilet.type} />
          {toilet.wheelchair ? <PillBadge label="accessible" variant="accessible" /> : null}
        </View>
        <View style={styles.metaRow}>
          <FreshnessBadge lastConfirmedAt={toilet.last_confirmed_at} />
          {distance ? <Text style={styles.distance}>{distance}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.cream2,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: Colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pinWrap: {
    marginRight: 12,
  },
  body: {
    flex: 1,
  },
  title: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    color: Colors.ink,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distance: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: Colors.tealDark,
  },
});

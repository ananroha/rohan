import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

interface FreshnessBadgeProps {
  lastConfirmedAt: string | null;
  freshnessScore?: number;
}

function daysSince(dateStr: string): number {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

export function FreshnessBadge({ lastConfirmedAt }: FreshnessBadgeProps) {
  let dotColor = Colors.gray;
  let label = 'not recently confirmed';

  if (lastConfirmedAt) {
    const days = daysSince(lastConfirmedAt);
    if (days <= 0) {
      dotColor = Colors.success;
      label = 'confirmed today';
    } else if (days < 7) {
      dotColor = Colors.mock;
      label = `confirmed ${days} day${days === 1 ? '' : 's'} ago`;
    } else if (days < 30) {
      dotColor = Colors.mock;
      label = `confirmed ${Math.floor(days / 7)} week${days < 14 ? '' : 's'} ago`;
    } else {
      dotColor = Colors.gray;
      label = 'not recently confirmed';
    }
  }

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.ink,
  },
});

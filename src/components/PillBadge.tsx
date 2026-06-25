import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

type Variant = 'free' | 'paid' | 'partner' | 'accessible' | 'closed';

interface PillBadgeProps {
  label: string;
  variant: Variant;
}

const VARIANT_COLORS: Record<Variant, { bg: string; text: string }> = {
  free: { bg: Colors.teal, text: Colors.white },
  paid: { bg: Colors.paidBlue, text: Colors.white },
  partner: { bg: Colors.coral, text: Colors.white },
  accessible: { bg: Colors.tealDark, text: Colors.white },
  closed: { bg: Colors.grayLight, text: Colors.ink },
};

export function PillBadge({ label, variant }: PillBadgeProps) {
  const { bg, text } = VARIANT_COLORS[variant];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
  },
});

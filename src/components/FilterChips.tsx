import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { FilterType } from '../types';

interface FilterChipsProps {
  active: FilterType;
  onChange: (filter: FilterType) => void;
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'free', label: 'Free' },
  { key: 'paid', label: 'Paid' },
  { key: 'partner', label: 'Partner' },
  { key: 'accessible', label: 'Accessible' },
];

export function FilterChips({ active, onChange }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((f) => {
        const isActive = active === f.key;
        return (
          <TouchableOpacity
            key={f.key}
            onPress={() => onChange(f.key)}
            style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: Colors.tealDeep,
    borderColor: Colors.tealDeep,
  },
  chipInactive: {
    backgroundColor: Colors.cream2,
    borderColor: Colors.grayLight,
  },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
  },
  labelActive: {
    color: Colors.white,
  },
  labelInactive: {
    color: Colors.ink,
  },
});

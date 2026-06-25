import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { FilterChips } from '../../components/FilterChips';
import { ToiletCard } from '../../components/ToiletCard';
import { useAppStore } from '../../store/useAppStore';
import { Toilet, FilterType } from '../../types';
import { MapStackParamList } from '../../navigation';

type Props = StackScreenProps<MapStackParamList, 'List'>;

function applyFilter(toilets: Toilet[], filter: FilterType, search: string): Toilet[] {
  let result = toilets;
  if (filter === 'accessible') {
    result = result.filter((t) => t.wheelchair === true);
  } else if (filter !== 'all') {
    result = result.filter((t) => t.type === filter);
  }
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter((t) => (t.name || 'public wc').toLowerCase().includes(q));
  }
  return [...result].sort((a, b) => (a.distance_meters ?? 0) - (b.distance_meters ?? 0));
}

export function ListScreen({ navigation }: Props) {
  const { nearbyToilets, activeFilter, setFilter } = useAppStore();
  const [search, setSearch] = useState('');

  const data = applyFilter(nearbyToilets, activeFilter, search);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search toilets"
              placeholderTextColor={Colors.gray}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.toggleButton} onPress={() => navigation.goBack()}>
            <Text style={styles.toggleIcon}>📍</Text>
          </TouchableOpacity>
        </View>
        <FilterChips active={activeFilter} onChange={setFilter} />
      </View>

      <FlatList
        data={data}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={<Text style={styles.empty}>No toilets match your filter.</Text>}
        renderItem={({ item }) => (
          <ToiletCard
            toilet={item}
            onPress={() => navigation.navigate('Detail', { toiletId: item.id, toilet: item })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { backgroundColor: Colors.cream },
  searchRow: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 8, gap: 8 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream2,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.grayLight,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontFamily: Fonts.body, fontSize: 15, color: Colors.ink },
  toggleButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.tealDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleIcon: { fontSize: 20 },
  listContent: { padding: 16 },
  empty: {
    fontFamily: Fonts.body,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 40,
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { RaindropPin } from '../../components/RaindropPin';
import { ToiletCard } from '../../components/ToiletCard';
import { getToiletsByIds } from '../../api/toilets';
import { useAppStore } from '../../store/useAppStore';
import { Toilet } from '../../types';

export function SavedPlacesScreen() {
  const navigation = useNavigation<any>();
  const { savedToiletIds, nearbyToilets } = useAppStore();
  const [toilets, setToilets] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // Use cached nearby data where possible, fetch the rest.
        const cached = nearbyToilets.filter((t) => savedToiletIds.includes(t.id));
        const missing = savedToiletIds.filter((id) => !cached.find((t) => t.id === id));
        const fetched = missing.length ? await getToiletsByIds(missing) : [];
        if (mounted) setToilets([...cached, ...fetched]);
      } catch {
        if (mounted) setToilets(nearbyToilets.filter((t) => savedToiletIds.includes(t.id)));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [savedToiletIds, nearbyToilets]);

  function openDetail(t: Toilet) {
    navigation.navigate('MapTab', {
      screen: 'Detail',
      params: { toiletId: t.id, toilet: t },
    });
  }

  function goExplore() {
    navigation.navigate('MapTab');
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.tealDeep} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Saved places</Text>
      <FlatList
        data={toilets}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <RaindropPin color={Colors.teal} size={90} />
            <Text style={styles.emptyTitle}>No saved places yet</Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={goExplore}>
              <Text style={styles.exploreText}>Explore the map</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => <ToiletCard toilet={item} onPress={() => openDetail(item)} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.cream },
  title: {
    fontFamily: Fonts.brand,
    fontSize: 30,
    color: Colors.ink,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  list: { padding: 16, flexGrow: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontFamily: Fonts.bodyBold, fontSize: 18, color: Colors.ink, marginTop: 20 },
  exploreBtn: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.tealDeep,
    borderRadius: 14,
  },
  exploreText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.white },
});

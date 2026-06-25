import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, PinColors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { FilterChips } from '../../components/FilterChips';
import { ToiletCard } from '../../components/ToiletCard';
import { RaindropPin } from '../../components/RaindropPin';
import { getNearbyToilets } from '../../api/toilets';
import { useAppStore } from '../../store/useAppStore';
import { Toilet, FilterType } from '../../types';
import { MapStackParamList } from '../../navigation';

const FRANKFURT_REGION: Region = {
  latitude: 50.1109,
  longitude: 8.6821,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const { width } = Dimensions.get('window');

type Props = StackScreenProps<MapStackParamList, 'Map'>;

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
  return result;
}

export function MapScreen({ navigation }: Props) {
  const mapRef = useRef<MapView>(null);
  const { nearbyToilets, setNearbyToilets, activeFilter, setFilter } = useAppStore();
  const [region, setRegion] = useState<Region>(FRANKFURT_REGION);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadToilets = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getNearbyToilets(lat, lng, 2000);
        setNearbyToilets(data);
      } catch (e: any) {
        setError(e?.message ?? 'Could not load toilets.');
      } finally {
        setLoading(false);
      }
    },
    [setNearbyToilets]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      let lat = FRANKFURT_REGION.latitude;
      let lng = FRANKFURT_REGION.longitude;
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({});
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          if (mounted) {
            setUserLoc({ lat, lng });
            setRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.03, longitudeDelta: 0.03 });
          }
        }
      } catch {
        // fall back to Frankfurt
      }
      if (mounted) await loadToilets(lat, lng);
    })();
    return () => {
      mounted = false;
    };
  }, [loadToilets]);

  async function recenter() {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const req = await Location.requestForegroundPermissionsAsync();
        if (req.status !== 'granted') return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const r = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      };
      setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      mapRef.current?.animateToRegion(r, 500);
      await loadToilets(pos.coords.latitude, pos.coords.longitude);
    } catch {
      // ignore
    }
  }

  const filtered = applyFilter(nearbyToilets, activeFilter, search);
  const nearest = [...filtered].sort(
    (a, b) => (a.distance_meters ?? 0) - (b.distance_meters ?? 0)
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        showsUserLocation={!!userLoc}
        showsMyLocationButton={false}
      >
        {filtered.map((t) => (
          <Marker
            key={t.id}
            coordinate={{ latitude: t.lat, longitude: t.lng }}
            onPress={() => navigation.navigate('Detail', { toiletId: t.id, toilet: t })}
            tracksViewChanges={false}
          >
            <RaindropPin color={PinColors[t.type]} size={38} />
          </Marker>
        ))}
      </MapView>

      <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
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
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => navigation.navigate('List')}
          >
            <Text style={styles.toggleIcon}>☰</Text>
          </TouchableOpacity>
        </View>
        <FilterChips active={activeFilter} onChange={setFilter} />
      </SafeAreaView>

      <View style={styles.fabColumn}>
        <TouchableOpacity style={styles.fab} onPress={recenter}>
          <Text style={styles.fabIcon}>📍</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, styles.fabPrimary]}
          onPress={() => navigation.navigate('ReportToilet')}
        >
          <Text style={styles.fabPlus}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSheet}>
        {loading ? (
          <View style={styles.sheetLoading}>
            <ActivityIndicator color={Colors.tealDeep} />
          </View>
        ) : error ? (
          <Text style={styles.sheetError}>{error}</Text>
        ) : nearest.length === 0 ? (
          <Text style={styles.sheetEmpty}>No toilets match your filter nearby.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sheetScroll}
          >
            {nearest.slice(0, 5).map((t) => (
              <ToiletCard
                key={t.id}
                toilet={t}
                style={styles.sheetCard}
                onPress={() => navigation.navigate('Detail', { toiletId: t.id, toilet: t })}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  searchRow: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 8, gap: 8 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream2,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    shadowColor: Colors.ink,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
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
  toggleIcon: { fontSize: 20, color: Colors.white },
  fabColumn: { position: 'absolute', right: 16, bottom: 200, gap: 12 },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.cream2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.ink,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  fabPrimary: { backgroundColor: Colors.coral },
  fabIcon: { fontSize: 22 },
  fabPlus: { fontSize: 30, color: Colors.white, marginTop: -2 },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingBottom: 16,
    minHeight: 130,
    justifyContent: 'flex-end',
  },
  sheetScroll: { paddingHorizontal: 12, gap: 12 },
  sheetCard: { width: width * 0.78, marginRight: 12 },
  sheetLoading: { padding: 24, alignItems: 'center' },
  sheetError: {
    fontFamily: Fonts.body,
    color: Colors.coral,
    textAlign: 'center',
    padding: 16,
  },
  sheetEmpty: {
    fontFamily: Fonts.body,
    color: Colors.gray,
    textAlign: 'center',
    padding: 16,
  },
});

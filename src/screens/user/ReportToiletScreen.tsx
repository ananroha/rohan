import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, MapPressEvent } from 'react-native-maps';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { reportToilet } from '../../api/toilets';
import { useAppStore } from '../../store/useAppStore';
import { ToiletType } from '../../types';
import { MapStackParamList } from '../../navigation';

type Props = StackScreenProps<MapStackParamList, 'ReportToilet'>;

const FRANKFURT: Region = {
  latitude: 50.1109,
  longitude: 8.6821,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const TYPES: { key: ToiletType; label: string }[] = [
  { key: 'free', label: 'Free' },
  { key: 'paid', label: 'Paid' },
  { key: 'partner', label: 'Partner' },
];

export function ReportToiletScreen({ navigation }: Props) {
  const { user } = useAppStore();
  const [coord, setCoord] = useState({ lat: FRANKFURT.latitude, lng: FRANKFURT.longitude });
  const [type, setType] = useState<ToiletType>('free');
  const [name, setName] = useState('');
  const [wheelchair, setWheelchair] = useState(false);
  const [babyChange, setBabyChange] = useState(false);
  const [hours, setHours] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function onMapPress(e: MapPressEvent) {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setCoord({ lat: latitude, lng: longitude });
  }

  async function submit() {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to report a toilet.');
      return;
    }
    setSubmitting(true);
    try {
      await reportToilet({
        name: name.trim() || undefined,
        lat: coord.lat,
        lng: coord.lng,
        type,
        wheelchair,
        baby_change: babyChange,
        opening_hours: hours.trim() || undefined,
        created_by: user.id,
      });
      Alert.alert('Thank you!', 'Your toilet has been submitted for review.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report a toilet</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Location (tap the map)</Text>
        <View style={styles.mapWrap}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={FRANKFURT}
            onPress={onMapPress}
          >
            <Marker
              coordinate={{ latitude: coord.lat, longitude: coord.lng }}
              draggable
              onDragEnd={(e) =>
                setCoord({
                  lat: e.nativeEvent.coordinate.latitude,
                  lng: e.nativeEvent.coordinate.longitude,
                })
              }
            />
          </MapView>
        </View>
        <Text style={styles.coords}>
          {coord.lat.toFixed(5)}, {coord.lng.toFixed(5)}
        </Text>

        <Text style={styles.label}>Type</Text>
        <View style={styles.typeRow}>
          {TYPES.map((t) => {
            const active = type === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.typeChip, active && styles.typeChipActive]}
                onPress={() => setType(t.key)}
              >
                <Text style={[styles.typeText, active && styles.typeTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Name (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Hauptbahnhof WC"
          placeholderTextColor={Colors.gray}
          value={name}
          onChangeText={setName}
        />

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Wheelchair accessible</Text>
          <Switch
            value={wheelchair}
            onValueChange={setWheelchair}
            trackColor={{ true: Colors.tealDeep, false: Colors.grayLight }}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Baby change</Text>
          <Switch
            value={babyChange}
            onValueChange={setBabyChange}
            trackColor={{ true: Colors.tealDeep, false: Colors.grayLight }}
          />
        </View>

        <Text style={styles.label}>Opening hours (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Mo-Su 06:00-22:00"
          placeholderTextColor={Colors.gray}
          value={hours}
          onChangeText={setHours}
        />

        <TouchableOpacity
          style={[styles.submit, submitting && styles.submitDisabled]}
          disabled={submitting}
          onPress={submit}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>Submit</Text>
          )}
        </TouchableOpacity>
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
  back: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.tealDeep, width: 50 },
  headerTitle: { fontFamily: Fonts.brand, fontSize: 22, color: Colors.ink },
  scroll: { padding: 16, paddingBottom: 40 },
  label: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ink, marginTop: 18, marginBottom: 8 },
  mapWrap: { height: 200, borderRadius: 16, overflow: 'hidden' },
  map: { flex: 1 },
  coords: { fontFamily: Fonts.body, fontSize: 12, color: Colors.gray, marginTop: 6 },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.cream2,
    borderWidth: 1,
    borderColor: Colors.grayLight,
  },
  typeChipActive: { backgroundColor: Colors.tealDeep, borderColor: Colors.tealDeep },
  typeText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ink },
  typeTextActive: { color: Colors.white },
  input: {
    backgroundColor: Colors.cream2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.ink,
    borderWidth: 1,
    borderColor: Colors.grayLight,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  toggleLabel: { fontFamily: Fonts.body, fontSize: 15, color: Colors.ink },
  submit: {
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: Colors.coral,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { fontFamily: Fonts.bodyBold, fontSize: 17, color: Colors.white },
});

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
import { registerPartnerBusiness } from '../../api/partner';
import { useAppStore } from '../../store/useAppStore';
import { PartnerStackParamList } from '../../navigation';

type Props = StackScreenProps<PartnerStackParamList, 'RegisterBusiness'>;

const FRANKFURT: Region = {
  latitude: 50.1109,
  longitude: 8.6821,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export function RegisterBusinessScreen({ navigation }: Props) {
  const { user } = useAppStore();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('1.00');
  const [coord, setCoord] = useState({ lat: FRANKFURT.latitude, lng: FRANKFURT.longitude });
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
      Alert.alert('Sign in required', 'Please sign in.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter your business name.');
      return;
    }
    const priceCents = Math.round((parseFloat(price) || 0) * 100);
    setSubmitting(true);
    try {
      await registerPartnerBusiness(user.id, {
        name: name.trim(),
        lat: coord.lat,
        lng: coord.lng,
        price_cents: priceCents,
        wheelchair,
        baby_change: babyChange,
        opening_hours: hours.trim() || undefined,
      });
      navigation.reset({ index: 0, routes: [{ name: 'PartnerDashboard' }] });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not register your business.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Register your business</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Business name</Text>
        <TextInput
          style={styles.input}
          placeholder="Café Pepe"
          placeholderTextColor={Colors.gray}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Zeil 1, 60313 Frankfurt"
          placeholderTextColor={Colors.gray}
          value={address}
          onChangeText={setAddress}
        />

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

        <Text style={styles.label}>Price per use (€)</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={price}
          onChangeText={setPrice}
        />

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Wheelchair accessible</Text>
          <Switch
            value={wheelchair}
            onValueChange={setWheelchair}
            trackColor={{ true: Colors.coral, false: Colors.grayLight }}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Baby change</Text>
          <Switch
            value={babyChange}
            onValueChange={setBabyChange}
            trackColor={{ true: Colors.coral, false: Colors.grayLight }}
          />
        </View>

        <Text style={styles.label}>Opening hours</Text>
        <TextInput
          style={styles.input}
          placeholder="Mo-Su 08:00-20:00"
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
            <Text style={styles.submitText}>Register business</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontFamily: Fonts.brand, fontSize: 26, color: Colors.ink },
  scroll: { padding: 16, paddingBottom: 40 },
  label: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.ink, marginTop: 18, marginBottom: 8 },
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
  mapWrap: { height: 200, borderRadius: 16, overflow: 'hidden' },
  map: { flex: 1 },
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

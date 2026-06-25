import React, { useEffect, useState } from 'react';
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
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { getPartnerToilet, updatePartnerToilet } from '../../api/partner';
import { useAppStore } from '../../store/useAppStore';
import { Toilet } from '../../types';
import { PartnerStackParamList } from '../../navigation';

type Props = StackScreenProps<PartnerStackParamList, 'EditListing'>;

export function EditListingScreen({ navigation }: Props) {
  const { user } = useAppStore();
  const [toilet, setToilet] = useState<Toilet | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('1.00');
  const [wheelchair, setWheelchair] = useState(false);
  const [babyChange, setBabyChange] = useState(false);
  const [hours, setHours] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const t = await getPartnerToilet(user.id);
        if (mounted && t) {
          setToilet(t);
          setName(t.name ?? '');
          setPrice((t.price_cents / 100).toFixed(2));
          setWheelchair(!!t.wheelchair);
          setBabyChange(!!t.baby_change);
          setHours(t.opening_hours ?? '');
        }
      } catch (e: any) {
        Alert.alert('Error', e?.message ?? 'Could not load listing.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  async function save() {
    if (!toilet) return;
    setSaving(true);
    try {
      await updatePartnerToilet(toilet.id, {
        name: name.trim(),
        price_cents: Math.round((parseFloat(price) || 0) * 100),
        wheelchair,
        baby_change: babyChange,
        opening_hours: hours.trim(),
      });
      Alert.alert('Saved', 'Your listing has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.coral} />
      </View>
    );
  }

  if (!toilet) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.empty}>No listing to edit yet.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit listing</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Business name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

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
          value={hours}
          onChangeText={setHours}
          placeholder="Mo-Su 08:00-20:00"
          placeholderTextColor={Colors.gray}
        />

        <TouchableOpacity
          style={[styles.submit, saving && styles.submitDisabled]}
          disabled={saving}
          onPress={save}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitText}>Save changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.cream },
  empty: { fontFamily: Fonts.body, fontSize: 15, color: Colors.gray, marginBottom: 12 },
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

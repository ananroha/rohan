import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { signOut } from '../../api/auth';
import { useAppStore } from '../../store/useAppStore';
import { ProfileStackParamList } from '../../navigation';

type Props = StackScreenProps<ProfileStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const { clearAuth } = useAppStore();
  const [notifications, setNotifications] = useState(true);
  const [freshnessAlerts, setFreshnessAlerts] = useState(false);
  const [language, setLanguage] = useState<'en' | 'de'>('en');

  async function handleSignOut() {
    try {
      await signOut();
      clearAuth();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not sign out.');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.section}>Notifications</Text>
        <View style={styles.card}>
          <Row label="Push notifications">
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: Colors.tealDeep, false: Colors.grayLight }}
            />
          </Row>
          <Row label="Freshness alerts">
            <Switch
              value={freshnessAlerts}
              onValueChange={setFreshnessAlerts}
              trackColor={{ true: Colors.tealDeep, false: Colors.grayLight }}
            />
          </Row>
        </View>

        <Text style={styles.section}>Language</Text>
        <View style={styles.card}>
          <LangRow
            label="English"
            selected={language === 'en'}
            onPress={() => setLanguage('en')}
          />
          <LangRow
            label="Deutsch"
            selected={language === 'de'}
            onPress={() => setLanguage('de')}
          />
        </View>

        <Text style={styles.section}>About</Text>
        <View style={styles.card}>
          <LinkRow
            label="Privacy policy"
            onPress={() => Linking.openURL('https://wece.de/privacy')}
          />
          <LinkRow
            label="About WeCe"
            onPress={() => Alert.alert('WeCe', 'Find your Pepe place. Frankfurt and beyond.')}
          />
          <Row label="App version">
            <Text style={styles.version}>1.0.0</Text>
          </Row>
        </View>

        <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {children}
    </View>
  );
}

function LangRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
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
  section: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.gray, marginTop: 20, marginBottom: 8 },
  card: { backgroundColor: Colors.cream2, borderRadius: 16, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cream,
  },
  rowLabel: { fontFamily: Fonts.body, fontSize: 15, color: Colors.ink },
  version: { fontFamily: Fonts.body, fontSize: 15, color: Colors.gray },
  chevron: { fontSize: 22, color: Colors.gray },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOn: { borderColor: Colors.tealDeep },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.tealDeep },
  signOut: {
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.coral,
  },
  signOutText: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.coral },
});

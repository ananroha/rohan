import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { signOut, updateProfileRole } from '../../api/auth';
import { useAppStore } from '../../store/useAppStore';
import { ProfileStackParamList } from '../../navigation';

type Props = StackScreenProps<ProfileStackParamList, 'ProfileHome'>;

function initials(name: string | null, fallback: string): string {
  const source = name || fallback;
  return source
    .split(/[\s._]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function ProfileScreen({ navigation }: Props) {
  const { user, session, savedToiletIds, setUser, clearAuth } = useAppStore();
  const [switching, setSwitching] = useState(false);

  const email = session?.user?.email ?? '';
  const name = user?.display_name ?? email.split('@')[0] ?? 'User';

  async function handleSignOut() {
    try {
      await signOut();
      clearAuth();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not sign out.');
    }
  }

  async function switchToPartner() {
    if (!user) return;
    setSwitching(true);
    try {
      const updated = await updateProfileRole(user.id, 'partner');
      setUser(updated);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not switch view.');
    } finally {
      setSwitching(false);
    }
  }

  const menu: { label: string; onPress: () => void }[] = [
    { label: '💳  WeCe Credits', onPress: () => navigation.navigate('Credits') },
    { label: '❤️  Saved Places', onPress: () => navigation.navigate('SavedPlaces') },
    { label: '⚙️  Settings', onPress: () => navigation.navigate('Settings') },
    { label: '🏪  Switch to Partner View', onPress: switchToPartner },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.head}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user?.display_name ?? null, email || 'U')}</Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          {!!email && <Text style={styles.email}>{email}</Text>}
        </View>

        <View style={styles.stats}>
          <Stat value="0" label="Reports" />
          <Stat value="0" label="Confirmed" />
          <Stat value={String(savedToiletIds.length)} label="Saved" />
        </View>

        <View style={styles.menu}>
          {menu.map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.label.includes('Partner') && switching ? (
                <ActivityIndicator color={Colors.tealDeep} />
              ) : (
                <Text style={styles.menuChevron}>›</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scroll: { padding: 16, paddingBottom: 40 },
  head: { alignItems: 'center', marginTop: 16 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.tealDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontFamily: Fonts.bodyBold, fontSize: 32, color: Colors.white },
  name: { fontFamily: Fonts.brand, fontSize: 28, color: Colors.ink, marginTop: 14 },
  email: { fontFamily: Fonts.body, fontSize: 14, color: Colors.gray, marginTop: 2 },
  stats: {
    flexDirection: 'row',
    backgroundColor: Colors.cream2,
    borderRadius: 18,
    paddingVertical: 18,
    marginTop: 24,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: Fonts.bodyBold, fontSize: 22, color: Colors.tealDeep },
  statLabel: { fontFamily: Fonts.body, fontSize: 12, color: Colors.gray, marginTop: 4 },
  menu: { marginTop: 24, backgroundColor: Colors.cream2, borderRadius: 18, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cream,
  },
  menuLabel: { fontFamily: Fonts.body, fontSize: 16, color: Colors.ink },
  menuChevron: { fontSize: 22, color: Colors.gray },
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

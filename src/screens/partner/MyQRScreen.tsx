import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { getPartnerQR } from '../../api/partner';
import { useAppStore } from '../../store/useAppStore';
import { PartnerStackParamList } from '../../navigation';

type Props = StackScreenProps<PartnerStackParamList, 'MyQR'>;

export function MyQRScreen({ navigation }: Props) {
  const { user } = useAppStore();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const qr = await getPartnerQR(user.id);
        if (mounted) setToken(qr.qr_token);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? 'Could not load your QR code.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  async function shareToken() {
    if (!token) return;
    try {
      await Share.share({
        message: `Scan to enter with WeCe: wece://qr/${token}`,
      });
    } catch {
      Alert.alert('Error', 'Could not open the share sheet.');
    }
  }

  const qrValue = token ? `wece://qr/${token}` : '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My QR</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.coral} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : token ? (
          <>
            <View style={styles.qrCard}>
              <QRCode value={qrValue} size={220} color={Colors.ink} backgroundColor={Colors.white} />
            </View>
            <Text style={styles.token}>{token}</Text>
            <Text style={styles.instruction}>Print and place at your entrance.</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.button} onPress={shareToken}>
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={shareToken}>
                <Text style={styles.buttonOutlineText}>Print</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.error}>No QR code found. Register your business first.</Text>
        )}
      </View>
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
  back: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.coral, width: 50 },
  headerTitle: { fontFamily: Fonts.brand, fontSize: 22, color: Colors.ink },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  qrCard: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 24,
    shadowColor: Colors.ink,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  token: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: Colors.gray,
    marginTop: 20,
  },
  instruction: { fontFamily: Fonts.body, fontSize: 14, color: Colors.gray, marginTop: 8 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 28 },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    backgroundColor: Colors.coral,
  },
  buttonText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.white },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.coral },
  buttonOutlineText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.coral },
  error: { fontFamily: Fonts.body, fontSize: 15, color: Colors.coral, textAlign: 'center' },
});

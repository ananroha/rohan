import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { resolveQRToken } from '../../api/partner';
import { MapStackParamList } from '../../navigation';

type Props = StackScreenProps<MapStackParamList, 'Scan'>;

export function ScanScreen({ navigation }: Props) {
  const [permission, setPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setPermission(status === 'granted');
    })();
  }, []);

  async function handleScanned({ data }: BarCodeScannerResult) {
    if (scanned || resolving) return;
    setScanned(true);
    setResolving(true);
    try {
      // QR payload may be a raw token or a wece://qr/<token> URL.
      const token = data.includes('/') ? data.split('/').pop()! : data;
      const qr = await resolveQRToken(token);
      const toilet = (qr as any).toilets;
      const partner = (qr as any).profiles;
      navigation.replace('PaymentSheet', {
        toiletId: qr.toilet_id,
        partnerId: qr.partner_id,
        partnerName: toilet?.name ?? partner?.display_name ?? 'Partner',
        amountCents: toilet?.price_cents || 100,
      });
    } catch (e: any) {
      Alert.alert('Invalid code', e?.message ?? 'This QR code is not a valid WeCe sticker.', [
        { text: 'Try again', onPress: () => setScanned(false) },
      ]);
    } finally {
      setResolving(false);
    }
  }

  if (permission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.tealDeep} />
      </View>
    );
  }

  if (permission === false) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.permTitle}>Camera access needed</Text>
        <Text style={styles.permBody}>
          WeCe needs your camera to scan partner QR stickers.
        </Text>
        <TouchableOpacity style={styles.cancelInline} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelInlineText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleScanned}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.overlay}>
        <TouchableOpacity style={styles.cancel} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.frameWrap}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {resolving && <ActivityIndicator color={Colors.white} size="large" />}
          </View>
          <Text style={styles.instruction}>Scan the sticker QR code</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const FRAME = 240;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.ink },
  center: {
    flex: 1,
    backgroundColor: Colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permTitle: { fontFamily: Fonts.brand, fontSize: 26, color: Colors.white, marginBottom: 12 },
  permBody: { fontFamily: Fonts.body, fontSize: 15, color: Colors.grayLight, textAlign: 'center' },
  cancelInline: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.tealDeep,
    borderRadius: 12,
  },
  cancelInlineText: { fontFamily: Fonts.bodyBold, color: Colors.white },
  overlay: { flex: 1 },
  cancel: {
    margin: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: { fontSize: 20, color: Colors.white },
  frameWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -40 },
  frame: {
    width: FRAME,
    height: FRAME,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: Colors.teal,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 8 },
  instruction: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    color: Colors.white,
    marginTop: 32,
  },
});

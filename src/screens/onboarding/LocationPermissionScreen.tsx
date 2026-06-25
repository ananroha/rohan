import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { RaindropPin } from '../../components/RaindropPin';
import { OnboardingStackParamList } from '../../navigation';

type Props = StackScreenProps<OnboardingStackParamList, 'LocationPermission'>;

export function LocationPermissionScreen(_props: Props) {
  const [loading, setLoading] = useState(false);

  async function requestLocation() {
    setLoading(true);
    try {
      await Location.requestForegroundPermissionsAsync();
    } catch {
      // proceed regardless; MapScreen falls back to Frankfurt center
    } finally {
      setLoading(false);
    }
    // RootNavigator switches to the main app once session + profile are set.
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <RaindropPin color={Colors.teal} size={140} />
        <Text style={styles.title}>Allow location access</Text>
        <Text style={styles.body}>
          WeCe uses your location to show nearby toilets. We never share or store your location.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
          activeOpacity={0.85}
          onPress={requestLocation}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Allow location</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontFamily: Fonts.brand,
    fontSize: 32,
    color: Colors.ink,
    marginTop: 32,
    textAlign: 'center',
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 12,
  },
  footer: { paddingHorizontal: 24, paddingBottom: 24 },
  button: {
    backgroundColor: Colors.tealDeep,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontFamily: Fonts.bodyBold, fontSize: 18, color: Colors.white },
});

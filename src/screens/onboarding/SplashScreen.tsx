import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { RaindropPin } from '../../components/RaindropPin';
import { OnboardingStackParamList } from '../../navigation';

const { width } = Dimensions.get('window');

type Props = StackScreenProps<OnboardingStackParamList, 'Splash'>;

const DROPS = [
  { top: 80, left: 30, size: 26 },
  { top: 140, left: width - 70, size: 34 },
  { top: 220, left: 60, size: 18 },
  { top: 300, left: width - 90, size: 22 },
  { top: 380, left: 40, size: 30 },
];

export function SplashScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      {DROPS.map((d, i) => (
        <View key={i} style={[styles.drop, { top: d.top, left: d.left }]}>
          <RaindropPin color={Colors.tealSoft} size={d.size} />
        </View>
      ))}

      <View style={styles.center}>
        <View style={styles.oval}>
          <Text style={styles.brand}>WeCe</Text>
        </View>
        <Text style={styles.tagline}>find your Pepe place</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('IntroCarousel')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.tealDeep,
  },
  drop: {
    position: 'absolute',
    opacity: 0.6,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  oval: {
    width: 240,
    height: 160,
    borderRadius: 120,
    backgroundColor: Colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    fontFamily: Fonts.brand,
    fontSize: 56,
    color: Colors.ink,
  },
  tagline: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.cream,
    marginTop: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: Colors.coral,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 18,
    color: Colors.white,
  },
});

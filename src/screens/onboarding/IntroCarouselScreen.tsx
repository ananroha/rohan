import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { RaindropPin } from '../../components/RaindropPin';
import { OnboardingStackParamList } from '../../navigation';

const { width } = Dimensions.get('window');

type Props = StackScreenProps<OnboardingStackParamList, 'IntroCarousel'>;

interface Slide {
  key: string;
  title: string;
  body: string;
  render: () => React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    key: '1',
    title: 'Gotta go?',
    body: 'Find the nearest free or paid toilet in seconds.',
    render: () => <RaindropPin color={Colors.teal} size={140} />,
  },
  {
    key: '2',
    title: 'Always fresh',
    body: "Community-confirmed locations. Know it's open before you go.",
    render: () => (
      <View style={[styles.circle, { backgroundColor: Colors.tealDeep }]}>
        <Text style={styles.bigEmoji}>✓</Text>
      </View>
    ),
  },
  {
    key: '3',
    title: "1€ and you're in",
    body: 'Partner cafés welcome you for just €1 — scan their sticker.',
    render: () => (
      <View style={[styles.circle, { backgroundColor: Colors.coral }]}>
        <Text style={styles.euroText}>€1</Text>
      </View>
    ),
  },
];

export function IntroCarouselScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
      setIndex(index + 1);
    } else {
      navigation.navigate('RoleSelect');
    }
  };

  const isLast = index === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skip} onPress={() => navigation.navigate('RoleSelect')}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.illustration}>{item.render()}</View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === index ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={goNext}>
          <Text style={styles.buttonText}>{isLast ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  skip: {
    alignSelf: 'flex-end',
    padding: 16,
  },
  skipText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.gray,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  illustration: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigEmoji: {
    fontSize: 72,
    color: Colors.white,
  },
  euroText: {
    fontFamily: Fonts.brand,
    fontSize: 64,
    color: Colors.white,
  },
  title: {
    fontFamily: Fonts.brand,
    fontSize: 36,
    color: Colors.ink,
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: Colors.tealDeep,
    width: 20,
  },
  dotInactive: {
    backgroundColor: Colors.grayLight,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  button: {
    backgroundColor: Colors.tealDeep,
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

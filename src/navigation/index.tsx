import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Session } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';
import { getProfile } from '../api/auth';
import { useAppStore } from '../store/useAppStore';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { Toilet } from '../types';

// Onboarding
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { IntroCarouselScreen } from '../screens/onboarding/IntroCarouselScreen';
import { RoleSelectScreen } from '../screens/onboarding/RoleSelectScreen';
import { AuthScreen } from '../screens/onboarding/AuthScreen';
import { LocationPermissionScreen } from '../screens/onboarding/LocationPermissionScreen';

// User
import { MapScreen } from '../screens/user/MapScreen';
import { ListScreen } from '../screens/user/ListScreen';
import { DetailScreen } from '../screens/user/DetailScreen';
import { ScanScreen } from '../screens/user/ScanScreen';
import { PaymentSheet } from '../screens/user/PaymentSheet';
import { AccessConfirmedScreen } from '../screens/user/AccessConfirmedScreen';
import { ReportToiletScreen } from '../screens/user/ReportToiletScreen';
import { CreditsScreen } from '../screens/user/CreditsScreen';
import { SavedPlacesScreen } from '../screens/user/SavedPlacesScreen';
import { ProfileScreen } from '../screens/user/ProfileScreen';
import { SettingsScreen } from '../screens/user/SettingsScreen';

// Partner
import { RegisterBusinessScreen } from '../screens/partner/RegisterBusinessScreen';
import { PartnerDashboardScreen } from '../screens/partner/PartnerDashboardScreen';
import { PartnerAnalyticsScreen } from '../screens/partner/PartnerAnalyticsScreen';
import { EditListingScreen } from '../screens/partner/EditListingScreen';
import { MyQRScreen } from '../screens/partner/MyQRScreen';

export type OnboardingStackParamList = {
  Splash: undefined;
  IntroCarousel: undefined;
  RoleSelect: undefined;
  Auth: { role: 'user' | 'partner' };
  LocationPermission: undefined;
};

export type MapStackParamList = {
  Map: undefined;
  List: undefined;
  Detail: { toiletId: string; toilet?: Toilet };
  Scan: undefined;
  PaymentSheet: { toiletId: string; partnerId: string; partnerName: string; amountCents: number };
  AccessConfirmed: { partnerName: string; amountCents: number };
  ReportToilet: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Credits: undefined;
  Settings: undefined;
  SavedPlaces: undefined;
};

export type MainTabParamList = {
  MapTab: undefined;
  SavedTab: undefined;
  ProfileTab: undefined;
};

export type PartnerStackParamList = {
  PartnerDashboard: undefined;
  PartnerAnalytics: undefined;
  EditListing: undefined;
  MyQR: undefined;
  RegisterBusiness: undefined;
};

const OnboardingStack = createStackNavigator<OnboardingStackParamList>();
const MapStack = createStackNavigator<MapStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const PartnerStack = createStackNavigator<PartnerStackParamList>();

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="Splash" component={SplashScreen} />
      <OnboardingStack.Screen name="IntroCarousel" component={IntroCarouselScreen} />
      <OnboardingStack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <OnboardingStack.Screen name="Auth" component={AuthScreen} />
      <OnboardingStack.Screen name="LocationPermission" component={LocationPermissionScreen} />
    </OnboardingStack.Navigator>
  );
}

function MapNavigator() {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="Map" component={MapScreen} />
      <MapStack.Screen name="List" component={ListScreen} />
      <MapStack.Screen name="Detail" component={DetailScreen} />
      <MapStack.Screen name="Scan" component={ScanScreen} />
      <MapStack.Screen
        name="PaymentSheet"
        component={PaymentSheet}
        options={{ presentation: 'modal' }}
      />
      <MapStack.Screen name="AccessConfirmed" component={AccessConfirmedScreen} />
      <MapStack.Screen name="ReportToilet" component={ReportToiletScreen} />
    </MapStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="Credits" component={CreditsScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="SavedPlaces" component={SavedPlacesScreen} />
    </ProfileStack.Navigator>
  );
}

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{label}</Text>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tealDeep,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: {
          backgroundColor: Colors.cream2,
          borderTopColor: Colors.grayLight,
        },
        tabBarLabelStyle: { fontFamily: Fonts.body, fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="MapTab"
        component={MapNavigator}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ focused }) => <TabIcon label="📍" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedPlacesScreen}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ focused }) => <TabIcon label="❤️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon label="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function PartnerNavigator() {
  return (
    <PartnerStack.Navigator screenOptions={{ headerShown: false }}>
      <PartnerStack.Screen name="PartnerDashboard" component={PartnerDashboardScreen} />
      <PartnerStack.Screen name="PartnerAnalytics" component={PartnerAnalyticsScreen} />
      <PartnerStack.Screen name="EditListing" component={EditListingScreen} />
      <PartnerStack.Screen name="MyQR" component={MyQRScreen} />
      <PartnerStack.Screen name="RegisterBusiness" component={RegisterBusinessScreen} />
    </PartnerStack.Navigator>
  );
}

export function RootNavigator() {
  const { session, user, setSession, setUser } = useAppStore();
  const [loading, setLoading] = useState(true);

  async function loadProfile(activeSession: Session | null) {
    if (activeSession?.user) {
      try {
        const profile = await getProfile(activeSession.user.id);
        setUser(profile);
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      await loadProfile(data.session);
      if (mounted) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      await loadProfile(newSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.tealDeep} />
        <Text style={styles.loadingText}>WeCe</Text>
      </View>
    );
  }

  let content: React.ReactNode;
  if (!session || !user) {
    content = <OnboardingNavigator />;
  } else if (user.role === 'partner') {
    content = <PartnerNavigator />;
  } else {
    content = <MainTabNavigator />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {content}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.tealDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Fonts.brand,
    fontSize: 36,
    color: Colors.cream,
    marginTop: 16,
  },
});

import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { AppIcon, IconName } from '../../src/components/ui/AppIcon';
import { useBookingStore } from '../../src/store/useBookingStore';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors, fontFamilies, fontSizes, isDark } = useTheme();
  const activeBooking = useBookingStore((s) => s.activeBooking);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? colors.primary : '#171A18',
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + Math.max(insets.bottom, 12),
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamilies.semiBold,
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIconContainer focused={focused} activeColor={colors.primary}>
              <AppIcon
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={color as string}
              />
            </TabIconContainer>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabIconContainer focused={focused} activeColor={colors.primary}>
              <AppIcon
                name={focused ? 'map' : 'map-outline'}
                size={22}
                color={color as string}
              />
            </TabIconContainer>
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarBadge: activeBooking ? 1 : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.primary,
            color: colors.primaryForeground,
            fontSize: 10,
            fontFamily: fontFamilies.bold,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabIconContainer focused={focused} activeColor={colors.primary}>
              <AppIcon
                name={focused ? 'calendar' : 'calendar-outline'}
                size={22}
                color={color as string}
              />
            </TabIconContainer>
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, focused }) => (
            <TabIconContainer focused={focused} activeColor={colors.primary}>
              <AppIcon
                name={focused ? 'wallet' : 'wallet-outline'}
                size={22}
                color={color as string}
              />
            </TabIconContainer>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIconContainer focused={focused} activeColor={colors.primary}>
              <AppIcon
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={color as string}
              />
            </TabIconContainer>
          ),
        }}
      />
    </Tabs>
  );
}

function TabIconContainer({
  children,
  focused,
  activeColor,
}: {
  children: React.ReactNode;
  focused: boolean;
  activeColor: string;
}) {
  return (
    <View style={styles.iconContainer}>
      {children}
      {focused && (
        <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 28,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 14,
    height: 3,
    borderRadius: 2,
  },
});

import { Link, Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../src/theme';
import { AppText } from '../src/components/ui/AppText';
import { AppButton } from '../src/components/ui/AppButton';

export default function NotFoundScreen() {
  const { colors, spacing } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found', headerShown: true }} />
      <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.xl }]}>
        <AppText variant="h2" align="center">Screen Doesn't Exist</AppText>
        <AppText variant="body" color={colors.secondaryText} align="center" style={{ marginTop: spacing.sm }}>
          The requested screen route could not be found.
        </AppText>

        <Link href="/(tabs)" asChild style={{ marginTop: spacing.xl }}>
          <AppButton title="Return to Home" onPress={() => {}} variant="primary" />
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

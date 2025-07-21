import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(recupero)/recupero" options={{ headerShown: false }} />
      <Stack.Screen name="(recupero)/code" options={{ headerShown: false }} />
      <Stack.Screen name="(recupero)/newPass" options={{ headerShown: false }} />
    </Stack>
  );
}
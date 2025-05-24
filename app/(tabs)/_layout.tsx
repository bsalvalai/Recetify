import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}
//Icono del home = "home", icono del mas = "plus", usuario = "user"
//No estaria cargando el icono del usuario

//Hay que configurar el tema de los COLORES y tambien el tema de la FUENTE
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].tabBar
        }
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={Colors[colorScheme ?? 'light'].icon} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
          headerTitle: "Inicio",
          headerTitleAlign: "center"
        }}
      />


      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <TabBarIcon name="plus" color={Colors[colorScheme ?? 'light'].icon} />,
        }}
      />

      <Tabs.Screen
        name="user"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={Colors[colorScheme ?? 'light'].icon} />,
        }}
      />

    </Tabs>
  );
}

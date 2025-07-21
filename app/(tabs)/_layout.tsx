import React, { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { View } from '@/components/Themed';
import { useAuth } from '@/components/AuthContext';
import LoginRequiredModal from '@/components/LoginRequiredModal';

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
  const { isGuest } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const handleTabPress = (tabName: string) => {
    if (isGuest && (tabName === 'create' || tabName === 'user')) {
      setModalVisible(true);
      return false; // Prevent navigation
    }
    return true; // Allow navigation
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          // Disable the static render of the header on web
          // to prevent a hydration error in React Navigation v6.
          headerShown: useClientOnlyValue(false, true),
          headerStyle: {backgroundColor: Colors.light.background},
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].tabBar
          },
          headerShadowVisible: false,
        }}>

        <Tabs.Screen
          name="index"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={Colors[colorScheme ?? 'light'].icon} />,
            headerTitle: "Inicio",
            headerTitleAlign: "center",
            headerTitleStyle:{
              fontSize: 20,
              fontWeight: 'regular',
              color: Colors.light.text
            }
          }}
        />

        <Tabs.Screen
          name="create"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <TabBarIcon name="plus" color={Colors[colorScheme ?? 'light'].icon} />,
            headerTitle: "Crear Receta",
            headerTitleAlign: "center",
            headerTitleStyle:{
              fontSize: 20,
              fontWeight: 'regular',
              color: Colors.light.text
            }
          }}
          listeners={{
            tabPress: (e) => {
              if (!handleTabPress('create')) {
                e.preventDefault();
              }
            },
          }}
        />

        <Tabs.Screen
          name="user"
          options={{
            title: '',
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={Colors[colorScheme ?? 'light'].icon} />,
            headerTitle: "Perfil",
            headerTitleAlign: "center",
            headerTitleStyle:{
              fontSize: 20,
              fontWeight: 'regular',
              color: Colors.light.text
            }
          }}
          listeners={{
            tabPress: (e) => {
              if (!handleTabPress('user')) {
                e.preventDefault();
              }
            },
          }}
        />

      </Tabs>
      
      <LoginRequiredModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

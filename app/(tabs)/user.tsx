import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { useColorScheme } from '@/components/useColorScheme';
import RecipeCard from '@/components/RecipeCard';

export default function UserScreen() {
  const colorScheme = useColorScheme();

  const profileImageSource = require('../../assets/images/profile.jpg');

  const styles = styling(colorScheme || 'light');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}></Text>
        <TouchableOpacity style={styles.settingsButton}>
          <FontAwesome name="gear" size={26} color={styles.settingsIcon.color} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Image source={profileImageSource} style={styles.profileImage} />
        <Text style={styles.username}>Igonzalezr02</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome name="heart" size={20} color={styles.actionButtonIcon.color} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome name="pencil" size={20} color={styles.actionButtonIcon.color} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.recipesSection}>
        <RecipeCard/>
        <RecipeCard/>
      </View>
    </ScrollView>
  );
}

const styling = (colorScheme: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  settingsButton: {
    padding: 5,
  },
  settingsIcon: {
    color: '#111',
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 70,
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: '500',
    color: '#222',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  actionButtonIcon: {
    color: '#111',
  },
  recipesSection: {
    paddingHorizontal: 10,
  },
});
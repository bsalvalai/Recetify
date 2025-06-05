import React from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { useColorScheme } from '@/components/useColorScheme';
import RecipeCard from '@/components/RecipeCard';

export default function UserScreen() {
  const colorScheme = useColorScheme();

  const profileImageSource = require('../../assets/images/profile.jpg');

  const styles = styling(colorScheme || 'light');

  const username = 'Igonzalezr02';
  return (
    <ScrollView style={styles.container}>
      <View style={[{backgroundColor: "#000"},{width:"100%"},{height: 1}]}></View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}></Text>
        <TouchableOpacity style={styles.settingsButton}>
          <FontAwesome name="gear" size={24} color={styles.settingsIcon.color} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Image source={profileImageSource} style={styles.profileImage} />
        <Text style={styles.username}>{username}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome name="heart" size={24} color={styles.actionButtonIcon.color} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <FontAwesome name="pencil" size={24} color={styles.actionButtonIcon.color} />
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
    backgroundColor: '#F0F0F0',
    //padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    //paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  settingsButton: {
    paddingTop: 15,
    paddingRight: 16,
  },
  settingsIcon: {
    color: '#111',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,    
  },
  actionButton: {
    //backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  actionButtonIcon: {
    color: '#111',
  },
  recipesSection: {
    //paddingHorizontal: 10,
  },
});
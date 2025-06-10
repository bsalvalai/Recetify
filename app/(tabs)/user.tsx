import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/components/useColorScheme';
import RecipeCard from '@/components/RecipeCard';
import RecipeCardNotPublished from '@/components/RecipeCardNotPublished';

const styling = (colorScheme: string, showLikedRecipes: boolean, showUnpublishedRecipes: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
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
    alignItems: 'center',
    marginTop: 10,
    width: '50%',
    justifyContent: 'space-around',
  },
  actionButton: {
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  actionButtonIcon: {
    color: '#111',
  },
  recipesSection: {
    //paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  underline: {
    backgroundColor: '#111',
    height: 3,
    width: '100%',
    marginTop: 5,
  }
});

export default function UserScreen() {
  const colorScheme = useColorScheme();
  const profileImageSource = require('../../assets/images/profile.jpg');
  const [showLikedRecipes, setShowLikedRecipes] = useState(true);
  const [showUnpublishedRecipes, setShowUnpublishedRecipes] = useState(false);
  const styles = styling(colorScheme || 'light', showLikedRecipes, showUnpublishedRecipes);
  const username = 'Igonzalezr02';
  const router = useRouter();

  const toggleLikedRecipes = () => {
    if (!showLikedRecipes) {
      setShowLikedRecipes(true);
      setShowUnpublishedRecipes(false);
    }
  };

  const toggleUnpublishedRecipes = () => {
    if (!showUnpublishedRecipes) {
      setShowUnpublishedRecipes(true);
      setShowLikedRecipes(false);
    }
  };

  return (

    
    <View style={styles.container}>
      <View style={[{backgroundColor: "#000"},{width:"100%"},{height: 1}]}></View>
      <ScrollView>
        <View style={styles.header}>
        <Text style={styles.headerTitle}></Text>
        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
          <FontAwesome name="gear" size={24} color={styles.settingsIcon.color} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Image source={profileImageSource} style={styles.profileImage} />
        <Text style={styles.username}>{username}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={toggleLikedRecipes}>
            <FontAwesome name="heart" size={24} color={styles.actionButtonIcon.color} />
            {showLikedRecipes && <View style={styles.underline} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={toggleUnpublishedRecipes}>
            <FontAwesome name="pencil" size={24} color={styles.actionButtonIcon.color} />
            {showUnpublishedRecipes && <View style={styles.underline} />}
          </TouchableOpacity>
        </View>
      </View>

      {showLikedRecipes && (
        <View style={styles.recipesSection}>
          <RecipeCard/>
          <RecipeCard/>
        </View>
      )}

      {showUnpublishedRecipes && (
        <View style={styles.recipesSection}>
          <RecipeCardNotPublished/>
          <RecipeCardNotPublished/>
        </View>
      )}
      </ScrollView>
    </View>
  );
}
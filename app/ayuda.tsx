import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AyudaScreen() {
  const router = useRouter();
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const toggleQuestion = (questionIndex: number) => {
    setExpandedQuestion(expandedQuestion === questionIndex ? null : questionIndex);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayuda</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.separator} />

      <View style={styles.content}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            style={styles.questionButton} 
            onPress={() => toggleQuestion(1)}
          >
            <Text style={styles.questionText}>Como puedo crear una receta?</Text>
            <FontAwesome 
              name={expandedQuestion === 1 ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#111" 
            />
          </TouchableOpacity>
          
          {expandedQuestion === 1 && (
            <View style={styles.answerContainer}>
              <Text style={styles.answerText}>
                Presionando el "+" en la barra de abajo, vas a acceder a la sección donde vas a poder elegir el nombre de la receta, sacarle una foto para la portada, agregar ingredientes e ir describiendo el paso por paso de la receta, pudiendo agregar imágenes y vídeos que sirvan para complementar la claridad de la receta.
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.questionButton} 
            onPress={() => toggleQuestion(2)}
          >
            <Text style={styles.questionText}>Como busco una receta?</Text>
            <FontAwesome 
              name={expandedQuestion === 2 ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#111" 
            />
          </TouchableOpacity>
          
          {expandedQuestion === 2 && (
            <View style={styles.answerContainer}>
              <Text style={styles.answerText}>
                Puedes buscar recetas utilizando la barra de búsqueda en la pantalla principal. También puedes filtrar por categorías o ingredientes específicos.
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.questionButton} 
            onPress={() => toggleQuestion(3)}
          >
            <Text style={styles.questionText}>Como guardo una receta que me gusto?</Text>
            <FontAwesome 
              name={expandedQuestion === 3 ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#111" 
            />
          </TouchableOpacity>
          
          {expandedQuestion === 3 && (
            <View style={styles.answerContainer}>
              <Text style={styles.answerText}>
                Para guardar una receta, simplemente toca el ícono de corazón en la receta que te guste. Podrás encontrar todas tus recetas guardadas en tu perfil.
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.questionButton} 
            onPress={() => toggleQuestion(4)}
          >
            <Text style={styles.questionText}>Si elimino mi cuenta, la puedo recuperar?</Text>
            <FontAwesome 
              name={expandedQuestion === 4 ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#111" 
            />
          </TouchableOpacity>
          
          {expandedQuestion === 4 && (
            <View style={styles.answerContainer}>
              <Text style={styles.answerText}>
                Una vez que elimines tu cuenta, no podrás recuperarla. Asegúrate de estar seguro antes de proceder con la eliminación.
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.questionButton} 
            onPress={() => toggleQuestion(5)}
          >
            <Text style={styles.questionText}>Puedo eliminar recetas que hice?</Text>
            <FontAwesome 
              name={expandedQuestion === 5 ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#111" 
            />
          </TouchableOpacity>
          
          {expandedQuestion === 5 && (
            <View style={styles.answerContainer}>
              <Text style={styles.answerText}>
                Sí, puedes eliminar las recetas que has creado. Ve a tu perfil, selecciona la receta y utiliza la opción de eliminar.
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.questionButton} 
            onPress={() => toggleQuestion(6)}
          >
            <Text style={styles.questionText}>Como cambio mi clave de ingreso?</Text>
            <FontAwesome 
              name={expandedQuestion === 6 ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#111" 
            />
          </TouchableOpacity>
          
          {expandedQuestion === 6 && (
            <View style={styles.answerContainer}>
              <Text style={styles.answerText}>
                Para cambiar tu clave, ve a Configuración en tu perfil y selecciona "Cambiar clave". Necesitarás ingresar tu clave actual y la nueva clave.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 24,
  },
  separator: {
    height: 1,
    backgroundColor: '#CCC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  questionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 25,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D32F2F',
  },
  questionText: {
    fontSize: 16,
    color: '#111',
    fontWeight: 'bold',
    flex: 1,
  },
  answerContainer: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
  },
  answerText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
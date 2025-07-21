// components/CommentCard.tsx
import { StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// 1. Definimos la interfaz de las props que CommentCard recibirá
interface CommentCardProps {
  comment: {
    id: string; // Un ID único para la key de la FlatList
    user: {
      username: string;
      avatarUrl: string;
    };
    text: string;
    rating: number;
  };
}

export default function CommentCard({ comment }: CommentCardProps) { // 2. Recibimos la prop 'comment'

  // El truncado del texto se manejará con numberOfLines directamente en el Text
  // const MAX_CHARACTERS = 100; // Define tu límite de caracteres
  // const displayedText = comment.text.length > MAX_CHARACTERS
  //   ? comment.text.slice(0, MAX_CHARACTERS)
  //   : comment.text;

  // Determinar el icono de estrella (llena o vacía) basado en el rating
  // Si el mockup muestra siempre la estrella vacía y solo cambia el número, ignora 'isStarred'.
  // Si la estrella se llena según el rating (ej. rating >= 4), puedes usarlo.
  const isStarred = comment.rating >= 4; // Ejemplo: estrella llena si el rating es 4 o 5

  return (
    <View style={styles.container}>

      <View style={styles.userRowDetails}>
        <View style={styles.userDetails}>
          <View style={styles.imageWrapper}>
            {/* Usamos comment.user.avatarUrl de las props */}
            <Image source={{ uri: comment.user.avatarUrl }} style={styles.recipeImage} />
          </View>
          {/* Usamos comment.user.username de las props */}
          <Text style={styles.userText}>{comment.user.username}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{comment.rating}</Text>
          {/* Si quieres que SIEMPRE sea el contorno, sin importar el rating: */}
          <FontAwesome name={'star-o'} size={24} />
          {/* O si el mockup implica que el contorno sea negro como en tu código original: */}
          {/* <FontAwesome name={'star-o'} color={"#000"} size={24} /> */}
        </View>
      </View>

      <View style={styles.commentContentContainer}> {/* Renombrado para claridad */}
        <Text
          style={styles.commentText}
          numberOfLines={3} // Esto truncará el texto con '...' si excede 3 líneas
        >
          {/* Usamos comment.text de las props */}
          {comment.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Ya no lo centramos verticalmente si queremos altura variable
    // justifyContent: 'center',
    backgroundColor: Colors.light.cardBackground,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    borderRadius: 10,
    height: 120, // Eliminado o comentado para permitir que la altura se ajuste al contenido
    // MinHeight es útil si quieres un tamaño mínimo pero que se expanda
    //minHeight: 120,
    marginHorizontal: 16,
    marginVertical: 8, // Reduce un poco el margen vertical para que las tarjetas estén más cerca
    flexDirection: 'column', // Los elementos internos se apilan verticalmente
    alignSelf: 'stretch',
    paddingHorizontal: 10, // Aumenta un poco el padding horizontal
    paddingVertical: 5, // Padding vertical interno
  },
  userRowDetails: {
    flexDirection: 'row',
    alignItems: 'center', // Alinea verticalmente el avatar, nombre y rating
    justifyContent: 'space-between', // Usuario a la izquierda, rating a la derecha
    backgroundColor: 'transparent', // Para que el color de fondo de la tarjeta sea visible
    marginBottom: 5, // Espacio entre esta fila y el texto del comentario
  },
  userDetails: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1, // Permite que el texto del usuario se encoja si el rating es muy largo
  },
  imageWrapper: {
    width: 40, // Aumentado ligeramente para el mockup
    height: 40,
    borderRadius: 20, // Hace el contenedor circular
    overflow: 'hidden',
    marginRight: 10, // Espacio entre imagen y texto de usuario
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userText: {
    // marginLeft: 10, // Ya se maneja con marginRight en imageWrapper
    fontSize: 14, // Aumentado ligeramente para el mockup
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'flex-end', // Esto ya lo maneja 'space-between' en userRowDetails
    backgroundColor: 'transparent',
    // width: 65, // Esto puede ser muy restrictivo, a menos que sea un valor muy específico
    // height: 27, // Lo mismo, quizás es mejor dejarlo flotar
  },
  ratingText: {
    fontSize: 20,
    marginRight: 5,
    color: Colors.light.text,
  },
  commentContentContainer: { // Renombrado de detailsContainer/titleContainer para mayor claridad
    // flex: 1, // No es necesario si es una sola sección de texto
    backgroundColor: Colors.light.background, // Mantenemos el fondo de la tarjeta
    // height: 58, // Eliminado para que el texto se ajuste con numberOfLines
    borderRadius: 10, // Bordes redondeados para el contenedor del texto
    height: 58, // Permite que la altura se ajuste al contenido
  },
  commentText: {
    fontSize: 12,
    color: Colors.light.text,
    lineHeight: 20, // Espaciado entre líneas para mejor lectura
    // marginHorizontal ya lo tiene el container padre
    marginLeft: 10, // Espacio entre el borde izquierdo del contenedor y el texto
  },
});
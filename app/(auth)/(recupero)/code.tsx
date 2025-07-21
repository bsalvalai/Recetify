import Colors from '@/constants/Colors';
import React, { useState, useRef } from 'react'; // Importa useRef
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, router, useRouter } from 'expo-router';

export default function RecuperoClaveCodigo({ navigation }: any) {
  const [code, setCode] = useState('');
  const router = useRouter();

  // 1. Crea un array de referencias para cada TextInput
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleCodeChange = (text: string, index: number) => {
    // Asegúrate de que solo se ingrese un dígito y que sea un número
    if (text.length > 1) return; // Evitar que se escriban más de 1 carácter si se pega texto
    if (text && !/^\d$/.test(text)) return; // Asegurarse de que solo sea un dígito numérico

    let newCode = code.split('');
    if (text === '') { // Si el usuario borra un carácter
      newCode[index] = '';
      if (index > 0) {
        // Mueve el foco a la casilla anterior si se borra el contenido
        inputRefs.current[index - 1]?.focus();
      }
    } else { // Si el usuario escribe un carácter
      newCode[index] = text;
      // Mueve el foco a la siguiente casilla si el texto fue ingresado y no es la última casilla
      if (index < 5 && text !== '') { // index < 5 porque hay 6 casillas (0 a 5)
        inputRefs.current[index + 1]?.focus();
      } else if (index === 5 && text !== '') {
        // Si es la última casilla y se ingresó un valor, quita el foco
        inputRefs.current[index]?.blur();
      }
    }
    setCode(newCode.join(''));
  };

  // Función para manejar el borrado con la tecla 'backspace'
  const handleKeyPress = ({ nativeEvent: { key } }: any, index: number) => {
    // Si la tecla presionada es 'backspace' y la casilla actual está vacía,
    // movemos el foco a la casilla anterior.
    if (key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Recupero de clave</Text>
      <Text style={styles.subtitle}>Ingrese el código enviado por Mail para continuar</Text>

      <View style={styles.codeContainer}>
        {[...Array(6)].map((_, i) => (
          <TextInput
            key={i}
            ref={el => { inputRefs.current[i] = el; }} 
            style={styles.codeInput}
            maxLength={1}
            keyboardType="number-pad"
            value={code[i] || ''}
            onChangeText={text => handleCodeChange(text, i)} 
            onKeyPress={e => handleKeyPress(e, i)} 
            selectTextOnFocus={true} 
          />
        ))}
      </View>
      <TouchableOpacity>
        <Text style={styles.resendText}>
          No recibiste el código? Presione aquí{'\n'}Para enviar nuevamente
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(auth)/(recupero)/newPass')} 
      >
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'center',
    paddingBottom: 100, // Ajusta si es necesario, o usa paddingBottom
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 40,
    color: '#111',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  codeInput: {
    backgroundColor: Colors.light.textInput,
    borderRadius: 10,
<<<<<<< Updated upstream
    width: 30, // Aumentado para mejor visualización
    height: 40, // Aumentado para mejor visualización
    marginHorizontal: 7, // Reducido para que estén más juntos
=======
    width: 30,
    height: 46,
    marginHorizontal: 7,
>>>>>>> Stashed changes
    textAlign: 'center',
    fontSize: 20, // Ajustado para que el número se vea mejor
    fontWeight: '400', // Para que el número resalte
    color: '#000',
    
  },
  resendText: {
    color: '#444',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    width: '100%',
    height: 54,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
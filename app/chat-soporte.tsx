import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { chatAsistenteZocaloTrade } from '../src/services/aiService';

interface Mensaje {
  id: string;
  texto: string;
  esUsuario: boolean;
  timestamp: Date;
}

const MENSAJES_INICIALES: Mensaje[] = [
  { id: '1', texto: '¡Hola! 👋 Soy el asistente de ZocaloTrade. ¿En qué puedo ayudarte hoy?', esUsuario: false, timestamp: new Date() },
];

export default function ChatSoporteScreen() {
  const [mensajes, setMensajes] = useState<Mensaje[]>(MENSAJES_INICIALES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const enviarMensaje = async () => {
    if (!input.trim() || loading) return;

    const mensajeUsuario: Mensaje = {
      id: Date.now().toString(),
      texto: input.trim(),
      esUsuario: true,
      timestamp: new Date(),
    };

    setMensajes(prev => [...prev, mensajeUsuario]);
    setInput('');
    setLoading(true);

    try {
      const respuesta = await chatAsistenteZocaloTrade(mensajeUsuario.texto);
      
      const mensajeBot: Mensaje = {
        id: (Date.now() + 1).toString(),
        texto: respuesta,
        esUsuario: false,
        timestamp: new Date(),
      };
      
      setMensajes(prev => [...prev, mensajeBot]);
    } catch (error) {
      const mensajeError: Mensaje = {
        id: (Date.now() + 1).toString(),
        texto: 'Lo siento, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo.',
        esUsuario: false,
        timestamp: new Date(),
      };
      setMensajes(prev => [...prev, mensajeError]);
    } finally {
      setLoading(false);
    }
  };

  const preguntasRapidas = [
    { pregunta: '¿Cómo funciona ZocaloTrade?', respuesta: 'ZocaloTrade es un marketplace donde puedes comprar productos del Zócalo de CDMX. El proceso es: 1) Explora productos, 2) Agrega al carrito, 3) Paga solo el envío por tarjeta, 4) Paga el producto al repartidor al recibirlo.' },
    { pregunta: '¿Cómo me registro como vendedor?', respuesta: 'Para vender: 1) Ve a Perfil, 2) Activa "Modo Vendedor", 3) Ve a Mi Tienda, 4) Agrega tus productos. ¡Listo para vender!' },
    { pregunta: '¿Cuál es la comisión?', respuesta: 'La comisión de ZocaloTrade es del 10% por cada venta. El vendedor recibe el 90% del precio del producto.' },
    { pregunta: '¿Cómo realizo un pedido?', respuesta: 'Para comprar: 1) Explora los productos, 2) Agrega al carrito, 3) Selecciona tu dirección, 4) Paga el envío, 5) Paga el producto al repartidor al recibir.' },
    { pregunta: '¿Puedo cancelar un pedido?', respuesta: 'Sí, puedes cancelar mientras el estado sea "Pendiente". Una vez que el vendedor comience a prepararlo, ya no es posible.' },
    { pregunta: '¿Cómo funciona el pago?', respuesta: 'Pagas el ENVÍO por adelantado con tarjeta. El PRODUCTO se paga al repartidor cuando te lo entregue (contraentrega).' },
    { pregunta: '¿Cuánto cuesta el envío?', respuesta: 'El envío varía según la zona: Centro Histórico $50, CDMX $80-150, Estado de México $150-200. ¡Envío gratis en compras de más de $500!' },
    { pregunta: '¿Qué es pago contraentrega?', respuesta: 'Es pagar el producto al repartidor cuando te lo entregue. No necesitas tarjeta, pagas en efectivo.' },
  ];

  const renderMensaje = ({ item }: { item: Mensaje }) => (
    <View style={[styles.mensaje, item.esUsuario ? styles.mensajeUsuario : styles.mensajeBot]}>
      <Text style={[styles.mensajeTexto, item.esUsuario && styles.mensajeTextoUsuario]}>
        {item.texto}
      </Text>
      <Text style={[styles.mensajeHora, item.esUsuario && styles.mensajeHoraUsuario]}>
        {item.timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={mensajes}
        keyExtractor={(item) => item.id}
        renderItem={renderMensaje}
        contentContainerStyle={styles.listaMensajes}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListHeaderComponent={
          <View style={styles.bienvenida}>
            <Text style={styles.bienvenidaIcon}>💬</Text>
            <Text style={styles.bienvenidaTitulo}>Asistente Virtual ZocaloTrade</Text>
            <Text style={styles.bienvenidaTexto}>
              Estoy aquí para ayudarte con cualquier pregunta sobre la app, pedidos, vendedores o soporte.
            </Text>
            <Text style={styles.preguntasTitulo}>Preguntas frecuentes:</Text>
            {preguntasRapidas.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.preguntaRapida}
                onPress={() => {
                  setInput(item.pregunta);
                  // Automatically send the question
                  setTimeout(() => {
                    const mensajeUsuario = {
                      id: Date.now().toString(),
                      texto: item.pregunta,
                      esUsuario: true,
                      timestamp: new Date(),
                    };
                    setMensajes(prev => [...prev, mensajeUsuario]);
                    
                    const mensajeBot = {
                      id: (Date.now() + 1).toString(),
                      texto: item.respuesta,
                      esUsuario: false,
                      timestamp: new Date(),
                    };
                    setMensajes(prev => [...prev, mensajeBot]);
                  }, 100);
                }}
              >
                <Text style={styles.preguntaRapidaText}>{item.pregunta}</Text>
              </TouchableOpacity>
            ))}
          </View>
        }
      />

      {loading && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>Escribiendo...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor="#999"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.enviarBtn, (!input.trim() || loading) && styles.enviarBtnDisabled]}
          onPress={enviarMensaje}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.enviarBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listaMensajes: { padding: 15 },
  mensaje: { maxWidth: '80%', padding: 15, borderRadius: 18, marginBottom: 10 },
  mensajeUsuario: { alignSelf: 'flex-end', backgroundColor: '#FF6B35' },
  mensajeBot: { alignSelf: 'flex-start', backgroundColor: '#fff' },
  mensajeTexto: { fontSize: 15, color: '#333' },
  mensajeTextoUsuario: { color: '#fff' },
  mensajeHora: { fontSize: 10, color: '#999', marginTop: 5 },
  mensajeHoraUsuario: { color: 'rgba(255,255,255,0.7)' },
  typingContainer: { padding: 10, backgroundColor: '#fff' },
  typingText: { color: '#666', fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, maxHeight: 100, fontSize: 15 },
  enviarBtn: { width: 45, height: 45, backgroundColor: '#FF6B35', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  enviarBtnDisabled: { backgroundColor: '#ccc' },
  enviarBtnText: { fontSize: 20, color: '#fff' },
  bienvenida: { alignItems: 'center', paddingVertical: 20, marginBottom: 10 },
  bienvenidaIcon: { fontSize: 50 },
  bienvenidaTitulo: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  bienvenidaTexto: { color: '#666', textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
  preguntasTitulo: { fontSize: 14, fontWeight: '600', marginTop: 20, marginBottom: 10, color: '#333' },
  preguntaRapida: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 15, marginBottom: 8, width: '100%' },
  preguntaRapidaText: { color: '#FF6B35', fontSize: 14 },
});

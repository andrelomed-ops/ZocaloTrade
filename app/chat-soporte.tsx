import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../src/services/supabase';
import { useStore } from '../src/store/useStore';
import { chatAsistenteZocaloTrade } from '../src/services/aiService';

interface Message {
  id: string;
  texto: string;
  emisor_id: string;
  receptor_id: string;
  es_bot?: boolean;
  created_at: string;
}

export default function ChatSoporteScreen() {
  const { user, colors } = useStore();
  const { receptorId, nombreReceptor, pedidoId } = useLocalSearchParams<{ 
    receptorId?: string; 
    nombreReceptor?: string;
    pedidoId?: string;
  }>();

  const [mensajes, setMensajes] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // ID de soporte por defecto (UUID nulo para representar al sistema/bot)
  const SYSTEM_ID = '00000000-0000-0000-0000-000000000000';
  const targetId = receptorId || SYSTEM_ID;
  const isAiMode = targetId === SYSTEM_ID;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Cargar historial de la base de datos
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('mensajes')
        .select('*')
        .or(`and(emisor_id.eq.${user.id},receptor_id.eq.${targetId}),and(emisor_id.eq.${targetId},receptor_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (data) setMensajes(data);
      setLoading(false);
    };

    fetchHistory();

    // 2. Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel(`chat_${user.id}_${targetId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'mensajes' 
      }, (payload) => {
        const newMsg = payload.new as Message;
        // Verificar si el mensaje pertenece a esta conversación
        if (
          (newMsg.emisor_id === user.id && newMsg.receptor_id === targetId) ||
          (newMsg.emisor_id === targetId && newMsg.receptor_id === user.id)
        ) {
          setMensajes(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, targetId]);

  const enviarMensaje = async () => {
    if (!input.trim() || !user) return;

    const texto = input.trim();
    setInput('');

    // 1. Guardar en DB
    const { data, error } = await supabase.from('mensajes').insert({
      emisor_id: user.id,
      receptor_id: targetId,
      texto: texto,
      pedido_id: pedidoId || null
    }).select().single();

    if (error) {
      console.error(error);
      return;
    }

    // 2. Si es modo AI, generar respuesta automática
    if (isAiMode) {
      setTyping(true);
      try {
        const respuestaAi = await chatAsistenteZocaloTrade(texto, {
          nombre: user.nombre,
          carritoCount: 1, // hardcoded mock para seguridad de parseo por ahora
          ultimoPedido: null
        });
        await supabase.from('mensajes').insert({
          emisor_id: SYSTEM_ID,
          receptor_id: user.id,
          texto: respuestaAi,
          es_bot: true
        });
      } catch (e) {
        console.error('AI Error:', e);
      } finally {
        setTyping(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>{nombreReceptor || 'Asistente Zócalo'}</Text>
        <Text style={styles.headerSubtitle}>{isAiMode ? 'Inteligencia Artificial' : 'Vendedor local'}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={mensajes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listaMensajes}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => {
          const esMio = item.emisor_id === user?.id;
          return (
            <View style={[
              styles.mensaje, 
              esMio ? [styles.mensajeUsuario, { backgroundColor: colors.primary }] : [styles.mensajeBot, { backgroundColor: colors.card }]
            ]}>
              <Text style={[styles.mensajeTexto, { color: esMio ? '#fff' : colors.text }]}>
                {item.texto}
              </Text>
              <Text style={[styles.mensajeHora, { color: esMio ? 'rgba(255,255,255,0.7)' : colors.subtext }]}>
                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.bienvenida}>
            <Text style={styles.bienvenidaIcon}>💬</Text>
            <Text style={[styles.bienvenidaTitulo, { color: colors.text }]}>¡Bienvenido al Chat!</Text>
            <Text style={[styles.bienvenidaTexto, { color: colors.subtext }]}>
              {isAiMode 
                ? 'Pregúntame lo que quieras sobre el Zócalo, tus pedidos o cómo vender.' 
                : `Estás chateando con ${nombreReceptor || 'el vendedor'}.`}
            </Text>
          </View>
        }
      />

      {typing && (
        <View style={[styles.typingContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.typingText, { color: colors.subtext }]}>Escribiendo respuesta...</Text>
        </View>
      )}

      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor={colors.subtext}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.enviarBtn, { backgroundColor: colors.primary }, (!input.trim()) && { opacity: 0.5 }]}
          onPress={enviarMensaje}
          disabled={!input.trim()}
        >
          <Text style={styles.enviarBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 40, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: '#fff', opacity: 0.8 },
  listaMensajes: { padding: 15 },
  mensaje: { maxWidth: '85%', padding: 12, borderRadius: 15, marginBottom: 10 },
  mensajeUsuario: { alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  mensajeBot: { alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
  mensajeTexto: { fontSize: 14, lineHeight: 20 },
  mensajeHora: { fontSize: 9, marginTop: 4, alignSelf: 'flex-end' },
  typingContainer: { paddingHorizontal: 20, paddingBottom: 10 },
  typingText: { fontSize: 12, fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, alignItems: 'center', gap: 10 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, maxHeight: 100, fontSize: 14 },
  enviarBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  enviarBtnText: { fontSize: 18, color: '#fff' },
  bienvenida: { alignItems: 'center', paddingVertical: 40 },
  bienvenidaIcon: { fontSize: 60, marginBottom: 20 },
  bienvenidaTitulo: { fontSize: 20, fontWeight: 'bold' },
  bienvenidaTexto: { textAlign: 'center', marginTop: 10, paddingHorizontal: 40, lineHeight: 20 },
});

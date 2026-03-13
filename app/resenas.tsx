import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useStore } from '../src/store/useStore';
import { supabase } from '../src/services/supabase';

interface Resena {
  id: string;
  usuario_id?: string;
  producto_id?: string;
  usuario?: string;
  avatar?: string;
  rating: number;
  comentario: string;
  fecha?: string;
  created_at?: string;
  respuesta?: string;
  helpful?: number;
}

export default function ResenasScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, addResena, colors } = useStore();
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingPromedio, setRatingPromedio] = useState(0);
  const [totalResenas, setTotalResenas] = useState(0);
  const [escribiendo, setEscribiendo] = useState(false);
  const [nuevaResena, setNuevaResena] = useState({ rating: 5, comentario: '' });

  useEffect(() => {
    if (id) {
      loadResenas();
    }
  }, [id]);

  const loadResenas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resenas')
        .select('*')
        .eq('producto_id', id)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const promedio = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setResenas(data);
        setRatingPromedio(promedio);
        setTotalResenas(data.length);
      } else {
        setResenas([]);
        setRatingPromedio(0);
        setTotalResenas(0);
      }
    } catch (e) {
      console.error('Error loading reseñas:', e);
      setResenas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarResena = async () => {
    if (!user) {
      Alert.alert('Inicia sesión', 'Necesitas iniciar sesión para escribir una reseña');
      return;
    }
    if (!nuevaResena.comentario.trim()) {
      Alert.alert('Error', 'Escribe un comentario');
      return;
    }

    try {
      const resena = {
        usuario_id: user.id,
        producto_id: id,
        usuario: user.nombre,
        avatar: '👤',
        rating: nuevaResena.rating,
        comentario: nuevaResena.comentario.trim(),
        created_at: new Date().toISOString(),
        helpful: 0
      };

      await supabase.from('resenas').insert(resena);
      
      await addResena(resena);
      await loadResenas();
      setEscribiendo(false);
      setNuevaResena({ rating: 5, comentario: '' });
      Alert.alert('✅', '¡Gracias por tu reseña!');
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la reseña');
    }
  };

  const renderEstrellas = (rating: number, interactivo = false) => (
    <View style={styles.estrellas}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity 
          key={star} 
          disabled={!interactivo}
          onPress={() => interactivo && setNuevaResena({ ...nuevaResena, rating: star })}
        >
          <Text style={[styles.estrella, star <= rating && styles.estrellaActiva]}>
            {star <= rating ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderResena = ({ item }: { item: Resena }) => (
    <View style={styles.resenaCard}>
      <View style={styles.resenaHeader}>
        <View style={styles.usuarioInfo}>
          <Text style={styles.usuarioAvatar}>{item.avatar || '👤'}</Text>
          <View>
            <Text style={styles.usuarioNombre}>{item.usuario || 'Usuario'}</Text>
            <Text style={styles.resenaFecha}>
              {item.fecha || new Date(item.created_at).toLocaleDateString('es-MX')}
            </Text>
          </View>
        </View>
        {renderEstrellas(item.rating)}
      </View>
      
      <Text style={styles.resenaComentario}>{item.comentario}</Text>
      
      {item.respuesta && (
        <View style={styles.respuestaContainer}>
          <Text style={styles.respuestaLabel}>📝 Respuesta del vendedor:</Text>
          <Text style={styles.respuestaTexto}>{item.respuesta}</Text>
        </View>
      )}
      
      <View style={styles.resenaFooter}>
        <TouchableOpacity style={styles.helpfulBtn}>
          <Text style={styles.helpfulIcon}>👍</Text>
          <Text style={styles.helpfulText}>Útil ({item.helpful || 0})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reseñas del Producto</Text>
        
        {totalResenas > 0 ? (
          <>
            <View style={styles.resumenContainer}>
              <Text style={styles.ratingPromedio}>{ratingPromedio.toFixed(1)}</Text>
              {renderEstrellas(Math.round(ratingPromedio))}
              <Text style={styles.totalResenas}>{totalResenas} reseñas</Text>
            </View>

            <View style={styles.barrasContainer}>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = resenas.filter(r => r.rating === stars).length;
                const pct = totalResenas > 0 ? (count / totalResenas) * 100 : 0;
                return (
                  <View key={stars} style={styles.barraRow}>
                    <Text style={styles.barraLabel}>{stars}</Text>
                    <View style={styles.barraFondo}>
                      <View style={[styles.barraFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={styles.barraPorcentaje}>{Math.round(pct)}%</Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.sinResenas}>
            <Text style={styles.sinResenasText}>Aún no hay reseñas</Text>
            <Text style={styles.sinResenasSubtext}>Sé el primero en opinar</Text>
          </View>
        )}
      </View>

      <View style={styles.escribirBtn}>
        {!escribiendo ? (
          <TouchableOpacity 
            style={styles.escribirButton}
            onPress={() => setEscribiendo(true)}
          >
            <Text style={styles.escribirButtonText}>✏️ Escribir una reseña</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.formResena}>
            <Text style={styles.formLabel}>Tu calificación:</Text>
            {renderEstrellas(nuevaResena.rating, true)}
            <TextInput
              style={styles.input}
              placeholder="Comparte tu experiencia con este producto..."
              multiline
              value={nuevaResena.comentario}
              onChangeText={(text) => setNuevaResena({ ...nuevaResena, comentario: text })}
            />
            <View style={styles.formBotones}>
              <TouchableOpacity 
                style={[styles.btnCancelar]}
                onPress={() => setEscribiendo(false)}
              >
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btnEnviar]}
                onPress={handleEnviarResena}
              >
                <Text style={styles.btnEnviarText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={resenas}
        keyExtractor={(item) => item.id}
        renderItem={renderResena}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.listTitle}>
            {totalResenas > 0 ? 'Reseñas más recientes' : ''}
          </Text>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay reseñas aún. ¡Comparte tu experiencia!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#FF6B35', padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  resumenContainer: { alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  ratingPromedio: { fontSize: 48, fontWeight: 'bold', color: '#333' },
  estrellas: { flexDirection: 'row', marginVertical: 10 },
  estrella: { fontSize: 20, marginHorizontal: 2 },
  estrellaActiva: {},
  totalResenas: { color: '#666', marginTop: 5 },
  barrasContainer: { marginTop: 20 },
  barraRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barraLabel: { width: 20, fontSize: 14, color: '#fff' },
  barraFondo: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginHorizontal: 10 },
  barraFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  barraPorcentaje: { width: 40, fontSize: 12, color: '#fff', textAlign: 'right' },
  sinResenas: { backgroundColor: '#fff', padding: 30, borderRadius: 12, alignItems: 'center' },
  sinResenasText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  sinResenasSubtext: { color: '#666', marginTop: 5 },
  escribirBtn: { backgroundColor: '#fff', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  escribirButton: { backgroundColor: '#FF6B35', padding: 15, borderRadius: 10, alignItems: 'center' },
  escribirButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  formResena: { padding: 10 },
  formLabel: { fontWeight: 'bold', marginBottom: 10 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, minHeight: 100, textAlignVertical: 'top', marginBottom: 15 },
  formBotones: { flexDirection: 'row', justifyContent: 'space-between' },
  btnCancelar: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginRight: 10 },
  btnCancelarText: { textAlign: 'center', color: '#666' },
  btnEnviar: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#FF6B35', marginLeft: 10 },
  btnEnviarText: { textAlign: 'center', color: '#fff', fontWeight: 'bold' },
  list: { padding: 15 },
  listTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  resenaCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  resenaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  usuarioInfo: { flexDirection: 'row', alignItems: 'center' },
  usuarioAvatar: { fontSize: 36, marginRight: 10 },
  usuarioNombre: { fontWeight: 'bold', fontSize: 15 },
  resenaFecha: { color: '#999', fontSize: 12 },
  resenaComentario: { color: '#333', lineHeight: 22, marginBottom: 10 },
  respuestaContainer: { backgroundColor: '#f0f8ff', padding: 12, borderRadius: 8, marginBottom: 10 },
  respuestaLabel: { fontSize: 12, fontWeight: 'bold', color: '#3498db', marginBottom: 5 },
  respuestaTexto: { color: '#333', fontSize: 13, fontStyle: 'italic' },
  resenaFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 },
  helpfulBtn: { flexDirection: 'row', alignItems: 'center' },
  helpfulIcon: { fontSize: 16, marginRight: 5 },
  helpfulText: { color: '#666', fontSize: 13 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 30 },
});

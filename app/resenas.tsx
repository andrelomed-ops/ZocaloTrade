import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput, Star } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

interface Resena {
  id: string;
  usuario: string;
  avatar: string;
  rating: number;
  comentario: string;
  fecha: string;
  respuesta?: string;
  helpful: number;
}

const MOCK_RESENAS: Resena[] = [
  { id: '1', usuario: 'María G.', avatar: '👩', rating: 5, comentario: 'Excelente producto, muy recomendable. Llegó rápido y bien empacado.', fecha: '15/01/2024', respuesta: '¡Gracias! Nos alegra que te haya gustado.', helpful: 12 },
  { id: '2', usuario: 'Carlos R.', avatar: '👨', rating: 4, comentario: 'Muy bueno, pero el envío tardó un poco más de lo esperado.', fecha: '14/01/2024', helpful: 5 },
  { id: '3', usuario: 'Ana L.', avatar: '👩', rating: 5, comentario: 'Perfecto para regalar. Muy artesanal y de buena calidad.', fecha: '12/01/2024', helpful: 8 },
  { id: '4', usuario: 'Pedro M.', avatar: '👨', rating: 3, comentarios: 'Producto correcto, pero la descripción no era muy precisa.', fecha: '10/01/2024', helpful: 2 },
];

export default function ResenasScreen() {
  const [resenas] = useState<Resena[]>(MOCK_RESENAS);
  const [ratingPromedio] = useState(4.5);
  const [totalResenas] = useState(24);

  const renderEstrellas = (rating: number) => (
    <View style={styles.estrellas}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text key={star} style={styles.estrella}>{star <= rating ? '⭐' : '☆'}</Text>
      ))}
    </View>
  );

  const renderResena = ({ item }: { item: Resena }) => (
    <View style={styles.resenaCard}>
      <View style={styles.resenaHeader}>
        <View style={styles.usuarioInfo}>
          <Text style={styles.usuarioAvatar}>{item.avatar}</Text>
          <View>
            <Text style={styles.usuarioNombre}>{item.usuario}</Text>
            <Text style={styles.resenaFecha}>{item.fecha}</Text>
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
          <Text style={styles.helpfulText}>Útil ({item.helpful})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportBtn}>
          <Text style={styles.reportText}>Reportar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reseñas y Calificaciones</Text>
        
        <View style={styles.resumenContainer}>
          <Text style={styles.ratingPromedio}>{ratingPromedio}</Text>
          {renderEstrellas(Math.round(ratingPromedio))}
          <Text style={styles.totalResenas}>{totalResenas} reseñas</Text>
        </View>

        <View style={styles.barrasContainer}>
          {[5, 4, 3, 2, 1].map((stars) => (
            <View key={stars} style={styles.barraRow}>
              <Text style={styles.barraLabel}>{stars}</Text>
              <View style={styles.barraFondo}>
                <View style={[styles.barraFill, { width: `${stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 7 : 3}%` }]} />
              </View>
              <Text style={styles.barraPorcentaje}>{stars === 5 ? '70%' : stars === 4 ? '20%' : stars === 3 ? '7%' : '3%'}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.escribirBtn}>
        <TouchableOpacity style={styles.escribirButton}>
          <Text style={styles.escribirButtonText}>✏️ Escribir una reseña</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={resenas}
        keyExtractor={(item) => item.id}
        renderItem={renderResena}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.listTitle}>Reseñas más recientes</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#FF6B35', padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  resumenContainer: { alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  ratingPromedio: { fontSize: 48, fontWeight: 'bold', color: '#333' },
  estrellas: { flexDirection: 'row', marginVertical: 10 },
  estrella: { fontSize: 20, marginHorizontal: 2 },
  totalResenas: { color: '#666', marginTop: 5 },
  barrasContainer: { marginTop: 20 },
  barraRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barraLabel: { width: 20, fontSize: 14, color: '#fff' },
  barraFondo: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginHorizontal: 10 },
  barraFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  barraPorcentaje: { width: 40, fontSize: 12, color: '#fff', textAlign: 'right' },
  escribirBtn: { backgroundColor: '#fff', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  escribirButton: { backgroundColor: '#FF6B35', padding: 15, borderRadius: 10, alignItems: 'center' },
  escribirButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
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
  reportBtn: { padding: 5 },
  reportText: { color: '#999', fontSize: 12 },
});

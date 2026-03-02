import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useState } from 'react';

interface FaqItem {
  pregunta: string;
  respuesta: string;
  categoria: string;
}

const FAQS: FaqItem[] = [
  { pregunta: '¿Cómo funciona ZocaloTrade?', respuesta: 'ZocaloTrade es un marketplace que conecta compradores con vendedores del Zócalo de Ciudad de México. Puedes explorar productos, agregar al carrito, y recibir entrega en tu ubicación.', categoria: 'General' },
  { pregunta: '¿Cuál es la comisión por venta?', respuesta: 'ZocaloTrade cobra una comisión del 10% por cada venta realizada. No hay mensualidad ni costo por registrarte.', categoria: 'Pagos' },
  { pregunta: '¿Cómo me registro como vendedor?', respuesta: 'Ve a tu Perfil, activa el "Modo Vendedor" y completa el registro con la información de tu tienda. Puedes agregar productos inmediatamente después.', categoria: 'Vendedor' },
  { pregunta: '¿Cuáles son los métodos de pago?', respuesta: 'Aceptamos efectivo, tarjetas de débito/crédito (Visa, Mastercard, AMEX) y transferencias bancarias. También puedes pagar en efectivo al recibir.', categoria: 'Pagos' },
  { pregunta: '¿Cómo sigo mi pedido?', respuesta: 'En la sección "Pedidos" puedes ver el estado de cada orden: Pendiente → Preparando → Listo → En Camino → Entregado.', categoria: 'Pedidos' },
  { pregunta: '¿Puedo cancelar un pedido?', respuesta: 'Sí, puedes cancelar mientras el estado sea "Pendiente". Una vez que el vendedor comience a prepararlo, no será posible la cancelación.', categoria: 'Pedidos' },
  { pregunta: '¿Cómo contacto al vendedor?', respuesta: 'Desde el detalle de tu pedido puedes enviar mensajes al vendedor. También puedes usar el chat de soporte.', categoria: 'Soporte' },
  { pregunta: '¿Qué hago si mi pedido no llega?', respuesta: 'Contacta al vendedor primero. Si no hay respuesta, usa el chat de soporte de ZocaloTrade para ayudarte a resolver el problema.', categoria: 'Pedidos' },
  { pregunta: '¿Hay envío gratis?', respuesta: 'Algunos vendedores ofrecen envío gratis en pedidos mayores a $200. Revisa las promociones activas en la app.', categoria: 'Envíos' },
  { pregunta: '¿Cómo funciona la AI de descripciones?', respuesta: 'Los vendedores pueden usar nuestra IA para generar descripciones atractivas de sus productos automáticamente.', categoria: 'Vendedor' },
  { pregunta: '¿Mis datos están seguros?', respuesta: 'Sí, usamos encriptación de nivel bancario para proteger tus datos de pago y personales.', categoria: 'Privacidad' },
  { pregunta: '¿Cómo elimino mi cuenta?', respuesta: 'En Configuración > Cuenta > Eliminar cuenta. Ten en cuenta que esta acción es irreversible.', categoria: 'Cuenta' },
];

const CATEGORIAS = ['General', 'Pagos', 'Pedidos', 'Vendedor', 'Envíos', 'Soporte', 'Privacidad', 'Cuenta'];

export default function AyudaScreen() {
  const [categoria, setCategoria] = useState('General');
  const [preguntaExpandida, setPreguntaExpandida] = useState<number | null>(null);

  const faqsFiltrados = FAQS.filter(f => f.categoria === categoria);

  const handleContactSupport = () => {
    Linking.openURL('mailto:soporte@zocalotrade.com');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>❓ Centro de Ayuda</Text>
        <Text style={styles.headerSubtitle}>Preguntas frecuentes y soporte</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasScroll}>
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoriaBtn, categoria === cat && styles.categoriaBtnActive]}
            onPress={() => setCategoria(cat)}
          >
            <Text style={[styles.categoriaText, categoria === cat && styles.categoriaTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.faqContainer}>
        {faqsFiltrados.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <TouchableOpacity 
              style={styles.faqPregunta}
              onPress={() => setPreguntaExpandida(preguntaExpandida === index ? null : index)}
            >
              <Text style={styles.faqPreguntaText}>{faq.pregunta}</Text>
              <Text style={styles.faqIcon}>{preguntaExpandida === index ? '−' : '+'}</Text>
            </TouchableOpacity>
            {preguntaExpandida === index && (
              <View style={styles.faqRespuesta}>
                <Text style={styles.faqRespuestaText}>{faq.respuesta}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.contactoSection}>
        <Text style={styles.contactoTitle}>¿No encontraste lo que buscabas?</Text>
        <TouchableOpacity style={styles.contactoBtn} onPress={handleContactSupport}>
          <Text style={styles.contactoBtnText}>📧 Contactar Soporte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatBtn}>
          <Text style={styles.chatBtnText}>💬 Chatear con Nosotros</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#FF6B35', padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  categoriasScroll: { backgroundColor: '#fff', paddingVertical: 15, maxHeight: 60 },
  categoriaBtn: { backgroundColor: '#f0f0f0', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginHorizontal: 5 },
  categoriaBtnActive: { backgroundColor: '#FF6B35' },
  categoriaText: { color: '#666', fontWeight: '600' },
  categoriaTextActive: { color: '#fff' },
  faqContainer: { flex: 1, padding: 15 },
  faqItem: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  faqPregunta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  faqPreguntaText: { flex: 1, fontSize: 15, fontWeight: '600', marginRight: 10 },
  faqIcon: { fontSize: 24, color: '#FF6B35', fontWeight: 'bold' },
  faqRespuesta: { padding: 15, paddingTop: 0, backgroundColor: '#f9f9f9' },
  faqRespuestaText: { color: '#666', lineHeight: 22 },
  contactoSection: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderColor: '#eee' },
  contactoTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 15 },
  contactoBtn: { backgroundColor: '#FF6B35', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  contactoBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  chatBtn: { backgroundColor: '#fff', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#FF6B35' },
  chatBtnText: { color: '#FF6B35', fontWeight: 'bold', fontSize: 16 },
});

import { StyleSheet, Image, ScrollView, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import i18n from '@/components/18n';

const { width } = Dimensions.get('window');

// Disease information data
const diseaseInfo = [
  {
    id: 'healthy',
    name: 'Healthy Plant',
    nameRw: 'Igihingwa Kimeze Neza',
    nameFr: 'Plante Saine',
    icon: 'leaf',
    color: '#4CAF50',
    prevalence: '60%',
    riskLevel: 'None',
    description: 'No disease detected. Plant appears healthy with proper green coloration.',
  },
  {
    id: 'cordana',
    name: 'Banana Xanthomonas Wilt (BXW)',
    nameRw: 'Kirabiranya',
    nameFr: 'Flétrissement Bactérien',
    icon: 'warning',
    color: '#D32F2F',
    prevalence: '25%',
    riskLevel: 'Very High',
    description: 'Severe bacterial disease causing yellowing, wilting, and rapid plantation destruction.',
  },
  {
    id: 'sigatoka',
    name: 'Sigatoka',
    nameRw: 'Sigatoka',
    nameFr: 'Sigatoka',
    icon: 'circle',
    color: '#FF5722',
    prevalence: '30%',
    riskLevel: 'High',
    description: 'Fungal disease causing yellow spots that turn brown with gray centers.',
  },
  {
    id: 'pestalotiopsis',
    name: 'Pestalotiopsis',
    nameRw: 'Pestalotiopsis',
    nameFr: 'Pestalotiopsis',
    icon: 'blur-on',
    color: '#FF9800',
    prevalence: '15%',
    riskLevel: 'Medium',
    description: 'Fungal disease causing leaf spots and potential fruit rot.',
  },
];

const tips = [
  {
    icon: 'camera-alt',
    title: 'Best Photography Tips',
    titleRw: 'Amabwiriza yo Gufata Amafoto',
    titleFr: 'Conseils de Photographie',
    content: 'Take clear, close-up photos of affected leaves in good lighting for accurate detection.',
    contentRw: 'Fata amafoto arambuye kandi asobanutse y\'amababi yanduye mu mucyo mwiza kugira ngo hagire isuzuma nyirizina.',
    contentFr: 'Prenez des photos claires et rapprochées des feuilles affectées avec un bon éclairage pour une détection précise.',
  },
  {
    icon: 'schedule',
    title: 'Early Detection',
    titleRw: 'Kumenya Hakiri Kare',
    titleFr: 'Détection Précoce',
    content: 'Regular monitoring helps catch diseases early when treatment is most effective.',
    contentRw: 'Gukurikirana kenshi bifasha kumenya indwara hakiri kare igihe ikiza kirinzenya.',
    contentFr: 'La surveillance régulière aide à détecter les maladies tôt quand le traitement est plus efficace.',
  },
  {
    icon: 'eco',
    title: 'Prevention First',
    titleRw: 'Kwirinda ni Ingenzi',
    titleFr: 'Prévention d\'Abord',
    content: 'Maintain proper spacing, sanitation, and use disease-free planting materials.',
    contentRw: 'Kureba intera ikwiye, kwita ku buzima, no gukoresha ibimera bidafite indwara.',
    contentFr: 'Maintenez un espacement adéquat, l\'assainissement et utilisez du matériel de plantation sans maladie.',
  },
];

export default function ExploreScreen() {
  const getCurrentLanguage = () => i18n.locale || 'en';

  const getLocalizedText = (item: any, field: string) => {
    const lang = getCurrentLanguage();
    if (lang === 'rw' && item[field + 'Rw']) return item[field + 'Rw'];
    if (lang === 'fr' && item[field + 'Fr']) return item[field + 'Fr'];
    return item[field];
  };

  const renderDiseaseCard = (disease: any) => (
    <TouchableOpacity key={disease.id} style={[styles.diseaseCard, { borderLeftColor: disease.color }]}>
      <View style={styles.diseaseHeader}>
        <View style={[styles.diseaseIcon, { backgroundColor: disease.color + '20' }]}>
          <MaterialIcons name={disease.icon} size={28} color={disease.color} />
        </View>
        <View style={styles.diseaseInfo}>
          <Text style={styles.diseaseName}>
            {getCurrentLanguage() === 'rw' ? disease.nameRw : 
             getCurrentLanguage() === 'fr' ? disease.nameFr : disease.name}
          </Text>
          <View style={styles.diseaseStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Prevalence</Text>
              <Text style={[styles.statValue, { color: disease.color }]}>{disease.prevalence}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Risk Level</Text>
              <Text style={[styles.statValue, { color: disease.color }]}>{disease.riskLevel}</Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={styles.diseaseDescription}>{disease.description}</Text>
    </TouchableOpacity>
  );

  const renderTipCard = (tip: any, index: number) => (
    <View key={index} style={styles.tipCard}>
      <View style={styles.tipHeader}>
        <View style={styles.tipIcon}>
          <MaterialIcons name={tip.icon} size={24} color="#2E7D32" />
        </View>
        <Text style={styles.tipTitle}>{getLocalizedText(tip, 'title')}</Text>
      </View>
      <Text style={styles.tipContent}>{getLocalizedText(tip, 'content')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <FontAwesome5 name="search" size={24} color="#FFC107" />
          <Text style={styles.headerTitle}>Disease Explorer</Text>
        </View>
        <Text style={styles.headerSubtitle}>Learn about banana diseases and prevention</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics Overview */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>
            <MaterialIcons name="analytics" size={20} color="#1B5E20" /> Detection Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="check-circle" size={32} color="#4CAF50" />
              <Text style={styles.statNumber}>95%</Text>
              <Text style={styles.statDescription}>Accuracy Rate</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="speed" size={32} color="#2196F3" />
              <Text style={styles.statNumber}>2.3s</Text>
              <Text style={styles.statDescription}>Avg Response</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="visibility" size={32} color="#FF9800" />
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statDescription}>Diseases Detected</Text>
            </View>
          </View>
        </View>

        {/* Disease Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialIcons name="local-hospital" size={20} color="#1B5E20" /> Disease Database
          </Text>
          <Text style={styles.sectionSubtitle}>
            Common banana diseases detected by our AI system
          </Text>
          {diseaseInfo.map(renderDiseaseCard)}
        </View>

        {/* Prevention Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialIcons name="lightbulb" size={20} color="#1B5E20" /> Prevention Tips
          </Text>
          <Text style={styles.sectionSubtitle}>
            Best practices for maintaining healthy banana plants
          </Text>
          {tips.map(renderTipCard)}
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialIcons name="psychology" size={20} color="#1B5E20" /> How AI Detection Works
          </Text>
          <View style={styles.processContainer}>
            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Image Capture</Text>
                <Text style={styles.stepDescription}>Take a clear photo of the banana leaf</Text>
              </View>
            </View>
            
            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>AI Analysis</Text>
                <Text style={styles.stepDescription}>Advanced neural networks analyze leaf patterns</Text>
              </View>
            </View>
            
            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Disease Identification</Text>
                <Text style={styles.stepDescription}>System identifies disease with confidence score</Text>
              </View>
            </View>
            
            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Treatment Recommendations</Text>
                <Text style={styles.stepDescription}>Receive tailored treatment suggestions</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <FontAwesome5 name="leaf" size={32} color="#4CAF50" />
          <Text style={styles.footerText}>
            Smart Banana Disease Detection System
          </Text>
          <Text style={styles.footerSubtext}>
            Powered by artificial intelligence for sustainable agriculture
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FDF8',
  },
  header: {
    backgroundColor: '#2E7D32',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#C8E6C9',
    fontSize: 14,
    marginLeft: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Statistics
  statsContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#4A5568',
    marginBottom: 16,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B5E20',
    marginTop: 8,
  },
  statDescription: {
    fontSize: 12,
    color: '#4A5568',
    textAlign: 'center',
    marginTop: 4,
  },

  // Sections
  section: {
    marginVertical: 16,
  },

  // Disease Cards
  diseaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  diseaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  diseaseIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  diseaseInfo: {
    flex: 1,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 8,
  },
  diseaseStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#4A5568',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  diseaseDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },

  // Tips
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    flex: 1,
  },
  tipContent: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
  },

  // Process Steps
  processContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  footerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 20,
  },
});

// src/localization/i18n.ts
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

// Define translation types for type safety
type TranslationKeys = {
  appTitle: string;
  loading: string;
  analyzing: string;
  permissions: {
    cameraRequired: string;
    mediaTitle: string;
    mediaMessage: string;
  };
  errors: {
    cameraError: string;
    galleryError: string;
    analyzeError: string;
  };
  instructions: {
    capture: string;
  };
  buttons: {
    camera: string;
    gallery: string;
    takeAnother: string;
    moreInfo: string;
  };
  results: {
    title: string;
    confidence: string;
    description: string;
    treatment: string;
  };
  about: {
    title: string;
    description: string;
  };
};

// Enhanced Translation object with comprehensive disease information
const translations = {
  en: {
    appTitle: 'Banana-Guard',
    loading: 'Loading camera...',
    analyzing: 'Analyzing image...',
    
    // Disease Names
    kirabiranya: 'Banana Xanthomonas Wilt (BXW)',
    
    // Enhanced Disease Descriptions with detailed medical information
    cordanadescription: 'Banana Xanthomonas Wilt (BXW) is a devastating bacterial disease caused by Xanthomonas campestris pv. musacearum. It affects the vascular system of banana plants, causing yellowing and wilting of leaves, premature ripening and rotting of fruits, and complete plant death. The disease spreads rapidly through contaminated farm tools, infected planting materials, insects (especially fruit flies), and direct plant contact. Early symptoms include yellowing of younger leaves, wilting during hot periods, and bacterial ooze from cut stems.',
    
    cordanatreatment: 'IMMEDIATE ACTION REQUIRED: 1) Uproot and burn ALL infected plants completely - including roots and soil around them. 2) Disinfect all farm tools with 70% alcohol or bleach solution after each use. 3) Establish a 3-meter quarantine zone around affected areas. 4) Use only certified disease-free planting materials. 5) Control fruit flies using traps and approved insecticides. 6) Practice crop rotation with non-host plants for 6-12 months. 7) Train all farm workers on proper sanitation protocols. 8) Report outbreak to local agricultural authorities immediately.',
    
    healthyDescription: 'Excellent news! No disease symptoms detected. Your banana plant appears healthy with good leaf color, proper structure, and no visible signs of bacterial, fungal, or viral infections. This indicates proper care and favorable growing conditions.',
    
    healthyTreatment: 'PREVENTIVE CARE: 1) Continue regular monitoring - inspect plants weekly for early disease signs. 2) Maintain proper spacing (2-3 meters between plants) for good air circulation. 3) Apply balanced fertilizer (NPK 15:15:15) every 3 months. 4) Ensure proper drainage - avoid waterlogged conditions. 5) Remove dead leaves and suckers regularly. 6) Use clean, disinfected tools for all farm operations. 7) Practice integrated pest management to control insects that spread diseases.',
    
    pestalotiopsisDescription: 'Pestalotiopsis Leaf Spot is a fungal disease caused by Pestalotiopsis palmarum and related species. It appears as dark brown to black circular spots with yellow halos on leaves, particularly during wet seasons. The disease affects leaf photosynthesis, reducing plant vigor and fruit quality. In severe cases, it can cause premature defoliation and secondary infections. The fungus thrives in high humidity (>80%) and temperatures between 25-30°C.',
    
    pestalotiopsisTreatment: 'FUNGAL MANAGEMENT: 1) Remove and destroy all infected leaves immediately - burn or bury them away from the plantation. 2) Improve air circulation by proper plant spacing and removing lower leaves. 3) Apply copper-based fungicides (Copper hydroxide 2g/L) every 14 days during wet seasons. 4) Avoid overhead irrigation - use drip irrigation instead. 5) Apply potassium-rich fertilizers to strengthen plant resistance. 6) Use protective fungicides before rainy seasons. 7) Ensure good drainage to reduce soil moisture around plant base.',
    
    sigatokaDescription: 'Black Sigatoka (Mycosphaerella fijiensis) is one of the most destructive banana diseases worldwide. It appears as yellow streaks that develop into brown patches with gray centers and dark borders on leaves. The disease severely reduces photosynthetic area, leading to premature fruit ripening, reduced bunch weight (up to 50% yield loss), and poor fruit quality. It spreads rapidly through airborne spores, especially during humid conditions with temperatures of 26-28°C.',
    
    sigatokaTreatment: 'URGENT MANAGEMENT REQUIRED: 1) Implement weekly fungicide spray program using systemic fungicides (Propiconazole 0.1% or Azoxystrobin 0.2%). 2) Remove heavily infected leaves immediately - cut at least 15cm below visible symptoms. 3) Apply leaf spotting techniques to improve spray coverage. 4) Maintain good field sanitation - remove fallen leaves and plant debris. 5) Use resistant varieties when replanting (FHIA-20, FHIA-23). 6) Improve field drainage and reduce plant density. 7) Monitor weather conditions and increase spray frequency during humid periods.',
    
    // Image Rejection Messages
    imageRejected: 'Image Not Suitable',
    rejectionMessage: 'This image doesn\'t appear to be a banana leaf. Please upload a clear image of a banana leaf for disease analysis.',
    rejectionReasons: 'Specific Issues',
    technicalDetails: 'View Technical Details',
    rejectionTips: {
      title: '💡 Tips for Better Results',
      tip1: '• Use clear, well-lit banana leaf images',
      tip2: '• Ensure the leaf fills most of the frame',
      tip3: '• Avoid blurry or out-of-focus images',
      tip4: '• Make sure it\'s actually a banana leaf',
      tip5: '• Take photos during daylight for best results',
      tip6: '• Clean the camera lens before taking photos',
    },
    
    // Notification Messages
    notifications: {
      healthyDetected: 'Healthy Leaf Detected!',
      diseaseDetected: 'Disease Detected',
      urgentDisease: 'Disease Detected - Urgent!',
      urgentMessage: 'requires immediate attention',
      imageRejected: 'Image Rejected',
      analysisComplete: 'Analysis Complete!',
      audioPlaying: 'Audio Playing',
      audioError: 'Audio Error',
      speechError: 'Speech Error',
    },
    
    permissions: {
      cameraRequired: 'Camera permission is required to use this app',
      mediaTitle: 'Media Library Permission',
      mediaMessage: 'Permission to access media library is needed for selecting images',
    },
    errors: {
      cameraError: 'Failed to take picture. Please try again.',
      galleryError: 'Failed to select image. Please try again.',
      analyzeError: 'Failed to analyze image. Please try again.',
      analysisFailedNetwork: 'Analysis Failed. Please check your internet connection and try again.',
    },
    instructions: {
      capture: 'Take a picture of a banana leaf to detect diseases using AI-powered analysis',
    },
    buttons: {
      camera: 'Camera',
      gallery: 'Gallery',
      takeAnother: 'Take Another Photo',
      moreInfo: 'More Information',
      selectNewImage: 'Select New Image',
      tryAgain: 'Try Again',
    },
    results: {
      title: 'Detection Results',
      confidence: 'Confidence',
      description: 'Description',
      treatment: 'Treatment Recommendation',
      aiPowered: 'AI Powered',
      certainty: 'Certainty',
      urgent: 'URGENT',
    },
    about: {
      title: 'About This App',
      description: 'This application uses advanced artificial intelligence and machine learning to detect banana diseases in real-time with high accuracy. It can identify multiple diseases including Banana Xanthomonas Wilt, Black Sigatoka, and Pestalotiopsis, providing instant treatment recommendations to help farmers protect their crops and maximize yields.',
    },
    stats: {
      title: 'Quick Stats',
      totalScans: 'Total Scans',
      healthy: 'Healthy',
      diseases: 'Diseases',
    },
  },
  
  rw: {
    appTitle: 'Banana-Guard',
    loading: 'Itegereze camera...',
    analyzing: 'Isuzuma ifoto...',
    
    // Amazina y\'Indwara
    kirabiranya: 'Kirabiranya (BXW)',
    
    // Ibisobanuro birambuye by\'Indwara
    cordanadescription: 'Kirabiranya (BXW) ni indwara ikomeye y\'umusemburo iterwa na Xanthomonas campestris pv. musacearum. Ibasira sisitemu y\'imitsi y\'urutoki, igahatira amababi gucumbagira no guhera, imbuto gutimba no kwera hakiri kare, ndetse igihingwa gupfa byose. Indwara yandurira hakayugiro hirya no hino binyuze mu bikoresho by\'ubuhinzi byanduye, ibisigo bifite indwara, udukoko (cyane cyane isazi y\'imbuto), no guhurira hagati y\'ibihingwa. Ibimenyetso bya mbere birimo amababi mashya gucumbagira, guhera mugihe cyubushyuhe, n\'umusemburo usohoka mubishishije.',
    
    cordanatreatment: 'IBIKORWA BYIHUTIRWA: 1) Kurandura no gutwika ibihingwa byose byanduye - harimo imizi n\'ubutaka bwabizengurukiye. 2) Kwoza ibikoresho byose by\'ubuhinzi n\'alcooli ya 70% cyangwa javel nyuma ya buri koresha. 3) Gushira agaciro ka quarantine ka metero 3 ibipimo byabatajwe indwara. 4) Gukoresha ibisigo bigeragezwa bitafite indwara gusa. 5) Kugenzura isazi y\'imbuto ukoresheje imitegekere n\'indwi zemewe. 6) Guhindura ibihingwa n\'ibindi bitigira indwara amezi 6-12. 7) Gutoza abakozi bose kuri amasomo yo kwirinda mikorobi. 8) Kumenyesha inzego zo kwita ku buhinzi ako kanya.',
    
    healthyDescription: 'Amakuru meza! Nta bimenyetso by\'indwara byagaragaye. Urutoki rwawe rumeze neza rufite ibara ry\'amababi ryiza, imiterere ikwiye, kandi nta bikoresho by\'indwara ebyiri mikorobi, ubwoko bwa fungus, cyangwa virusi. Ibi byerekana ko rwita neza kandi rufite ibidukikije byiza.',
    
    healthyTreatment: 'KWIRINDA: 1) Komeza gukurikirana buri cyumweru - reba ibihingwa umenye ibimenyetso by\'indwara. 2) Komeza intera zikwiye (metero 2-3 hagati y\'ibihingwa) kugira ngo umwuka unyure neza. 3) Ishyira ifumbire zitandukanye (NPK 15:15:15) buri mezi 3. 4) Menya neza ko amazi anyura neza - wirenga inzira z\'amazi. 5) Kuraho amababi yapfuye n\'intutsi buri gihe. 6) Koresha ibikoresho bioza, bicafuye mu bikorwa byose. 7) Koresha uburyo bwuzuye bwo kurwanya udukoko dutera indwara.',
    
    pestalotiopsisDescription: 'Pestalotiopsis ni indwara y\'agakoko k\'ubwoko bwa fungus iterwa na Pestalotiopsis palmarum n\'ubundi bwoko. Igaragara ku mababi mu buryo bw\'utwibutso two mu mukara twuzuye tufite umunyururu w\'icunga, cyane cyane mu gihe cy\'imvura. Indwara igabanya gufotosinteza, ikagendera imbaraga z\'igihingwa n\'ubwiza bw\'imbuto. Mu bihe bikomeye, irashobora gutera amababi kugwa hakiri kare n\'indwara z\'iyongera. Fungus ikunze cyane ubushuhe bugera ku 80% n\'ubushyuhe bwa 25-30°C.',
    
    pestalotiopsisTreatment: 'GUKEMURA AGAKOKO: 1) Kuraho no gusenya amababi yose yanduye ako kanya - yatwe cyangwa yashyingurwe kure y\'umurima. 2) Kwimakaza uburyo bwo gutuma umwuka unyura binyuze mu gutegura intera ikwiye no kuraho amababi yo hasi. 3) Gukoresha imiti yica agakoko ifite copper (Copper hydroxide 2g/L) buri munsi 14 mu gihe cy\'imvura. 4) Kwirengagiza guhira hejuru - koresha guhira gutunze. 5) Gukoresha ifumbire zikungahaye potassium kugira ngo igihingwa gikomeze. 6) Gukoresha imiti yica agakoko yo kwirinda mbere y\'imvura. 7) Menya ko amazi anyura neza kugira ngo ugabanye ubushuhe bw\'ubutaka hafi y\'igihingwa.',
    
    sigatokaDescription: 'Sigatoka (Mycosphaerella fijiensis) ni imwe mu ndwara zikomeye cyane z\'urutoki ku isi. Igaragara ku mababi mu buryo bw\'imirongo y\'icunga ihinduka igatunda n\'ibice bifite ibara ry\'ijimye. Indwara igabanya cyane gufotosinteza, bigatuma imbuto zitimba hakiri kare, umusaruro ugabanuka (kugeza ku 50%), n\'ubwiza bw\'imbuto buke. Yandurira vuba binyuze mu myuka, cyane cyane mugihe cyubushuhe hamwe n\'ubushyuhe bwa 26-28°C.',
    
    sigatokaTreatment: 'GUFATA INGAMBA ZIHUTIRWA: 1) Gushyira mu nzira gahunda yo gufunga imiti yica agakoko buri cyumweru ukoresheje imiti yinjira mu gihingwa (Propiconazole 0.1% cyangwa Azoxystrobin 0.2%). 2) Kuraho ako kanya amababi yanduye cyane - kata nibura centimetre 15 munsi y\'ibimenyetso bigaragara. 3) Gukoresha tekinike yo gusasa amababi kugira ngo imiti igere neza. 4) Komeza isuku nziza yo ku murima - kuraho amababi yaguye n\'ibinyampeke. 5) Gukoresha ubwoko butagira indwara mugihe cyo gusimbura (FHIA-20, FHIA-23). 6) Kwimakaza gushonga mu murima no kugabanya ubwinshi bw\'ibihingwa. 7) Gukurikirana ikirere no kongera gufunga imiti mugihe cyubushuhe.',
    
    // Ubutumwa bw\'Ifoto Yanzwe
    imageRejected: 'Ifoto Ntabwo Ikwiye',
    rejectionMessage: 'Iyi foto ntabwo isa n\'ikibabi cy\'urutoki. Nyamuneka ohereze ifoto itoya yikibabi cyurutoki kugira ngo dusuzume indwara.',
    rejectionReasons: 'Ibibazo Byihariye',
    technicalDetails: 'Reba Ibisobanuro by\'Ubuhanga',
    rejectionTips: {
      title: '💡 Inama zo Kubona Ibisubizo Byiza',
      tip1: '• Koresha amafoto mashya, yatanze mu mucyo w\'urutoki',
      tip2: '• Menya ko ikibabi kizuza hafi ikigereranyo cyose cy\'ifoto',
      tip3: '• Wirengagiza amafoto afite igisonga cyangwa adafite kigufi neza',
      tip4: '• Menya ko ari ikibabi cy\'urutoki rwose',
      tip5: '• Fata amafoto mu mucyo w\'umusi kugira ngo ubone ibisubizo byiza',
      tip6: '• Siga umwanya wa camera mbere yo gufata amafoto',
    },
    
    // Ubutumwa bw\'Imenyesha
    notifications: {
      healthyDetected: 'Ikibabi Kimeze Neza Kyagaragaye!',
      diseaseDetected: 'Indwara Yagaragaye',
      urgentDisease: 'Indwara Yagaragaye - Byihutirwa!',
      urgentMessage: 'bisaba kwita byihutirwa',
      imageRejected: 'Ifoto Yanzwe',
      analysisComplete: 'Isuzuma Ryarangiye!',
      audioPlaying: 'Inyito Irimo Gusoma',
      audioError: 'Ikosa ry\'Inyito',
      speechError: 'Ikosa ry\'Imvugo',
    },
    
    permissions: {
      cameraRequired: 'Uburenganzira bwa camera bukenewe kugira ngo ukoreshe iyi porogaramu',
      mediaTitle: 'Uburenganzira bw\'Ububiko bw\'Amafoto',
      mediaMessage: 'Uburenganzira bwo kugera ku bubiko bw\'amashusho bukenewe kugira ngo uhitemo amashusho',
    },
    errors: {
      cameraError: 'Ntibishobotse gufata ifoto. Ongera ugerageze.',
      galleryError: 'Ntibishobotse guhitamo ishusho. Ongera ugerageze.',
      analyzeError: 'Ntibishobotse gusuzuma ishusho. Ongera ugerageze.',
      analysisFailedNetwork: 'Isuzuma Ryaranerwe. Nyamuneka reba ukoresha internet kandi wongere ugerageze.',
    },
    instructions: {
      capture: 'Fata ifoto y\'ikibabi cy\'urutoki ukoreshe ubushakashatsi bwa AI kugira ngo umenyekane indwara',
    },
    buttons: {
      camera: 'Camera',
      gallery: 'Amafoto',
      takeAnother: 'Fata Indi Foto',
      moreInfo: 'Amakuru Arambuye',
      selectNewImage: 'Hitamo Ifoto Nshya',
      tryAgain: 'Ongera Ugerageze',
    },
    results: {
      title: 'Ibisubizo by\'Isuzuma',
      confidence: 'Ikizere',
      description: 'Ibisobanuro',
      treatment: 'Inama y\'Ikiza',
      aiPowered: 'Byakoreshejwe AI',
      certainty: 'Ukuri',
      urgent: 'BYIHUTIRWA',
    },
    about: {
      title: 'Ibyerekeye Iyi Porogaramu',
      description: 'Iyi porogaramu ikoresha ubwenge bukomeye bw\'ikoranabuhanga no kwiga kwa mashini kugira ngo imenyekane indwara z\'urutoki mu gihe nyacyo bikorwa n\'ukuri gukomeye. Ishobora kumenya indwara zitandukanye zirimo Banana Xanthomonas Wilt, Black Sigatoka, na Pestalotiopsis, igatanga inama z\'ikiza ako kanya kugira ngo ibare abahinzi kurinda imyaka yabo no kongera umusaruro.',
    },
    stats: {
      title: 'Imibare Yihuse',
      totalScans: 'Isuzuma Ryose',
      healthy: 'Bimeze Neza',
      diseases: 'Indwara',
    },
  },
  
  fr: {
    appTitle: 'Banana-Guard',
    loading: 'Chargement de la caméra...',
    analyzing: 'Analyse de l\'image...',
    
    // Noms des Maladies
    kirabiranya: 'Flétrissement Bactérien du Bananier (FBB)',
    
    // Descriptions Détaillées des Maladies
    cordanadescription: 'Le Flétrissement Bactérien du Bananier (FBB) est une maladie bactérienne dévastatrice causée par Xanthomonas campestris pv. musacearum. Elle affecte le système vasculaire des bananiers, provoquant le jaunissement et le flétrissement des feuilles, une maturation prématurée et la pourriture des fruits, et la mort complète de la plante. La maladie se propage rapidement par des outils agricoles contaminés, des rejets infectés, des insectes (surtout les mouches des fruits), et le contact direct entre plantes. Les premiers symptômes incluent le jaunissement des jeunes feuilles, le flétrissement pendant les périodes chaudes, et un exsudat bactérien des tiges coupées.',
    
    cordanatreatment: 'ACTION IMMÉDIATE REQUISE: 1) Déraciner et brûler TOUTES les plantes infectées complètement - y compris les racines et le sol environnant. 2) Désinfecter tous les outils agricoles avec de l\'alcool à 70% ou une solution de javel après chaque utilisation. 3) Établir une zone de quarantaine de 3 mètres autour des zones affectées. 4) Utiliser uniquement des plants certifiés exempts de maladie. 5) Contrôler les mouches des fruits avec des pièges et insecticides approuvés. 6) Pratiquer la rotation des cultures avec des plantes non-hôtes pendant 6-12 mois. 7) Former tous les ouvriers agricoles aux protocoles de sanitation appropriés. 8) Signaler immédiatement l\'épidémie aux autorités agricoles locales.',
    
    healthyDescription: 'Excellente nouvelle! Aucun symptôme de maladie détecté. Votre bananier semble en bonne santé avec une bonne couleur des feuilles, une structure appropriée, et aucun signe visible d\'infections bactériennes, fongiques ou virales. Cela indique des soins appropriés et des conditions de croissance favorables.',
    
    healthyTreatment: 'SOINS PRÉVENTIFS: 1) Continuez la surveillance régulière - inspectez les plantes chaque semaine pour détecter les premiers signes de maladie. 2) Maintenez un espacement approprié (2-3 mètres entre les plantes) pour une bonne circulation d\'air. 3) Appliquez un engrais équilibré (NPK 15:15:15) tous les 3 mois. 4) Assurez un bon drainage - évitez les conditions gorgées d\'eau. 5) Retirez régulièrement les feuilles mortes et les rejets. 6) Utilisez des outils propres et désinfectés pour toutes les opérations agricoles. 7) Pratiquez la gestion intégrée des ravageurs pour contrôler les insectes qui propagent les maladies.',
    
    pestalotiopsisDescription: 'La Tache Foliaire à Pestalotiopsis est une maladie fongique causée par Pestalotiopsis palmarum et espèces apparentées. Elle apparaît sous forme de taches circulaires brun foncé à noires avec des halos jaunes sur les feuilles, particulièrement pendant les saisons humides. La maladie affecte la photosynthèse des feuilles, réduisant la vigueur de la plante et la qualité des fruits. Dans les cas graves, elle peut causer une défoliation prématurée et des infections secondaires. Le champignon prospère dans une humidité élevée (>80%) et des températures entre 25-30°C.',
    
    pestalotiopsisTreatment: 'GESTION FONGIQUE: 1) Retirer et détruire immédiatement toutes les feuilles infectées - les brûler ou les enterrer loin de la plantation. 2) Améliorer la circulation d\'air par un espacement approprié des plantes et l\'enlèvement des feuilles inférieures. 3) Appliquer des fongicides à base de cuivre (Hydroxyde de cuivre 2g/L) tous les 14 jours pendant les saisons humides. 4) Éviter l\'irrigation par aspersion - utiliser l\'irrigation goutte à goutte à la place. 5) Appliquer des engrais riches en potassium pour renforcer la résistance des plantes. 6) Utiliser des fongicides protecteurs avant les saisons pluvieuses. 7) Assurer un bon drainage pour réduire l\'humidité du sol autour de la base des plantes.',
    
    sigatokaDescription: 'La Sigatoka Noire (Mycosphaerella fijiensis) est l\'une des maladies les plus destructrices du bananier au monde. Elle apparaît sous forme de stries jaunes qui se développent en taches brunes avec des centres gris et des bordures sombres sur les feuilles. La maladie réduit sévèrement la surface photosynthétique, entraînant une maturation prématurée des fruits, une réduction du poids des régimes (jusqu\'à 50% de perte de rendement), et une mauvaise qualité des fruits. Elle se propage rapidement par les spores aéroportées, surtout pendant les conditions humides avec des températures de 26-28°C.',
    
    sigatokaTreatment: 'GESTION URGENTE REQUISE: 1) Mettre en place un programme de pulvérisation fongicide hebdomadaire utilisant des fongicides systémiques (Propiconazole 0.1% ou Azoxystrobin 0.2%). 2) Retirer immédiatement les feuilles fortement infectées - couper au moins 15cm sous les symptômes visibles. 3) Appliquer des techniques de marquage des feuilles pour améliorer la couverture de pulvérisation. 4) Maintenir une bonne sanitation du champ - retirer les feuilles tombées et les débris végétaux. 5) Utiliser des variétés résistantes lors de la replantation (FHIA-20, FHIA-23). 6) Améliorer le drainage du champ et réduire la densité des plantes. 7) Surveiller les conditions météorologiques et augmenter la fréquence de pulvérisation pendant les périodes humides.',
    
    // Messages de Rejet d\'Image
    imageRejected: 'Image Non Appropriée',
    rejectionMessage: 'Cette image ne semble pas être une feuille de bananier. Veuillez télécharger une image claire d\'une feuille de bananier pour l\'analyse des maladies.',
    rejectionReasons: 'Problèmes Spécifiques',
    technicalDetails: 'Voir les Détails Techniques',
    rejectionTips: {
      title: '💡 Conseils pour de Meilleurs Résultats',
      tip1: '• Utilisez des images claires et bien éclairées de feuilles de bananier',
      tip2: '• Assurez-vous que la feuille remplit la majeure partie du cadre',
      tip3: '• Évitez les images floues ou hors focus',
      tip4: '• Assurez-vous que c\'est vraiment une feuille de bananier',
      tip5: '• Prenez des photos pendant la journée pour de meilleurs résultats',
      tip6: '• Nettoyez l\'objectif de l\'appareil photo avant de prendre des photos',
    },
    
    // Messages de Notification
    notifications: {
      healthyDetected: 'Feuille Saine Détectée!',
      diseaseDetected: 'Maladie Détectée',
      urgentDisease: 'Maladie Détectée - Urgent!',
      urgentMessage: 'nécessite une attention immédiate',
      imageRejected: 'Image Rejetée',
      analysisComplete: 'Analyse Terminée!',
      audioPlaying: 'Audio en Lecture',
      audioError: 'Erreur Audio',
      speechError: 'Erreur de Parole',
    },
    
    permissions: {
      cameraRequired: 'L\'autorisation de la caméra est nécessaire pour utiliser cette application',
      mediaTitle: 'Autorisation de la Médiathèque',
      mediaMessage: 'L\'autorisation d\'accéder à la médiathèque est nécessaire pour sélectionner des images',
    },
    errors: {
      cameraError: 'Échec de la prise de photo. Veuillez réessayer.',
      galleryError: 'Échec de la sélection de l\'image. Veuillez réessayer.',
      analyzeError: 'Échec de l\'analyse de l\'image. Veuillez réessayer.',
      analysisFailedNetwork: 'Analyse Échouée. Veuillez vérifier votre connexion Internet et réessayer.',
    },
    instructions: {
      capture: 'Prenez une photo d\'une feuille de bananier pour détecter les maladies en utilisant l\'analyse alimentée par l\'IA',
    },
    buttons: {
      camera: 'Caméra',
      gallery: 'Galerie',
      takeAnother: 'Prendre une Autre Photo',
      moreInfo: 'Plus d\'Informations',
      selectNewImage: 'Sélectionner une Nouvelle Image',
      tryAgain: 'Réessayer',
    },
    results: {
      title: 'Résultats de la Détection',
      confidence: 'Confiance',
      description: 'Description',
      treatment: 'Recommandation de Traitement',
      aiPowered: 'Alimenté par l\'IA',
      certainty: 'Certitude',
      urgent: 'URGENT',
    },
    about: {
      title: 'À Propos de Cette Application',
      description: 'Cette application utilise l\'intelligence artificielle avancée et l\'apprentissage automatique pour détecter les maladies du bananier en temps réel avec une grande précision. Elle peut identifier plusieurs maladies, notamment le Flétrissement Bactérien du Bananier, la Sigatoka Noire, et Pestalotiopsis, fournissant des recommandations de traitement instantanées pour aider les agriculteurs à protéger leurs cultures et maximiser les rendements.',
    },
    stats: {
      title: 'Statistiques Rapides',
      totalScans: 'Analyses Totales',
      healthy: 'Saines',
      diseases: 'Maladies',
    },
  },
};

// Create i18n instance
const i18n = new I18n(translations);

// Set the locale once at the beginning of your app
const deviceLocales = getLocales();
   const deviceLanguage = deviceLocales[0]?.languageCode || 'en';
   i18n.locale = deviceLanguage;
// When a key is missing from a language, it will fallback to another language with the key defined
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;
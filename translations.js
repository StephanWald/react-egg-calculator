// Internationalization for Egg Calculator
// Supported languages: English, German, French, Spanish, Italian, Portuguese

export const translations = {
  en: {
    // Header
    title: 'Egg Calculator',
    subtitle: 'Physically accurate with air pressure & thermodynamics',

    // Settings panel
    settingsToggle: 'Household Settings',
    settingsTitle: 'Household Settings',
    settingsHint: 'These settings can be saved for your household.',

    // Stove types
    stoveType: 'Stove Type',
    stoveInduction: 'Induction',
    stoveCeramic: 'Ceramic',
    stoveElectric: 'Cast Iron',
    stoveGas: 'Gas',
    stoveCamping: 'Camping',

    // Stove power
    stovePower: 'Stove Power',
    stovePowerWeak: 'weak',
    stovePowerStrong: 'strong',

    // Pot
    potMaterial: 'Pot Material',
    potWeight: 'Pot Weight',
    materialSteel: 'Stainless Steel',
    materialAluminum: 'Aluminum',
    materialCastIron: 'Cast Iron',
    materialCopper: 'Copper',
    materialCeramic: 'Ceramic',

    // Temperatures
    temperatures: 'Temperatures',
    waterTemp: 'Water Temperature',
    waterTempHint: 'Tap/spring water at start',
    waterTempCold: 'Stream',
    waterTempWarm: 'Warm',
    ambientTemp: 'Ambient Temperature',
    ambientTempHint: 'Air at cooking location',
    ambientWinter: 'Winter',
    ambientSummer: 'Summer',
    coldWeatherWarning: 'In cold + gas/camping: High heat losses! Recovery after adding eggs takes much longer.',

    // Main result
    cookingTime: 'Cooking Time',
    idealCase: 'Ideal case',

    // Temperature drop warning
    tempDropWarning: 'Water cools by',
    tempDropUnit: 'when adding eggs',
    effectiveTemp: 'Effective temperature',

    // Location & Pressure
    locationPressure: 'Location & Air Pressure',
    detectingLocation: 'Detecting...',
    gpsWeather: 'GPS + Weather',
    airPressure: 'Air Pressure',
    boilingPoint: 'Boiling Point',
    altitudeApprox: 'Altitude (approx.)',
    currentPressureSource: 'Current air pressure from Open-Meteo',
    locationDenied: 'Location access denied',
    positionUnavailable: 'Position unavailable',
    weatherDataUnavailable: 'Weather data unavailable',
    locationError: 'Error determining location',

    // Consistency
    consistency: 'Desired Consistency',
    consistencySoft: 'Soft',
    consistencyMedium: 'Medium-Soft',
    consistencyHardMedium: 'Medium',
    consistencyHard: 'Hard',

    // Egg count & water
    eggCount: 'Number of Eggs',
    waterVolume: 'Water',

    // Egg size
    eggSize: 'Egg Size',

    // Start temperature
    startTemp: 'Egg Starting Temperature',
    tempFridge: 'Refrigerator',
    tempCool: 'Cool',
    tempRoom: 'Room Temp.',

    // Notices
    noticeImportant: 'Important',
    noticeCoverage: 'All eggs must be fully covered with water (at least 2 cm).',
    noticeLid: 'Cook with a lid!',
    noticeLidHint: 'Saves energy and keeps temperature stable.',

    // Energy section
    showEnergy: 'Show energy consumption',
    energyTitle: 'Energy Consumption',
    heatingPhase: 'Heating',
    totalEnergy: 'Total Energy',
    atPower: 'at',
    includesHeatLoss: 'Incl. increased heat losses at',
    ambient: 'ambient',

    // Formula section
    showFormulas: 'Show formulas',
    formulasTitle: 'Physical Model',
    formulaBoiling: 'Boiling point from air pressure (Clausius-Clapeyron):',
    formulaTempDrop: 'Temperature drop:',
    formulaWilliams: 'Williams formula:',

    // Footer
    footer: 'Williams Formula · Clausius-Clapeyron · Open-Meteo API',

    // Config Dialog
    configDialogTitle: 'Settings',
    configTempUnit: 'Temperature Unit',
    configVolumeUnit: 'Volume Unit',
    configWeightUnit: 'Weight Unit',
    configLanguage: 'Language',

    // Timer
    timerStart: 'Start Timer',
    timerStop: 'Stop Timer',
    timerRunning: 'Timer Running',
    timerRemaining: 'Time Remaining',
    timerPause: 'Pause',
    timerResume: 'Resume',
    timerComplete: 'Time\'s Up!',
    timerDismiss: 'Done',
    notificationTitle: 'Eggs are ready!',
    notificationBody: 'Your perfectly cooked eggs are done. Remove them from the water now!',
    notificationPermissionDenied: 'Notification permission denied. Please enable notifications in your browser settings.',
  },

  de: {
    // Header
    title: 'Eier-Rechner',
    subtitle: 'Physikalisch korrekt mit Luftdruck & Thermodynamik',

    // Settings panel
    settingsToggle: 'Haushalt-Einstellungen',
    settingsTitle: 'Haushalt-Einstellungen',
    settingsHint: 'Diese Einstellungen können für Ihren Haushalt gespeichert werden.',

    // Stove types
    stoveType: 'Herdtyp',
    stoveInduction: 'Induktion',
    stoveCeramic: 'Ceran',
    stoveElectric: 'Gusseisen',
    stoveGas: 'Gas',
    stoveCamping: 'Camping',

    // Stove power
    stovePower: 'Herdleistung',
    stovePowerWeak: 'schwach',
    stovePowerStrong: 'stark',

    // Pot
    potMaterial: 'Topfmaterial',
    potWeight: 'Topfgewicht',
    materialSteel: 'Edelstahl',
    materialAluminum: 'Aluminium',
    materialCastIron: 'Gusseisen',
    materialCopper: 'Kupfer',
    materialCeramic: 'Keramik',

    // Temperatures
    temperatures: 'Temperaturen',
    waterTemp: 'Wassertemperatur',
    waterTempHint: 'Leitungs-/Quellwasser zu Beginn',
    waterTempCold: 'Bach',
    waterTempWarm: 'Warm',
    ambientTemp: 'Umgebungstemperatur',
    ambientTempHint: 'Luft am Kochort',
    ambientWinter: 'Winter',
    ambientSummer: 'Sommer',
    coldWeatherWarning: 'Bei Kälte + Gas/Camping: Hohe Wärmeverluste! Recovery nach Ei-Einlegen dauert deutlich länger.',

    // Main result
    cookingTime: 'Kochzeit',
    idealCase: 'Idealfall',

    // Temperature drop warning
    tempDropWarning: 'Wasser kühlt um',
    tempDropUnit: 'ab beim Einlegen',
    effectiveTemp: 'Effektive Temperatur',

    // Location & Pressure
    locationPressure: 'Standort & Luftdruck',
    detectingLocation: 'Ermittle...',
    gpsWeather: 'GPS + Wetter',
    airPressure: 'Luftdruck',
    boilingPoint: 'Siedepunkt',
    altitudeApprox: 'Höhe (ca.)',
    currentPressureSource: 'Aktueller Luftdruck von Open-Meteo',
    locationDenied: 'Standortzugriff verweigert',
    positionUnavailable: 'Position nicht verfügbar',
    weatherDataUnavailable: 'Wetterdaten nicht verfügbar',
    locationError: 'Fehler bei Standortermittlung',

    // Consistency
    consistency: 'Gewünschte Konsistenz',
    consistencySoft: 'Weich',
    consistencyMedium: 'Wachsweich',
    consistencyHardMedium: 'Mittel',
    consistencyHard: 'Hart',

    // Egg count & water
    eggCount: 'Anzahl Eier',
    waterVolume: 'Wasser',

    // Egg size
    eggSize: 'Eigröße',

    // Start temperature
    startTemp: 'Starttemperatur Ei',
    tempFridge: 'Kühlschrank',
    tempCool: 'Kühl',
    tempRoom: 'Zimmertemp.',

    // Notices
    noticeImportant: 'Wichtig',
    noticeCoverage: 'Alle Eier müssen vollständig mit Wasser bedeckt sein (mind. 2 cm).',
    noticeLid: 'Mit Deckel kochen!',
    noticeLidHint: 'Spart Energie und hält die Temperatur stabil.',

    // Energy section
    showEnergy: 'Energiebedarf anzeigen',
    energyTitle: 'Energiebedarf',
    heatingPhase: 'Aufheizen',
    totalEnergy: 'Gesamtenergie',
    atPower: 'bei',
    includesHeatLoss: 'Inkl. erhöhte Wärmeverluste bei',
    ambient: 'Umgebung',

    // Formula section
    showFormulas: 'Formeln anzeigen',
    formulasTitle: 'Physikalisches Modell',
    formulaBoiling: 'Siedepunkt aus Luftdruck (Clausius-Clapeyron):',
    formulaTempDrop: 'Temperatur-Drop:',
    formulaWilliams: 'Williams-Formel:',

    // Footer
    footer: 'Williams-Formel · Clausius-Clapeyron · Open-Meteo API',

    // Config Dialog
    configDialogTitle: 'Einstellungen',
    configTempUnit: 'Temperatureinheit',
    configVolumeUnit: 'Volumeneinheit',
    configWeightUnit: 'Gewichtseinheit',
    configLanguage: 'Sprache',

    // Timer
    timerStart: 'Timer starten',
    timerStop: 'Timer stoppen',
    timerRunning: 'Timer läuft',
    timerRemaining: 'Verbleibende Zeit',
    timerPause: 'Pause',
    timerResume: 'Fortsetzen',
    timerComplete: 'Zeit ist um!',
    timerDismiss: 'Fertig',
    notificationTitle: 'Eier sind fertig!',
    notificationBody: 'Ihre perfekt gekochten Eier sind fertig. Nehmen Sie sie jetzt aus dem Wasser!',
    notificationPermissionDenied: 'Benachrichtigungsberechtigung verweigert. Bitte aktivieren Sie Benachrichtigungen in Ihren Browser-Einstellungen.',
  },

  fr: {
    // Header
    title: 'Calculateur d\'Œufs',
    subtitle: 'Physiquement précis avec pression atmosphérique & thermodynamique',

    // Settings panel
    settingsToggle: 'Paramètres du foyer',
    settingsTitle: 'Paramètres du foyer',
    settingsHint: 'Ces paramètres peuvent être enregistrés pour votre foyer.',

    // Stove types
    stoveType: 'Type de cuisinière',
    stoveInduction: 'Induction',
    stoveCeramic: 'Vitrocéramique',
    stoveElectric: 'Fonte',
    stoveGas: 'Gaz',
    stoveCamping: 'Camping',

    // Stove power
    stovePower: 'Puissance',
    stovePowerWeak: 'faible',
    stovePowerStrong: 'forte',

    // Pot
    potMaterial: 'Matériau casserole',
    potWeight: 'Poids casserole',
    materialSteel: 'Inox',
    materialAluminum: 'Aluminium',
    materialCastIron: 'Fonte',
    materialCopper: 'Cuivre',
    materialCeramic: 'Céramique',

    // Temperatures
    temperatures: 'Températures',
    waterTemp: 'Température eau',
    waterTempHint: 'Eau du robinet/source au départ',
    waterTempCold: 'Ruisseau',
    waterTempWarm: 'Tiède',
    ambientTemp: 'Température ambiante',
    ambientTempHint: 'Air au lieu de cuisson',
    ambientWinter: 'Hiver',
    ambientSummer: 'Été',
    coldWeatherWarning: 'Par froid + gaz/camping : Pertes de chaleur élevées ! La récupération après ajout des œufs prend beaucoup plus de temps.',

    // Main result
    cookingTime: 'Temps de cuisson',
    idealCase: 'Cas idéal',

    // Temperature drop warning
    tempDropWarning: 'L\'eau refroidit de',
    tempDropUnit: 'lors de l\'ajout',
    effectiveTemp: 'Température effective',

    // Location & Pressure
    locationPressure: 'Position & Pression atmosphérique',
    detectingLocation: 'Détection...',
    gpsWeather: 'GPS + Météo',
    airPressure: 'Pression atm.',
    boilingPoint: 'Point d\'ébullition',
    altitudeApprox: 'Altitude (env.)',
    currentPressureSource: 'Pression actuelle via Open-Meteo',
    locationDenied: 'Accès position refusé',
    positionUnavailable: 'Position indisponible',
    weatherDataUnavailable: 'Données météo indisponibles',
    locationError: 'Erreur de localisation',

    // Consistency
    consistency: 'Consistance souhaitée',
    consistencySoft: 'Mollet',
    consistencyMedium: 'Mi-mollet',
    consistencyHardMedium: 'Moyen',
    consistencyHard: 'Dur',

    // Egg count & water
    eggCount: 'Nombre d\'œufs',
    waterVolume: 'Eau',

    // Egg size
    eggSize: 'Taille œuf',

    // Start temperature
    startTemp: 'Température initiale œuf',
    tempFridge: 'Réfrigérateur',
    tempCool: 'Frais',
    tempRoom: 'Temp. amb.',

    // Notices
    noticeImportant: 'Important',
    noticeCoverage: 'Tous les œufs doivent être entièrement recouverts d\'eau (au moins 2 cm).',
    noticeLid: 'Cuisiner avec couvercle !',
    noticeLidHint: 'Économise l\'énergie et maintient la température stable.',

    // Energy section
    showEnergy: 'Afficher consommation énergie',
    energyTitle: 'Consommation d\'énergie',
    heatingPhase: 'Chauffage',
    totalEnergy: 'Énergie totale',
    atPower: 'à',
    includesHeatLoss: 'Incl. pertes de chaleur accrues à',
    ambient: 'ambiant',

    // Formula section
    showFormulas: 'Afficher formules',
    formulasTitle: 'Modèle physique',
    formulaBoiling: 'Point d\'ébullition selon pression (Clausius-Clapeyron) :',
    formulaTempDrop: 'Chute de température :',
    formulaWilliams: 'Formule de Williams :',

    // Footer
    footer: 'Formule de Williams · Clausius-Clapeyron · API Open-Meteo',

    // Config Dialog
    configDialogTitle: 'Paramètres',
    configTempUnit: 'Unité de température',
    configVolumeUnit: 'Unité de volume',
    configWeightUnit: 'Unité de poids',
    configLanguage: 'Langue',

    // Timer
    timerStart: 'Démarrer le minuteur',
    timerStop: 'Arrêter le minuteur',
    timerRunning: 'Minuteur en cours',
    timerRemaining: 'Temps restant',
    timerPause: 'Pause',
    timerResume: 'Reprendre',
    timerComplete: 'C\'est prêt !',
    timerDismiss: 'Terminé',
    notificationTitle: 'Les œufs sont prêts !',
    notificationBody: 'Vos œufs parfaitement cuits sont prêts. Retirez-les de l\'eau maintenant !',
    notificationPermissionDenied: 'Permission de notification refusée. Veuillez activer les notifications dans les paramètres de votre navigateur.',
  },

  es: {
    // Header
    title: 'Calculadora de Huevos',
    subtitle: 'Físicamente precisa con presión atmosférica y termodinámica',

    // Settings panel
    settingsToggle: 'Configuración del hogar',
    settingsTitle: 'Configuración del hogar',
    settingsHint: 'Estos ajustes se pueden guardar para su hogar.',

    // Stove types
    stoveType: 'Tipo de cocina',
    stoveInduction: 'Inducción',
    stoveCeramic: 'Vitrocerámica',
    stoveElectric: 'Hierro fundido',
    stoveGas: 'Gas',
    stoveCamping: 'Camping',

    // Stove power
    stovePower: 'Potencia',
    stovePowerWeak: 'baja',
    stovePowerStrong: 'alta',

    // Pot
    potMaterial: 'Material olla',
    potWeight: 'Peso olla',
    materialSteel: 'Acero inox.',
    materialAluminum: 'Aluminio',
    materialCastIron: 'Hierro fundido',
    materialCopper: 'Cobre',
    materialCeramic: 'Cerámica',

    // Temperatures
    temperatures: 'Temperaturas',
    waterTemp: 'Temperatura agua',
    waterTempHint: 'Agua del grifo/manantial al inicio',
    waterTempCold: 'Arroyo',
    waterTempWarm: 'Tibia',
    ambientTemp: 'Temperatura ambiente',
    ambientTempHint: 'Aire en el lugar de cocción',
    ambientWinter: 'Invierno',
    ambientSummer: 'Verano',
    coldWeatherWarning: 'Con frío + gas/camping: ¡Grandes pérdidas de calor! La recuperación tras añadir huevos tarda mucho más.',

    // Main result
    cookingTime: 'Tiempo de cocción',
    idealCase: 'Caso ideal',

    // Temperature drop warning
    tempDropWarning: 'El agua se enfría',
    tempDropUnit: 'al añadir huevos',
    effectiveTemp: 'Temperatura efectiva',

    // Location & Pressure
    locationPressure: 'Ubicación y Presión atmosférica',
    detectingLocation: 'Detectando...',
    gpsWeather: 'GPS + Clima',
    airPressure: 'Presión atm.',
    boilingPoint: 'Punto ebullición',
    altitudeApprox: 'Altitud (aprox.)',
    currentPressureSource: 'Presión actual de Open-Meteo',
    locationDenied: 'Acceso a ubicación denegado',
    positionUnavailable: 'Posición no disponible',
    weatherDataUnavailable: 'Datos meteorológicos no disponibles',
    locationError: 'Error al determinar ubicación',

    // Consistency
    consistency: 'Consistencia deseada',
    consistencySoft: 'Blando',
    consistencyMedium: 'Semi-blando',
    consistencyHardMedium: 'Medio',
    consistencyHard: 'Duro',

    // Egg count & water
    eggCount: 'Número de huevos',
    waterVolume: 'Agua',

    // Egg size
    eggSize: 'Tamaño huevo',

    // Start temperature
    startTemp: 'Temperatura inicial huevo',
    tempFridge: 'Nevera',
    tempCool: 'Fresco',
    tempRoom: 'Temp. amb.',

    // Notices
    noticeImportant: 'Importante',
    noticeCoverage: 'Todos los huevos deben estar completamente cubiertos de agua (mín. 2 cm).',
    noticeLid: '¡Cocinar con tapa!',
    noticeLidHint: 'Ahorra energía y mantiene la temperatura estable.',

    // Energy section
    showEnergy: 'Mostrar consumo energía',
    energyTitle: 'Consumo de energía',
    heatingPhase: 'Calentamiento',
    totalEnergy: 'Energía total',
    atPower: 'a',
    includesHeatLoss: 'Incl. mayores pérdidas de calor a',
    ambient: 'ambiente',

    // Formula section
    showFormulas: 'Mostrar fórmulas',
    formulasTitle: 'Modelo físico',
    formulaBoiling: 'Punto de ebullición según presión (Clausius-Clapeyron):',
    formulaTempDrop: 'Caída de temperatura:',
    formulaWilliams: 'Fórmula de Williams:',

    // Footer
    footer: 'Fórmula de Williams · Clausius-Clapeyron · API Open-Meteo',

    // Config Dialog
    configDialogTitle: 'Configuración',
    configTempUnit: 'Unidad de temperatura',
    configVolumeUnit: 'Unidad de volumen',
    configWeightUnit: 'Unidad de peso',
    configLanguage: 'Idioma',

    // Timer
    timerStart: 'Iniciar temporizador',
    timerStop: 'Detener temporizador',
    timerRunning: 'Temporizador en marcha',
    timerRemaining: 'Tiempo restante',
    timerPause: 'Pausar',
    timerResume: 'Reanudar',
    timerComplete: '¡Se acabó el tiempo!',
    timerDismiss: 'Listo',
    notificationTitle: '¡Los huevos están listos!',
    notificationBody: 'Sus huevos perfectamente cocidos están listos. ¡Retírelos del agua ahora!',
    notificationPermissionDenied: 'Permiso de notificación denegado. Por favor, active las notificaciones en la configuración de su navegador.',
  },

  it: {
    // Header
    title: 'Calcolatore Uova',
    subtitle: 'Fisicamente accurato con pressione atmosferica e termodinamica',

    // Settings panel
    settingsToggle: 'Impostazioni domestiche',
    settingsTitle: 'Impostazioni domestiche',
    settingsHint: 'Queste impostazioni possono essere salvate per la tua casa.',

    // Stove types
    stoveType: 'Tipo di fornello',
    stoveInduction: 'Induzione',
    stoveCeramic: 'Vetroceramica',
    stoveElectric: 'Ghisa',
    stoveGas: 'Gas',
    stoveCamping: 'Campeggio',

    // Stove power
    stovePower: 'Potenza',
    stovePowerWeak: 'bassa',
    stovePowerStrong: 'alta',

    // Pot
    potMaterial: 'Materiale pentola',
    potWeight: 'Peso pentola',
    materialSteel: 'Acciaio inox',
    materialAluminum: 'Alluminio',
    materialCastIron: 'Ghisa',
    materialCopper: 'Rame',
    materialCeramic: 'Ceramica',

    // Temperatures
    temperatures: 'Temperature',
    waterTemp: 'Temperatura acqua',
    waterTempHint: 'Acqua del rubinetto/sorgente all\'inizio',
    waterTempCold: 'Ruscello',
    waterTempWarm: 'Tiepida',
    ambientTemp: 'Temperatura ambiente',
    ambientTempHint: 'Aria nel luogo di cottura',
    ambientWinter: 'Inverno',
    ambientSummer: 'Estate',
    coldWeatherWarning: 'Con freddo + gas/campeggio: Alte perdite di calore! Il recupero dopo l\'aggiunta delle uova richiede molto più tempo.',

    // Main result
    cookingTime: 'Tempo di cottura',
    idealCase: 'Caso ideale',

    // Temperature drop warning
    tempDropWarning: 'L\'acqua si raffredda di',
    tempDropUnit: 'aggiungendo le uova',
    effectiveTemp: 'Temperatura effettiva',

    // Location & Pressure
    locationPressure: 'Posizione e Pressione atmosferica',
    detectingLocation: 'Rilevamento...',
    gpsWeather: 'GPS + Meteo',
    airPressure: 'Pressione atm.',
    boilingPoint: 'Punto ebollizione',
    altitudeApprox: 'Altitudine (ca.)',
    currentPressureSource: 'Pressione attuale da Open-Meteo',
    locationDenied: 'Accesso posizione negato',
    positionUnavailable: 'Posizione non disponibile',
    weatherDataUnavailable: 'Dati meteo non disponibili',
    locationError: 'Errore nella determinazione della posizione',

    // Consistency
    consistency: 'Consistenza desiderata',
    consistencySoft: 'Morbido',
    consistencyMedium: 'Barzotto',
    consistencyHardMedium: 'Medio',
    consistencyHard: 'Sodo',

    // Egg count & water
    eggCount: 'Numero di uova',
    waterVolume: 'Acqua',

    // Egg size
    eggSize: 'Dimensione uovo',

    // Start temperature
    startTemp: 'Temperatura iniziale uovo',
    tempFridge: 'Frigorifero',
    tempCool: 'Fresco',
    tempRoom: 'Temp. amb.',

    // Notices
    noticeImportant: 'Importante',
    noticeCoverage: 'Tutte le uova devono essere completamente coperte d\'acqua (almeno 2 cm).',
    noticeLid: 'Cuocere con coperchio!',
    noticeLidHint: 'Risparmia energia e mantiene stabile la temperatura.',

    // Energy section
    showEnergy: 'Mostra consumo energia',
    energyTitle: 'Consumo energetico',
    heatingPhase: 'Riscaldamento',
    totalEnergy: 'Energia totale',
    atPower: 'a',
    includesHeatLoss: 'Incl. maggiori perdite di calore a',
    ambient: 'ambiente',

    // Formula section
    showFormulas: 'Mostra formule',
    formulasTitle: 'Modello fisico',
    formulaBoiling: 'Punto di ebollizione dalla pressione (Clausius-Clapeyron):',
    formulaTempDrop: 'Calo di temperatura:',
    formulaWilliams: 'Formula di Williams:',

    // Footer
    footer: 'Formula di Williams · Clausius-Clapeyron · API Open-Meteo',

    // Config Dialog
    configDialogTitle: 'Impostazioni',
    configTempUnit: 'Unità di temperatura',
    configVolumeUnit: 'Unità di volume',
    configWeightUnit: 'Unità di peso',
    configLanguage: 'Lingua',

    // Timer
    timerStart: 'Avvia timer',
    timerStop: 'Ferma timer',
    timerRunning: 'Timer in corso',
    timerRemaining: 'Tempo rimanente',
    timerPause: 'Pausa',
    timerResume: 'Riprendi',
    timerComplete: 'Tempo scaduto!',
    timerDismiss: 'Fatto',
    notificationTitle: 'Le uova sono pronte!',
    notificationBody: 'Le tue uova perfettamente cotte sono pronte. Toglile dall\'acqua ora!',
    notificationPermissionDenied: 'Autorizzazione notifica negata. Si prega di abilitare le notifiche nelle impostazioni del browser.',
  },

  pt: {
    // Header
    title: 'Calculadora de Ovos',
    subtitle: 'Fisicamente precisa com pressão atmosférica e termodinâmica',

    // Settings panel
    settingsToggle: 'Configurações domésticas',
    settingsTitle: 'Configurações domésticas',
    settingsHint: 'Estas configurações podem ser guardadas para a sua casa.',

    // Stove types
    stoveType: 'Tipo de fogão',
    stoveInduction: 'Indução',
    stoveCeramic: 'Vitrocerâmica',
    stoveElectric: 'Ferro fundido',
    stoveGas: 'Gás',
    stoveCamping: 'Campismo',

    // Stove power
    stovePower: 'Potência',
    stovePowerWeak: 'fraca',
    stovePowerStrong: 'forte',

    // Pot
    potMaterial: 'Material panela',
    potWeight: 'Peso panela',
    materialSteel: 'Aço inox',
    materialAluminum: 'Alumínio',
    materialCastIron: 'Ferro fundido',
    materialCopper: 'Cobre',
    materialCeramic: 'Cerâmica',

    // Temperatures
    temperatures: 'Temperaturas',
    waterTemp: 'Temperatura água',
    waterTempHint: 'Água da torneira/nascente no início',
    waterTempCold: 'Ribeiro',
    waterTempWarm: 'Morna',
    ambientTemp: 'Temperatura ambiente',
    ambientTempHint: 'Ar no local de cozedura',
    ambientWinter: 'Inverno',
    ambientSummer: 'Verão',
    coldWeatherWarning: 'Com frio + gás/campismo: Grandes perdas de calor! A recuperação após adicionar ovos demora muito mais.',

    // Main result
    cookingTime: 'Tempo de cozedura',
    idealCase: 'Caso ideal',

    // Temperature drop warning
    tempDropWarning: 'A água arrefece',
    tempDropUnit: 'ao adicionar ovos',
    effectiveTemp: 'Temperatura efetiva',

    // Location & Pressure
    locationPressure: 'Localização e Pressão atmosférica',
    detectingLocation: 'A detetar...',
    gpsWeather: 'GPS + Meteorologia',
    airPressure: 'Pressão atm.',
    boilingPoint: 'Ponto ebulição',
    altitudeApprox: 'Altitude (aprox.)',
    currentPressureSource: 'Pressão atual do Open-Meteo',
    locationDenied: 'Acesso à localização negado',
    positionUnavailable: 'Posição indisponível',
    weatherDataUnavailable: 'Dados meteorológicos indisponíveis',
    locationError: 'Erro ao determinar localização',

    // Consistency
    consistency: 'Consistência desejada',
    consistencySoft: 'Mole',
    consistencyMedium: 'Cremoso',
    consistencyHardMedium: 'Médio',
    consistencyHard: 'Cozido',

    // Egg count & water
    eggCount: 'Número de ovos',
    waterVolume: 'Água',

    // Egg size
    eggSize: 'Tamanho ovo',

    // Start temperature
    startTemp: 'Temperatura inicial ovo',
    tempFridge: 'Frigorífico',
    tempCool: 'Fresco',
    tempRoom: 'Temp. amb.',

    // Notices
    noticeImportant: 'Importante',
    noticeCoverage: 'Todos os ovos devem estar completamente cobertos com água (mín. 2 cm).',
    noticeLid: 'Cozinhar com tampa!',
    noticeLidHint: 'Poupa energia e mantém a temperatura estável.',

    // Energy section
    showEnergy: 'Mostrar consumo energia',
    energyTitle: 'Consumo de energia',
    heatingPhase: 'Aquecimento',
    totalEnergy: 'Energia total',
    atPower: 'a',
    includesHeatLoss: 'Incl. maiores perdas de calor a',
    ambient: 'ambiente',

    // Formula section
    showFormulas: 'Mostrar fórmulas',
    formulasTitle: 'Modelo físico',
    formulaBoiling: 'Ponto de ebulição pela pressão (Clausius-Clapeyron):',
    formulaTempDrop: 'Queda de temperatura:',
    formulaWilliams: 'Fórmula de Williams:',

    // Footer
    footer: 'Fórmula de Williams · Clausius-Clapeyron · API Open-Meteo',

    // Config Dialog
    configDialogTitle: 'Configurações',
    configTempUnit: 'Unidade de temperatura',
    configVolumeUnit: 'Unidade de volume',
    configWeightUnit: 'Unidade de peso',
    configLanguage: 'Idioma',

    // Timer
    timerStart: 'Iniciar temporizador',
    timerStop: 'Parar temporizador',
    timerRunning: 'Temporizador em execução',
    timerRemaining: 'Tempo restante',
    timerPause: 'Pausar',
    timerResume: 'Retomar',
    timerComplete: 'Tempo esgotado!',
    timerDismiss: 'Concluído',
    notificationTitle: 'Os ovos estão prontos!',
    notificationBody: 'Os seus ovos perfeitamente cozidos estão prontos. Retire-os da água agora!',
    notificationPermissionDenied: 'Permissão de notificação negada. Por favor, ative as notificações nas configurações do seu navegador.',
  },
};

// Language metadata for the language picker
export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

// Detect browser language and return best match
export function detectLanguage() {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  const baseLang = browserLang.split('-')[0].toLowerCase();

  // Check if we support this language
  if (translations[baseLang]) {
    return baseLang;
  }

  // Default to English
  return 'en';
}

// Get translation function for a specific language
export function getTranslator(lang) {
  const strings = translations[lang] || translations.en;
  return (key) => strings[key] || translations.en[key] || key;
}

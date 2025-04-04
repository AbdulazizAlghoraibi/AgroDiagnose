"""
This module provides translations of plant disease class names from English to Arabic.
"""

# Dictionary mapping English disease names to their Arabic translations
disease_translations = {
    "Apple_scab": "جرب التفاح",
    "Black_rot": "العفن الأسود",
    "Cedar_apple_rust": "صدأ التفاح السيدار",
    "healthy": "سليم",
    "Powdery_mildew": "البياض الدقيقي",
    "Cercospora_leaf_spot Gray_leaf_spot": "تبقع الأوراق السيركوسبورا والتبقع الرمادي",
    "Common_rust": "الصدأ الشائع",
    "Northern_Leaf_Blight": "لفحة الأوراق الشمالية",
    "Esca_(Black_Measles)": "الإسكا (الحصبة السوداء)",
    "Leaf_blight_(Isariopsis_Leaf_Spot)": "لفحة الأوراق (تبقع الأوراق الإيزاريوبسيس)",
    "Haunglongbing_(Citrus_greening)": "هوانجلونجبينج (اخضرار الحمضيات)",
    "Bacterial_spot": "التبقع البكتيري",
    "Early_blight": "اللفحة المبكرة",
    "Late_blight": "اللفحة المتأخرة",
    "Leaf_Mold": "عفن الأوراق",
    "Septoria_leaf_spot": "تبقع الأوراق السبتوريا",
    "Spider_mites Two-spotted_spider_mite": "العناكب ذات البقعتين",
    "Target_Spot": "البقعة المستهدفة",
    "Tomato_Yellow_Leaf_Curl_Virus": "فيروس تجعد وإصفرار أوراق الطماطم",
    "Tomato_mosaic_virus": "فيروس موزاييك الطماطم",
    "Leaf_scorch": "لفحة الأوراق"
}

# Plant types translation
plant_translations = {
    "Apple": "تفاح",
    "Blueberry": "توت أزرق",
    "Cherry": "كرز",
    "Corn": "ذرة",
    "Grape": "عنب",
    "Orange": "برتقال",
    "Peach": "خوخ",
    "Pepper_bell": "فلفل",
    "Potato": "بطاطس",
    "Raspberry": "توت العليق",
    "Soybean": "فول الصويا",
    "Squash": "قرع",
    "Strawberry": "فراولة",
    "Tomato": "طماطم"
}

def translate_class_name(class_name):
    """
    Translate a class name from the format Plant___Disease to Arabic.
    Returns both the formatted English name and Arabic translation.
    
    Args:
        class_name (str): The original class name in format like 'Tomato___Early_blight'
        
    Returns:
        tuple: (formatted_english, arabic_translation)
    """
    if "___" not in class_name:
        return class_name, class_name  # No translation available
    
    # Split the class name into plant and disease parts
    parts = class_name.split("___")
    plant = parts[0]
    disease = parts[1]
    
    # Format English name more nicely
    formatted_english = f"{plant.replace('_', ' ')} - {disease.replace('_', ' ')}"
    
    # Translate to Arabic
    plant_ar = plant_translations.get(plant.replace("_(maize)", "").replace("_(including_sour)", ""), plant)
    
    # Extract the main disease name from combined names
    disease_key = disease
    for key in disease_translations.keys():
        if key in disease:
            disease_key = key
            break
    
    disease_ar = disease_translations.get(disease_key, disease)
    
    # Format the Arabic name (disease name first, then plant name)
    if disease_ar == "سليم":
        arabic_translation = f"{plant_ar} {disease_ar}"
    else:
        arabic_translation = f"{disease_ar} في {plant_ar}"
    
    return formatted_english, arabic_translation
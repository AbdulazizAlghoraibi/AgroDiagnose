"""
This module provides translations of plant disease class names from English to Arabic.
"""

def translate_class_name(class_name):
    """
    Translate a class name from the format Plant___Disease to Arabic.
    Returns both the formatted English name and Arabic translation.
    
    Args:
        class_name (str): The original class name in format like 'Tomato___Early_blight'
        
    Returns:
        tuple: (formatted_english, arabic_translation)
    """
    # Translation dictionary for plant names
    plant_translations = {
        "Apple": "تفاح",
        "Blueberry": "توت أزرق",
        "Cherry": "كرز",
        "Corn": "ذرة",
        "Grape": "عنب",
        "Orange": "برتقال",
        "Peach": "خوخ",
        "Pepper": "فلفل",
        "Potato": "بطاطس",
        "Raspberry": "توت العليق",
        "Soybean": "فول الصويا",
        "Squash": "قرع",
        "Strawberry": "فراولة",
        "Tomato": "طماطم"
    }
    
    # Translation dictionary for disease names
    disease_translations = {
        "Apple_scab": "جرب التفاح",
        "Black_rot": "العفن الأسود",
        "Cedar_apple_rust": "صدأ التفاح السيدار",
        "Powdery_mildew": "البياض الدقيقي",
        "Gray_leaf_spot": "البقعة الرمادية",
        "Common_rust": "الصدأ الشائع",
        "Northern_Leaf_Blight": "لفحة الأوراق الشمالية",
        "Esca_(Black_Measles)": "الإسكا (الحصبة السوداء)",
        "Leaf_blight": "لفحة الأوراق",
        "Isariopsis_Leaf_Spot": "تبقع الأوراق الإيساريوبسي",
        "Haunglongbing_(Citrus_greening)": "الهوانجلونجبينج (اخضرار الحمضيات)",
        "Bacterial_spot": "التبقع البكتيري",
        "Early_blight": "اللفحة المبكرة",
        "Late_blight": "اللفحة المتأخرة",
        "Leaf_Mold": "عفن الأوراق",
        "Septoria_leaf_spot": "تبقع سبتوريا",
        "Spider_mites": "عناكب العنكبوت",
        "Target_Spot": "البقع المستهدفة",
        "Yellow_Leaf_Curl_Virus": "فيروس تجعد وإصفرار الأوراق",
        "Tomato_mosaic_virus": "فيروس موزاييك الطماطم",
        "healthy": "سليم"
    }
    
    # Handle special cases
    if "Spider_mites Two-spotted_spider_mite" in class_name:
        class_name = class_name.replace("Spider_mites Two-spotted_spider_mite", "Spider_mites")
    if "Cercospora_leaf_spot Gray_leaf_spot" in class_name:
        class_name = class_name.replace("Cercospora_leaf_spot Gray_leaf_spot", "Gray_leaf_spot")
    
    # Split the class name into plant and disease parts
    parts = class_name.split("___")
    
    if len(parts) == 2:
        plant, disease = parts
        
        # Format English name
        formatted_english = f"{plant.replace('_', ' ')} - {disease.replace('_', ' ')}"
        
        # Get translations
        plant_arabic = plant_translations.get(plant, plant)
        disease_arabic = disease_translations.get(disease, disease)
        
        if disease == "healthy":
            arabic_translation = f"{plant_arabic} {disease_arabic}"
        else:
            arabic_translation = f"{disease_arabic} في {plant_arabic}"
        
        return formatted_english, arabic_translation
    
    # If the format doesn't match expected pattern, return original name
    return class_name, class_name
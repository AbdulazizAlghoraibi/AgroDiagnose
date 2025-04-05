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
    # Dictionary mapping disease classes to Arabic translations
    translations = {
        # Tomato diseases
        "Tomato___Bacterial_spot": ("Tomato - Bacterial spot", "التبقع البكتيري للطماطم"),
        "Tomato___Early_blight": ("Tomato - Early blight", "اللفحة المبكرة للطماطم"),
        "Tomato___Late_blight": ("Tomato - Late blight", "اللفحة المتأخرة للطماطم"),
        "Tomato___Leaf_Mold": ("Tomato - Leaf mold", "عفن أوراق الطماطم"),
        "Tomato___Septoria_leaf_spot": ("Tomato - Septoria leaf spot", "تبقع السبتوريا على أوراق الطماطم"),
        "Tomato___Spider_mites Two-spotted_spider_mite": ("Tomato - Spider mites", "عنكبوت الطماطم"),
        "Tomato___Target_Spot": ("Tomato - Target spot", "البقعة المستهدفة للطماطم"),
        "Tomato___Tomato_Yellow_Leaf_Curl_Virus": ("Tomato - Yellow leaf curl virus", "فيروس تجعد وإصفرار أوراق الطماطم"),
        "Tomato___Tomato_mosaic_virus": ("Tomato - Mosaic virus", "فيروس موزاييك الطماطم"),
        "Tomato___healthy": ("Tomato - Healthy", "طماطم سليمة"),
        
        # Potato diseases
        "Potato___Early_blight": ("Potato - Early blight", "اللفحة المبكرة للبطاطس"),
        "Potato___Late_blight": ("Potato - Late blight", "اللفحة المتأخرة للبطاطس"),
        "Potato___healthy": ("Potato - Healthy", "بطاطس سليمة"),
        
        # Pepper diseases
        "Pepper,_bell___Bacterial_spot": ("Pepper - Bacterial spot", "التبقع البكتيري للفلفل"),
        "Pepper,_bell___healthy": ("Pepper - Healthy", "فلفل سليم"),
        
        # Corn diseases
        "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": ("Corn - Gray leaf spot", "تبقع أوراق الذرة الرمادي"),
        "Corn_(maize)___Common_rust_": ("Corn - Common rust", "صدأ الذرة الشائع"),
        "Corn_(maize)___Northern_Leaf_Blight": ("Corn - Northern leaf blight", "لفحة أوراق الذرة الشمالية"),
        "Corn_(maize)___healthy": ("Corn - Healthy", "ذرة سليمة"),
        
        # Apple diseases
        "Apple___Apple_scab": ("Apple - Apple scab", "جرب التفاح"),
        "Apple___Black_rot": ("Apple - Black rot", "العفن الأسود للتفاح"),
        "Apple___Cedar_apple_rust": ("Apple - Cedar apple rust", "صدأ التفاح"),
        "Apple___healthy": ("Apple - Healthy", "تفاح سليم"),
        
        # Grape diseases
        "Grape___Black_rot": ("Grape - Black rot", "العفن الأسود للعنب"),
        "Grape___Esca_(Black_Measles)": ("Grape - Black measles", "مرض الحصبة السوداء للعنب"),
        "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": ("Grape - Leaf blight", "لفحة أوراق العنب"),
        "Grape___healthy": ("Grape - Healthy", "عنب سليم"),
        
        # Generic healthy plants
        "healthy": ("Healthy plant", "نبات سليم"),
        
        # Default case
        "Unknown": ("Unknown disease", "مرض غير معروف")
    }
    
    # Clean up the class name and map to a translation
    # Get the translation or default to unknown
    translation = translations.get(class_name, translations["Unknown"])
    
    return translation
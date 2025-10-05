#!/usr/bin/env python3
"""
Weather Prediction Script
Uses trained XGBoost model to predict rain probability
"""
import sys
import json
import joblib
import pandas as pd
import numpy as np
from pathlib import Path

MODEL_DIR = Path("models")

def load_model():
    """Load the trained model and metadata"""
    model_file = MODEL_DIR / "weather_prediction_model.pkl"
    if not model_file.exists():
        raise FileNotFoundError("Trained model not found. Run train_model.py first.")
    
    return joblib.load(model_file)

def prepare_features(input_data, model_data):
    """Prepare input features for prediction"""
    feature_cols = model_data['feature_cols']
    le_location = model_data['location_encoder']
    le_climate = model_data['climate_encoder']
    
    # Create feature vector
    features = {}
    
    # Location encoding (use first location if not found)
    try:
        location_name = f"Location_{abs(hash(f'{input_data["lat"]},{input_data["lon"]}')) % 1000}"
        if location_name in le_location.classes_:
            features['location_encoded'] = le_location.transform([location_name])[0]
        else:
            features['location_encoded'] = 0  # Default to first location
    except:
        features['location_encoded'] = 0
    
    # Climate zone encoding
    try:
        climate_zone = input_data.get('climate_zone', 'temperate')
        if climate_zone in le_climate.classes_:
            features['climate_zone_encoded'] = le_climate.transform([climate_zone])[0]
        else:
            features['climate_zone_encoded'] = 0  # Default
    except:
        features['climate_zone_encoded'] = 0
    
    # Direct features
    direct_features = ['lat', 'lon', 'month', 'day_of_year', 'season', 
                      'T2M', 'RH2M', 'WS10M', 'PS', 'PRECTOTCORR']
    
    for feat in direct_features:
        features[feat] = input_data.get(feat, 0)
    
    # Create lag and rolling features (use current values as approximation)
    lag_features = ['PRECTOTCORR', 'T2M', 'RH2M', 'WS10M', 'PS']
    for feat in lag_features:
        base_val = features.get(feat, 0)
        for lag in [1, 2, 3, 7]:
            features[f'{feat}_lag_{lag}'] = base_val * (0.9 + np.random.random() * 0.2)
    
    # Rolling averages
    rolling_features = ['T2M', 'RH2M', 'WS10M']
    for feat in rolling_features:
        base_val = features.get(feat, 0)
        features[f'{feat}_rolling_7'] = base_val * (0.95 + np.random.random() * 0.1)
    
    # Create DataFrame with all required features
    feature_df = pd.DataFrame([features])
    
    # Ensure all required columns are present
    for col in feature_cols:
        if col not in feature_df.columns:
            feature_df[col] = 0
    
    # Select only the features used in training
    feature_df = feature_df[feature_cols].fillna(0)
    
    return feature_df

def predict_rain(input_data):
    """Make rain prediction using trained model"""
    try:
        # Load model
        model_data = load_model()
        model = model_data['model']
        
        # Prepare features
        X = prepare_features(input_data, model_data)
        
        # Make prediction
        probability = model.predict_proba(X)[0][1]  # Probability of rain
        prediction = model.predict(X)[0]  # Binary prediction
        
        # Determine confidence based on probability
        if probability > 0.8 or probability < 0.2:
            confidence = 'high'
        elif probability > 0.6 or probability < 0.4:
            confidence = 'medium'
        else:
            confidence = 'low'
        
        return {
            'probability': float(probability),
            'prediction': int(prediction),
            'confidence': confidence,
            'source': 'ml-model',
            'method': 'xgboost'
        }
        
    except Exception as e:
        # Fallback to simple statistical model
        return fallback_prediction(input_data, str(e))

def fallback_prediction(input_data, error_msg):
    """Fallback statistical prediction if ML model fails"""
    lat = input_data.get('lat', 0)
    month = input_data.get('month', 6)
    climate_zone = input_data.get('climate_zone', 'temperate')
    
    # Simple climate-based probability
    base_probs = {
        'equatorial': 0.6,
        'tropical': 0.4,
        'subtropical': 0.2,
        'temperate': 0.3,
        'polar': 0.2
    }
    
    probability = base_probs.get(climate_zone, 0.3)
    
    # Seasonal adjustment
    if 6 <= month <= 8:  # Summer
        probability *= 0.8
    elif 3 <= month <= 5 or 9 <= month <= 11:  # Spring/Fall
        probability *= 1.1
    
    return {
        'probability': probability,
        'prediction': 1 if probability > 0.5 else 0,
        'confidence': 'low',
        'source': 'fallback-statistical',
        'method': 'climatology',
        'error': error_msg
    }

def main():
    try:
        # Read input from command line
        if len(sys.argv) != 2:
            raise ValueError("Usage: python predict.py '<json_input>'")
        
        input_json = sys.argv[1]
        input_data = json.loads(input_json)
        
        # Make prediction
        result = predict_rain(input_data)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        # Output error as JSON
        error_result = {
            'probability': 0.3,
            'prediction': 0,
            'confidence': 'low',
            'source': 'error-fallback',
            'method': 'default',
            'error': str(e)
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()
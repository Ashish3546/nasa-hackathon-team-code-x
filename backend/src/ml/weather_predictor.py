#!/usr/bin/env python3
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.multioutput import MultiOutputRegressor
import joblib
import os
import sys
import json
import difflib

def load_and_train_model():
    """Load dataset and train the model"""
    try:
        # Use relative path from backend directory
        file_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'india_weather_dataset.csv')
        
        if not os.path.exists(file_path):
            return {"error": f"Dataset not found at {file_path}"}
        
        df = pd.read_csv(file_path)
        
        # Preprocess data
        df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
        df = df.dropna(subset=['Date'])
        
        # Create date features
        df['month'] = df['Date'].dt.month
        df['day'] = df['Date'].dt.day
        df['dayofyear'] = df['Date'].dt.dayofyear
        df['weekday'] = df['Date'].dt.weekday
        
        # Fill missing values
        df = df.fillna({
            'Region': 'UNKNOWN',
            'State': 'UNKNOWN',
            'Lat': df['Lat'].mean(),
            'Lon': df['Lon'].mean(),
            'Temperature': df['Temperature'].mean(),
            'Rainfall': df['Rainfall'].mean(),
            'WindSpeed': df['WindSpeed'].mean(),
            'Humidity': df['Humidity'].mean()
        })
        
        # Encode region
        le_region = LabelEncoder()
        df['region_enc'] = le_region.fit_transform(df['Region'])
        
        # Features and targets
        features = ['region_enc', 'month', 'day', 'dayofyear', 'weekday', 'Lat', 'Lon']
        targets = ['Temperature', 'Rainfall', 'WindSpeed', 'Humidity']
        
        X = df[features]
        y = df[targets]
        
        # Train model
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        base_model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        model = MultiOutputRegressor(base_model)
        model.fit(X_train, y_train)
        
        # Save model artifacts
        artifacts_dir = os.path.join(os.path.dirname(__file__), 'model_artifacts')
        os.makedirs(artifacts_dir, exist_ok=True)
        
        joblib.dump(model, os.path.join(artifacts_dir, "weather_model.joblib"))
        joblib.dump(le_region, os.path.join(artifacts_dir, "label_encoder_region.joblib"))
        joblib.dump(df, os.path.join(artifacts_dir, "dataset.joblib"))
        
        return {"success": "Model trained and saved successfully"}
        
    except Exception as e:
        return {"error": str(e)}

def predict_weather(location, date):
    """Predict weather for given location and date"""
    try:
        artifacts_dir = os.path.join(os.path.dirname(__file__), 'model_artifacts')
        
        # Load model artifacts
        model = joblib.load(os.path.join(artifacts_dir, "weather_model.joblib"))
        le_region = joblib.load(os.path.join(artifacts_dir, "label_encoder_region.joblib"))
        df = joblib.load(os.path.join(artifacts_dir, "dataset.joblib"))
        
        # Parse date
        d = pd.to_datetime(date, errors='coerce')
        if pd.isna(d):
            return {"error": "Invalid date format! Use YYYY-MM-DD"}
        
        # Find best matching region
        region_list = list(le_region.classes_)
        best_match = difflib.get_close_matches(location, region_list, n=1, cutoff=0.3)
        
        if not best_match:
            # Use closest region by name similarity
            best_match = [min(region_list, key=lambda x: len(set(location.lower()) - set(x.lower())))]
        
        best_loc = best_match[0]
        
        # Prepare features
        region_enc = int(le_region.transform([best_loc])[0])
        month, day, dayofyear, weekday = d.month, d.day, d.dayofyear, d.weekday()
        
        # Get lat/lon for the region
        region_data = df[df['Region'] == best_loc]
        if len(region_data) > 0:
            lat = region_data['Lat'].mean()
            lon = region_data['Lon'].mean()
        else:
            lat = df['Lat'].mean()
            lon = df['Lon'].mean()
        
        X_new = pd.DataFrame([{
            'region_enc': region_enc,
            'month': month,
            'day': day,
            'dayofyear': dayofyear,
            'weekday': weekday,
            'Lat': lat,
            'Lon': lon
        }])
        
        # Make prediction
        pred = model.predict(X_new)[0]
        
        # Process outputs with realistic adjustments
        base_temp = pred[0]
        
        # Add seasonal temperature adjustments for Indian climate
        if month in [4, 5, 6]:  # Peak summer
            temp_adjustment = 5 + (month - 3) * 2  # April +5, May +7, June +9
        elif month in [7, 8, 9]:  # Monsoon (slightly cooler)
            temp_adjustment = 2
        elif month in [10, 11]:  # Post-monsoon
            temp_adjustment = 0
        else:  # Winter
            temp_adjustment = -2
        
        temperature = round(max(15, base_temp + temp_adjustment), 1)
        rainfall = max(0, round(pred[1], 2))
        wind_speed = max(0, round(pred[2], 1))
        humidity = max(0, min(100, round(pred[3], 1)))
        
        # Calculate rain probability based on rainfall
        rain_probability = min(0.95, max(0.05, rainfall / 10.0))
        
        # Determine verdict
        if rain_probability >= 0.6:
            verdict = "Rain"
        elif rain_probability >= 0.3:
            verdict = "Uncertain"
        else:
            verdict = "No rain"
        
        return {
            "success": True,
            "location": best_loc,
            "date": date,
            "verdict": verdict,
            "probability": rain_probability,
            "confidence": "high",
            "temperature": temperature,
            "rainfall": rainfall,
            "wind_speed": wind_speed,
            "humidity": humidity,
            "coordinates": {"lat": lat, "lon": lon}
        }
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing command"}))
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "train":
        result = load_and_train_model()
        print(json.dumps(result))
    
    elif command == "predict":
        if len(sys.argv) < 4:
            print(json.dumps({"error": "Missing location or date"}))
            sys.exit(1)
        
        location = sys.argv[2]
        date = sys.argv[3]
        result = predict_weather(location, date)
        print(json.dumps(result))
    
    else:
        print(json.dumps({"error": "Unknown command"}))
#!/usr/bin/env python3
"""
Weather Prediction Model Training
Trains XGBoost model on NASA POWER data for rain prediction
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import xgboost as xgb
import joblib
from pathlib import Path

DATA_DIR = Path("nasa_power_data")
MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

def load_training_data():
    """Load the training dataset created by download_nasa_power.py"""
    training_files = list(DATA_DIR.glob("training_data_*.csv"))
    if not training_files:
        raise FileNotFoundError("No training data found. Run download_nasa_power.py first.")
    
    latest_file = max(training_files, key=lambda x: x.stat().st_mtime)
    print(f"Loading training data from: {latest_file}")
    
    df = pd.read_csv(latest_file, parse_dates=['date'])
    print(f"Loaded {len(df)} training samples")
    return df

def prepare_features(df):
    """Prepare features for training"""
    # Encode categorical variables
    le_location = LabelEncoder()
    le_climate = LabelEncoder()
    
    df['location_encoded'] = le_location.fit_transform(df['location'])
    df['climate_zone_encoded'] = le_climate.fit_transform(df['climate_zone'])
    
    # Select feature columns
    feature_cols = [col for col in df.columns if col not in [
        'date', 'location', 'lat', 'lon', 'rain_tomorrow', 'climate_zone'
    ]]
    
    X = df[feature_cols].fillna(0)  # Fill any remaining NaN values
    y = df['rain_tomorrow']
    
    print(f"Features: {len(feature_cols)}")
    print(f"Target distribution: {y.value_counts().to_dict()}")
    
    return X, y, feature_cols, le_location, le_climate

def train_model(X, y):
    """Train XGBoost model with time series cross-validation"""
    print("\nTraining XGBoost model...")
    
    # XGBoost parameters optimized for weather prediction
    params = {
        'objective': 'binary:logistic',
        'max_depth': 6,
        'learning_rate': 0.1,
        'n_estimators': 200,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'random_state': 42,
        'eval_metric': 'logloss'
    }
    
    model = xgb.XGBClassifier(**params)
    
    # Time series cross-validation
    tscv = TimeSeriesSplit(n_splits=5)
    cv_scores = cross_val_score(model, X, y, cv=tscv, scoring='accuracy')
    
    print(f"Cross-validation scores: {cv_scores}")
    print(f"Mean CV accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    # Train final model on all data
    model.fit(X, y)
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nTop 10 most important features:")
    print(feature_importance.head(10))
    
    return model, feature_importance

def evaluate_model(model, X, y):
    """Evaluate model performance"""
    y_pred = model.predict(X)
    y_pred_proba = model.predict_proba(X)[:, 1]
    
    accuracy = accuracy_score(y, y_pred)
    print(f"\nModel Accuracy: {accuracy:.4f}")
    
    print("\nClassification Report:")
    print(classification_report(y, y_pred))
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y, y_pred))
    
    return accuracy

def save_model(model, feature_cols, le_location, le_climate, feature_importance):
    """Save trained model and metadata"""
    model_data = {
        'model': model,
        'feature_cols': feature_cols,
        'location_encoder': le_location,
        'climate_encoder': le_climate,
        'feature_importance': feature_importance
    }
    
    model_file = MODEL_DIR / "weather_prediction_model.pkl"
    joblib.dump(model_data, model_file)
    print(f"\nModel saved to: {model_file}")
    
    # Save feature importance as CSV
    importance_file = MODEL_DIR / "feature_importance.csv"
    feature_importance.to_csv(importance_file, index=False)
    print(f"Feature importance saved to: {importance_file}")

def main():
    print("Weather Prediction Model Training")
    print("=" * 40)
    
    try:
        # Load and prepare data
        df = load_training_data()
        X, y, feature_cols, le_location, le_climate = prepare_features(df)
        
        # Train model
        model, feature_importance = train_model(X, y)
        
        # Evaluate model
        accuracy = evaluate_model(model, X, y)
        
        # Save model
        save_model(model, feature_cols, le_location, le_climate, feature_importance)
        
        print(f"\nTraining completed successfully!")
        print(f"Final model accuracy: {accuracy:.4f}")
        
    except Exception as e:
        print(f"Error during training: {e}")
        raise

if __name__ == "__main__":
    main()
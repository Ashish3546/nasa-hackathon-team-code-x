# ==============================
# WEATHER PARAMETERS PREDICTION - TRAIN, TEST & PREDICT
# ==============================

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
import difflib

# ------------------------------
# Step 1: Load dataset
# ------------------------------

file_name = r"D:\Weather_Temperature_Prediction\data\india_weather_dataset.xlsx"

if not os.path.exists(file_name):
    raise FileNotFoundError(f"Dataset not found at {file_name}")

df = pd.read_excel(file_name)
print("✅ File loaded successfully!")
print(f"Rows: {len(df)}")
print(f"Columns: {list(df.columns)}")
print(df.head())

# ------------------------------
# Step 2: Preprocess the data
# ------------------------------

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

# ------------------------------
# Step 3: Encode the region
# ------------------------------

le_region = LabelEncoder()
df['region_enc'] = le_region.fit_transform(df['Region'])

# ------------------------------
# Step 4: Features and targets
# ------------------------------

features = ['region_enc', 'month', 'day', 'dayofyear', 'weekday', 'Lat', 'Lon']
targets = ['Temperature', 'Rainfall', 'WindSpeed', 'Humidity']

X = df[features]
y = df[targets]

# ------------------------------
# Step 5: Train-test split
# ------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ------------------------------
# Step 6: Train the model
# ------------------------------

base_model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
model = MultiOutputRegressor(base_model)
model.fit(X_train, y_train)
print("✅ Model training complete!")

# ------------------------------
# Step 7: Evaluate the model
# ------------------------------

y_pred = model.predict(X_test)
for i, target in enumerate(targets):
    mae = mean_absolute_error(y_test[target], y_pred[:, i])
    rmse = np.sqrt(mean_squared_error(y_test[target], y_pred[:, i]))
    r2 = r2_score(y_test[target], y_pred[:, i])
    print(f"\n📊 {target} Performance:")
    print(f"MAE  : {mae:.2f}")
    print(f"RMSE : {rmse:.2f}")
    print(f"R²   : {r2:.2f}")

# ------------------------------
# Step 8: Save model and encoder
# ------------------------------

model_artifacts_dir = r"D:\Weather_Temperature_Prediction\train_test\model_artifacts"
os.makedirs(model_artifacts_dir, exist_ok=True)

joblib.dump(model, os.path.join(model_artifacts_dir, "weather_model.joblib"))
joblib.dump(le_region, os.path.join(model_artifacts_dir, "label_encoder_region.joblib"))
print(f"\n💾 Model and encoder saved to '{model_artifacts_dir}'")

# ------------------------------
# Step 9: Function for user prediction
# ------------------------------

def predict_weather(user_location, user_date):
    """Predict multiple weather parameters."""
    d = pd.to_datetime(user_date, errors='coerce')
    if pd.isna(d):
        return "❌ Invalid date format! Use YYYY-MM-DD."

    region_list = list(le_region.classes_)
    best_match = difflib.get_close_matches(user_location, region_list, n=1, cutoff=0.5)
    if not best_match:
        return f"❌ Location '{user_location}' not found in dataset!"
    best_loc = best_match[0]

    region_enc = int(le_region.transform([best_loc])[0])
    month, day, dayofyear, weekday = d.month, d.day, d.dayofyear, d.weekday()
    lat = df.loc[df['Region'] == best_loc, 'Lat'].mean()
    lon = df.loc[df['Region'] == best_loc, 'Lon'].mean()

    X_new = pd.DataFrame([{
        'region_enc': region_enc,
        'month': month,
        'day': day,
        'dayofyear': dayofyear,
        'weekday': weekday,
        'Lat': lat,
        'Lon': lon
    }])

    pred = model.predict(X_new)[0]

    # Process outputs (Temperature in °C)
    temp_c = round(pred[0], 2)               
    rain_pct = round(min(pred[1] * 10, 100), 2)  # Simple approximation
    wind_kmh = round(pred[2] * 3.6, 2)         # m/s → km/h
    humidity = round(pred[3], 2)               # %

    output = f"🌦️ Weather Prediction for {best_loc} on {user_date}:\n"
    output += f"Temperature: {temp_c} °C\n"
    output += f"Rain Accuracy: {rain_pct} %\n"
    output += f"Wind Speed: {wind_kmh} km/h\n"
    output += f"Humidity: {humidity} %\n"

    return output

# ------------------------------
# Step 10: Get user input
# ------------------------------

print("\n💬 Enter location and date to predict weather parameters:")
user_loc = input("Location (e.g., Mumbai): ")
user_date = input("Date (YYYY-MM-DD): ")
print(predict_weather(user_loc, user_date))

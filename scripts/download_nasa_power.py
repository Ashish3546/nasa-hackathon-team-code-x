#!/usr/bin/env python3
"""
NASA POWER Data Downloader for Weather Prediction Training
Downloads multi-year precipitation and weather data for machine learning
"""
import requests
import time
import pandas as pd
import os
from datetime import datetime
from pathlib import Path

BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
OUT_DIR = Path("nasa_power_data")
OUT_DIR.mkdir(exist_ok=True)

# Global locations for diverse climate data
LOCATIONS = [
    {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777},
    {"name": "NewYork", "lat": 40.7128, "lon": -74.0060},
    {"name": "London", "lat": 51.5074, "lon": -0.1278},
    {"name": "Tokyo", "lat": 35.6762, "lon": 139.6503},
    {"name": "Sydney", "lat": -33.8688, "lon": 151.2093},
    {"name": "Cairo", "lat": 30.0444, "lon": 31.2357},
]

PARAMETERS = "PRECTOTCORR,T2M,RH2M,WS10M,PS"  # Precipitation, Temp, Humidity, Wind, Pressure
COMMUNITY = "AG"
START_YEAR = 2015
END_YEAR = 2024
SLEEP_SECONDS = 2.0
TIMEOUT = 60
MAX_RETRIES = 3

def build_payload(lat, lon, start_yyyymmdd, end_yyyymmdd):
    return {
        "parameters": PARAMETERS,
        "community": COMMUNITY,
        "start": start_yyyymmdd,
        "end": end_yyyymmdd,
        "latitude": str(lat),
        "longitude": str(lon),
        "format": "JSON"
    }

def request_with_retries(url, params, retries=MAX_RETRIES):
    for attempt in range(retries):
        try:
            r = requests.get(url, params=params, timeout=TIMEOUT)
            r.raise_for_status()
            return r
        except requests.RequestException as e:
            wait = (2 ** attempt)
            print(f"[WARN] Request failed (attempt {attempt+1}/{retries}): {e}. Retrying in {wait}s...")
            time.sleep(wait)
    raise RuntimeError(f"Failed after {retries} attempts")

def parse_daily_json_to_df(js):
    props = js.get("properties", {})
    params = props.get("parameter", {})
    if not params:
        raise ValueError("No parameter data found in response")
    
    first_param = next(iter(params))
    dates = list(params[first_param].keys())
    data = {"date": pd.to_datetime(dates, format="%Y%m%d")}
    
    for pname, series in params.items():
        values = [series.get(d, None) for d in dates]
        data[pname] = values
    
    df = pd.DataFrame(data)
    return df.sort_values("date").reset_index(drop=True)

def download_location_data(location):
    name = location["name"]
    lat = location["lat"]
    lon = location["lon"]
    
    print(f"\n[INFO] Downloading data for {name} ({lat}, {lon})")
    
    all_dfs = []
    for year in range(START_YEAR, END_YEAR + 1):
        start = f"{year}0101"
        end = f"{year}1231"
        
        try:
            params = build_payload(lat, lon, start, end)
            print(f"[INFO] Requesting {year} data...")
            r = request_with_retries(BASE_URL, params)
            df_year = parse_daily_json_to_df(r.json())
            df_year['location'] = name
            df_year['lat'] = lat
            df_year['lon'] = lon
            all_dfs.append(df_year)
            print(f"[SUCCESS] {year}: {len(df_year)} records")
            time.sleep(SLEEP_SECONDS)
        except Exception as e:
            print(f"[ERROR] Failed to download {year} for {name}: {e}")
    
    if all_dfs:
        combined = pd.concat(all_dfs, ignore_index=True)
        out_file = OUT_DIR / f"power_{name}_{START_YEAR}_{END_YEAR}.csv"
        combined.to_csv(out_file, index=False)
        print(f"[SAVED] {out_file} ({len(combined)} records)")
        return combined
    return None

def main():
    print("NASA POWER Weather Data Downloader")
    print(f"Downloading {len(LOCATIONS)} locations from {START_YEAR}-{END_YEAR}")
    
    all_location_data = []
    
    for location in LOCATIONS:
        try:
            df = download_location_data(location)
            if df is not None:
                all_location_data.append(df)
        except Exception as e:
            print(f"[ERROR] Failed to process {location['name']}: {e}")
    
    # Combine all locations into master dataset
    if all_location_data:
        master_df = pd.concat(all_location_data, ignore_index=True)
        master_file = OUT_DIR / f"master_weather_data_{START_YEAR}_{END_YEAR}.csv"
        master_df.to_csv(master_file, index=False)
        print(f"\n[MASTER] Combined dataset saved: {master_file}")
        print(f"Total records: {len(master_df)}")
        print(f"Date range: {master_df['date'].min()} to {master_df['date'].max()}")
        print(f"Locations: {master_df['location'].unique()}")
        
        # Create training features
        create_training_features(master_df)
    else:
        print("[ERROR] No data was successfully downloaded")

def create_training_features(df):
    """Create ML training features from raw weather data"""
    print("\n[INFO] Creating training features...")
    
    # Sort by location and date
    df = df.sort_values(['location', 'date']).reset_index(drop=True)
    
    # Create target variable (rain tomorrow)
    df['rain_tomorrow'] = (df.groupby('location')['PRECTOTCORR'].shift(-1) > 0.1).astype(int)
    
    # Time-based features
    df['month'] = df['date'].dt.month
    df['day_of_year'] = df['date'].dt.dayofyear
    df['season'] = df['month'].map({12:0, 1:0, 2:0, 3:1, 4:1, 5:1, 6:2, 7:2, 8:2, 9:3, 10:3, 11:3})
    
    # Lag features (previous days)
    for col in ['PRECTOTCORR', 'T2M', 'RH2M', 'WS10M', 'PS']:
        for lag in [1, 2, 3, 7]:
            df[f'{col}_lag_{lag}'] = df.groupby('location')[col].shift(lag)
    
    # Rolling averages
    for col in ['T2M', 'RH2M', 'WS10M']:
        df[f'{col}_rolling_7'] = df.groupby('location')[col].rolling(7, min_periods=1).mean().reset_index(0, drop=True)
    
    # Climate zone encoding
    df['climate_zone'] = df.apply(lambda row: get_climate_zone(row['lat']), axis=1)
    
    # Remove rows with NaN targets and save
    training_df = df.dropna(subset=['rain_tomorrow'])
    training_file = OUT_DIR / f"training_data_{START_YEAR}_{END_YEAR}.csv"
    training_df.to_csv(training_file, index=False)
    
    print(f"[TRAINING] Training dataset saved: {training_file}")
    print(f"Training samples: {len(training_df)}")
    print(f"Features: {len([col for col in training_df.columns if col not in ['date', 'location', 'lat', 'lon']])}")

def get_climate_zone(lat):
    abs_lat = abs(lat)
    if abs_lat <= 10: return 'equatorial'
    elif abs_lat <= 23.5: return 'tropical'
    elif abs_lat <= 35: return 'subtropical'
    elif abs_lat <= 60: return 'temperate'
    else: return 'polar'

if __name__ == "__main__":
    main()
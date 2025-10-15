# -*- coding: utf-8 -*-
import os, json, math
from datetime import datetime
import numpy as np
import xgboost as xgb

MODEL_FILES = {
    "model": "fhvhv_model_v2_xgb.json",
    "cols": "fhvhv_model_v2_columns.json",
    "te": "fhvhv_model_v2_te_maps.json",
    "med": "fhvhv_model_v2_feature_medians.json",
}

def _load_json(path):
    with open(path, "r") as f:
        return json.load(f)

def _dt_parts(pickup_dt_str: str):
    dt = datetime.fromisoformat(pickup_dt_str.replace("Z","").replace("T"," ").strip())
    hour = dt.hour
    weekday = dt.weekday()
    month_num = dt.month
    is_weekend = 1 if weekday >= 5 else 0
    return hour, weekday, month_num, is_weekend

def build_features_row_v2(pickup_dt_str, pulocationid, dolocationid, trip_miles,
                          feature_cols, te_maps, feature_medians):
    hour, weekday, month_num, is_weekend = _dt_parts(pickup_dt_str)
    row = {c: 0.0 for c in feature_cols}

    # Features disponibles al pickup
    if "trip_miles" in row: row["trip_miles"] = float(trip_miles)
    if "hour_sin" in row: row["hour_sin"] = math.sin(2*math.pi*hour/24.0)
    if "hour_cos" in row: row["hour_cos"] = math.cos(2*math.pi*hour/24.0)
    if "weekday" in row: row["weekday"] = float(weekday)
    if "is_weekend" in row: row["is_weekend"] = float(is_weekend)
    if "month_num" in row: row["month_num"] = float(month_num)

    # Relleno con medianas para no observables en tiempo real
    for fld in ["dur_min","speed_mph","req_to_pickup_min","onscene_to_pickup_min","pair_cnt",
                "pulocationid_cnt","dolocationid_cnt","pulocationid_te","dolocationid_te"]:
        if fld in row:
            row[fld] = float(feature_medians.get(fld, 0.0))

    # Target encodings
    pu = int(pulocationid) if pulocationid is not None else None
    do = int(dolocationid) if dolocationid is not None else None

    if "pulocationid_te" in row:
        m = te_maps.get("pulocationid", {})
        means = m.get("means", {})
        glob = m.get("global", feature_medians.get("pulocationid_te", 0.0))
        row["pulocationid_te"] = float(means.get(str(pu), means.get(pu, glob))) if pu is not None else float(glob)
    if "dolocationid_te" in row:
        m = te_maps.get("dolocationid", {})
        means = m.get("means", {})
        glob = m.get("global", feature_medians.get("dolocationid_te", 0.0))
        row["dolocationid_te"] = float(means.get(str(do), means.get(do, glob))) if do is not None else float(glob)

    # Vector en el orden exacto de las columnas
    return [float(row[c]) for c in feature_cols]

# Hooks SageMaker
def model_fn(model_dir):
    booster = xgb.Booster()
    booster.load_model(os.path.join(model_dir, MODEL_FILES["model"]))
    feature_cols = _load_json(os.path.join(model_dir, MODEL_FILES["cols"]))
    te_maps      = _load_json(os.path.join(model_dir, MODEL_FILES["te"]))
    feature_meds = _load_json(os.path.join(model_dir, MODEL_FILES["med"]))
    return {"booster": booster, "feature_cols": feature_cols, "te_maps": te_maps, "feature_medians": feature_meds}

def input_fn(request_body, request_content_type="application/json"):
    if request_content_type.startswith("application/json"):
        if isinstance(request_body, (bytes, bytearray)):
            request_body = request_body.decode("utf-8")
        data = json.loads(request_body)
        if isinstance(data, dict) and "instances" in data: return data["instances"]
        if isinstance(data, list): return data
        if isinstance(data, dict): return [data]
        raise ValueError("JSON no reconocido. Usa {'instances': [...]} o un objeto.")
    raise ValueError(f"Content-Type no soportado: {request_content_type}")

def predict_fn(records, model):
    booster = model["booster"]; cols = model["feature_cols"]; te = model["te_maps"]; meds = model["feature_medians"]
    rows = [build_features_row_v2(r.get("pickup_dt_str"), r.get("pulocationid"), r.get("dolocationid"),
                                  r.get("trip_miles", 0.0), cols, te, meds)
            for r in records]
    X = np.array(rows, dtype=float) if rows else np.zeros((0, len(cols)), dtype=float)
    d = xgb.DMatrix(X, feature_names=cols)
    pred_log = booster.predict(d)
    yhats = np.expm1(pred_log).astype(float).tolist()
    return yhats

def output_fn(prediction, accept="application/json"):
    body = {"predictions": prediction if isinstance(prediction, list) else [prediction]}
    return json.dumps(body), "application/json"
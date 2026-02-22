# model/train_model.py

import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder

# 1️⃣ Load dataset
data = pd.read_csv("InternHub\scamshield\dataset\raw_dataset.csv")

print("Dataset shape:", data.shape)

# 2️⃣ Separate features and label
X = data.drop("label", axis=1)
y = data["label"]

# 3️⃣ Encode categorical columns automatically
for column in X.select_dtypes(include=["object"]).columns:
    le = LabelEncoder()
    X[column] = le.fit_transform(X[column])

# 4️⃣ Train-test split (important: stratify for fraud detection)
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# 5️⃣ Train model
model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced"   # important for fraud detection
)

model.fit(X_train, y_train)

# 6️⃣ Evaluate
y_pred = model.predict(X_test)

print("\nConfusion Matrix:\n")
print(confusion_matrix(y_test, y_pred))

print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# 7️⃣ Save trained model
joblib.dump(model, "fraud_model.pkl")

print("\n Model trained and saved as fraud_model.pkl")
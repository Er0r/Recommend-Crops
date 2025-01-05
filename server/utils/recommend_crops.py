# Required imports
import sys
import json
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier

# Load the dataset
file_path = sys.argv[1]
crops = pd.read_csv(file_path)

# Standardize features
scaler = StandardScaler()
crops.iloc[:, :-1] = scaler.fit_transform(crops.iloc[:, :-1])

# Encode target variable
encoder = LabelEncoder()
crops["label"] = encoder.fit_transform(crops["label"])

# Split the dataset
X_train, X_test, y_train, y_test = train_test_split(
    crops.iloc[:, :-1], crops["label"], test_size=0.2, random_state=42
)

# Train the Naive Bayes classifier
naive_bayes_clf = GaussianNB()
naive_bayes_clf.fit(X_train, y_train)

# Feature names
feature_names = list(crops.columns[:-1])

# Accept user input for prediction
N = float(sys.argv[2])
P = float(sys.argv[3])
K = float(sys.argv[4])
temperature = float(sys.argv[5])
humidity = float(sys.argv[6])
ph = float(sys.argv[7])
rainfall = float(sys.argv[8])

# Create a single data point as a DataFrame
new_data = pd.DataFrame([[N, P, K, temperature, humidity, ph, rainfall]], columns=feature_names)

# Standardize the new data
new_data_scaled = scaler.transform(new_data)

# Predict crop using the Naive Bayes classifier
predicted_label = naive_bayes_clf.predict(new_data_scaled)
predicted_crop = encoder.inverse_transform(predicted_label)

# Print the recommendation result to stdout
print(json.dumps({"Recommended Crop": predicted_crop[0]}))

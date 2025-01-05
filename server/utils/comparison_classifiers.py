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

# Get input and output file paths from arguments
input_file = sys.argv[1]
output_file = sys.argv[2]

# Load the dataset
crops = pd.read_csv(input_file)

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

# Define classifiers
classifiers = {
    "Logistic Regression": LogisticRegression(max_iter=2000, solver='newton-cg'),
    "Naive Bayes": GaussianNB(),
    "SVM": SVC(),
    "Decision Tree": DecisionTreeClassifier(),
    "Random Forest": RandomForestClassifier(),
    "K-Nearest Neighbors": KNeighborsClassifier(),
    "Gradient Boosting": GradientBoostingClassifier()
}

# Function to evaluate a model and return metrics
def evaluate_model(clf, X_train, y_train, X_test, y_test):
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)

    return {
        "Accuracy": accuracy_score(y_test, y_pred),
        "F1 Score": f1_score(y_test, y_pred, average='weighted'),
        "Precision": precision_score(y_test, y_pred, average='weighted'),
        "Recall": recall_score(y_test, y_pred, average='weighted')
    }

# Function to compare all classifiers
def compare_classifiers(classifiers, X_train, y_train, X_test, y_test):
    results = {}
    for name, clf in classifiers.items():
        print(f"\nEvaluating {name}...")
        results[name] = evaluate_model(clf, X_train, y_train, X_test, y_test)
    return results

# Main logic
results = compare_classifiers(classifiers, X_train, y_train, X_test, y_test)

# Save results to output file
with open(output_file, 'w') as f:
    json.dump(results, f)

print(f"Comparison results saved to {output_file}")

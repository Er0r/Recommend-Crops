# comparison_dl.py
import sys
import json
import pandas as pd
import numpy as np
import tensorflow as tf

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    accuracy_score
)
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    Dense,
    Dropout,
    Conv1D,
    MaxPooling1D,
    Flatten
)

# For reproducibility
seed = 42
np.random.seed(seed)
tf.random.set_seed(seed)

def evaluate_model(model, X_test, y_test):
    """Helper function to evaluate a trained Keras model."""
    y_pred = model.predict(X_test)
    y_pred_classes = np.argmax(y_pred, axis=1)

    precision = precision_score(y_test, y_pred_classes, average='weighted')
    recall = recall_score(y_test, y_pred_classes, average='weighted')
    f1 = f1_score(y_test, y_pred_classes, average='weighted')
    accuracy = accuracy_score(y_test, y_pred_classes)

    return {
        "Precision": precision,
        "Recall": recall,
        "F1 Score": f1,
        "Accuracy": accuracy
    }

def main():
    if len(sys.argv) < 3:
        print("Usage: python comparison_dl.py <input_csv> <output_json>")
        sys.exit(1)

    input_csv = sys.argv[1]
    output_json = sys.argv[2]

    # Load dataset
    data = pd.read_csv(input_csv)

    # Separate features and target
    X = data[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']].values
    y = data['label'].values

    # Encode categorical labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    # Normalize features
    scaler = StandardScaler()
    X_normalized = scaler.fit_transform(X)

    # Reshape for 1D CNN (add a channel dimension)
    X_cnn = X_normalized.reshape(X_normalized.shape[0], X_normalized.shape[1], 1)

    # Split the dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X_cnn, y_encoded, test_size=0.2, random_state=seed
    )

    results = {}

    # 1. ANN Model (using flattened input)
    ann_model = Sequential([
        Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
        Dropout(0.2),
        Dense(32, activation='relu'),
        Dropout(0.2),
        Dense(len(np.unique(y_encoded)), activation='softmax')
    ])

    ann_model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    X_train_flat = X_train.reshape(X_train.shape[0], -1)
    X_test_flat = X_test.reshape(X_test.shape[0], -1)

    ann_model.fit(
        X_train_flat, y_train,
        epochs=10, batch_size=16, validation_split=0.1, verbose=0
    )

    results['ANN'] = evaluate_model(ann_model, X_test_flat, y_test)

    # 2. 1D CNN Model
    cnn_model = Sequential([
        Conv1D(64, kernel_size=3, activation='relu', input_shape=(X_train.shape[1], 1)),
        MaxPooling1D(pool_size=2),
        Flatten(),
        Dense(32, activation='relu'),
        Dropout(0.2),
        Dense(len(np.unique(y_encoded)), activation='softmax')
    ])

    cnn_model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    cnn_model.fit(
        X_train, y_train,
        epochs=10, batch_size=16, validation_split=0.1, verbose=0
    )

    results['1D CNN'] = evaluate_model(cnn_model, X_test, y_test)

    # 3. ResNet-style Model with Skip Connections
    from tensorflow.keras.layers import (
        BatchNormalization, GlobalAveragePooling1D,
        Input, Add, Activation
    )
    from tensorflow.keras import Model

    def residual_block(inputs, filters, kernel_size=3):
        x = inputs
        r = Conv1D(filters, kernel_size, padding='same', activation='relu')(x)
        r = BatchNormalization()(r)
        r = Conv1D(filters, kernel_size, padding='same')(r)
        r = BatchNormalization()(r)
        # Adjust channels if needed
        if inputs.shape[-1] != filters:
            x = Conv1D(filters, 1, padding='same')(x)
        r = Add()([r, x])
        return Activation('relu')(r)

    inputs = Input(shape=(X_train.shape[1], 1))
    x = Conv1D(32, 3, padding='same', activation='relu')(inputs)
    x = residual_block(x, 32)
    x = residual_block(x, 64)
    x = GlobalAveragePooling1D()(x)
    x = Dense(32, activation='relu')(x)
    x = Dropout(0.2)(x)
    outputs = Dense(len(np.unique(y_encoded)), activation='softmax')(x)

    resnet_model = Model(inputs=inputs, outputs=outputs)
    resnet_model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    resnet_model.fit(
        X_train, y_train,
        epochs=10, batch_size=16, validation_split=0.1, verbose=0
    )

    results['ResNet-style'] = evaluate_model(resnet_model, X_test, y_test)

    # Save results to JSON
    with open(output_json, 'w') as f:
        json.dump(results, f)

    print(json.dumps(results))

if __name__ == "__main__":
    main()

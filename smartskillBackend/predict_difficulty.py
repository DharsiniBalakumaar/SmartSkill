# File: smartskillBackend/predict_difficulty.py

import sys
import json
import pickle
from sklearn.exceptions import NotFittedError

# STEP 1: Load the saved model and label encoder
try:
    # Use 'rb' (read binary) mode for loading
    with open("difficulty_pipeline.pkl", "rb") as f:
        pipeline = pickle.load(f)
    with open("label_encoder.pkl", "rb") as f:
        le = pickle.load(f)
except FileNotFoundError:
    print(json.dumps({"error": "Model files not found. Ensure difficulty_pipeline.pkl and label_encoder.pkl exist."}))
    sys.exit(1)
except Exception as e:
    print(json.dumps({"error": f"Error loading model: {e}"}))
    sys.exit(1)

# STEP 2: Prediction Function
def predict_difficulty(question_text):
    if not question_text:
        return None

    # The pipeline handles tokenization, TF-IDF, and feature extraction
    try:
        # Note: The input must be iterable (a list), so we wrap the string
        pred_label_encoded = pipeline.predict([question_text.lower().strip()])[0]
        
        # Inverse transform to get the human-readable difficulty level
        difficulty = le.inverse_transform([pred_label_encoded])[0]
        
        return difficulty
    except NotFittedError:
        return "Model not fitted"
    except Exception as e:
        return f"Prediction Error: {e}"

# STEP 3: Handle execution via command line
if __name__ == '__main__':
    # The question text is expected as the first command-line argument
    if len(sys.argv) > 1:
        question = sys.argv[1]
        
        # Get prediction
        result = predict_difficulty(question)

        # Output the result as JSON for the Node.js backend to parse
        print(json.dumps({"success": True, "difficulty": result}))
    else:
        print(json.dumps({"success": False, "error": "No question text provided."}))
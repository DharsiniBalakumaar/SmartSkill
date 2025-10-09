import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
import pickle

# Load your dataset (Edit this)
df = pd.read_excel("questions.xlsx")  # Or use pd.read_excel("questions.xlsx")
X = df["Question"]            # The column containing the question text
y = df["DifficultyLevel"]               # The column with labels (e.g., Beginner, Intermediate, Advanced)

# Encode labels
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# Build pipeline
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer()),
    ("clf", LogisticRegression(max_iter=1000))
])

# Train
pipeline.fit(X, y_encoded)

# Save the trained pipeline
with open("difficulty_pipeline.pkl", "wb") as f:
    pickle.dump(pipeline, f)

# Save the label encoder
with open("label_encoder.pkl", "wb") as f:
    pickle.dump(le, f)

print("✅ Files saved in", __file__)

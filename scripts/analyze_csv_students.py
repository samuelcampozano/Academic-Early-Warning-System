"""
Script to analyze CSV files and find students not in database
"""
import pandas as pd
import sys
from pathlib import Path

# Read CSV files with latin-1 encoding
print("=== CSV FILE ANALYSIS ===\n")

# First page - student info
df1 = pd.read_csv('First page of the students information.csv', encoding='latin-1')
print(f"First page CSV: {len(df1)} students")
print(f"  Columns: {list(df1.columns)[:6]}")

# Economic activity  
df2 = pd.read_csv('Economic activity of the student.csv', encoding='latin-1')
print(f"Economic activity CSV: {len(df2)} rows")

# Habits
df3 = pd.read_csv('Information about the habit of the student.csv', encoding='latin-1')
print(f"Habits CSV: {len(df3)} rows")

# House info
df4 = pd.read_csv('Information about the house of the student.csv', encoding='latin-1')
print(f"House info CSV: {len(df4)} rows")

# Parent info
df5 = pd.read_csv('Information of the parent.orlegalrepresentative.csv', encoding='latin-1')
print(f"Parent info CSV: {len(df5)} rows")

print("\n=== First page columns ===")
for col in df1.columns:
    print(f"  - {col}")

# Check if there's student scores
score_files = list(Path('.').glob('Student score*/*.xlsx')) + list(Path('.').glob('Student score*/*.xls'))
print(f"\n=== Score files found: {len(score_files)} ===")
for f in score_files[:5]:
    print(f"  {f}")

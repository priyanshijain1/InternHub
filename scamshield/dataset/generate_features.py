import pandas as pd

INPUT_FILE = "dataset/final_real_fraud_dataset.csv"
OUTPUT_FILE = "dataset/processed_dataset.csv"
def generate():

    df = pd.read_csv(INPUT_FILE)
    rows = []

    for i, row in df.iterrows():

        text = str(row["description"]).lower()
        label = int(row["label"])

        features = {
            "domain_risk":0,
            "payment_flag": int("fee" in text or "pay" in text),
            "ssl_risk":0,
            "email_risk": int("gmail" in text or "yahoo" in text),
            "nlp_risk": text.count("!")/5,
            "pattern_boost": int("urgent" in text),
            "complaint_risk":0,
            "similarity_risk": int("work from home" in text),
            "geo_risk":0,
            "contact_risk": int("whatsapp" in text or "telegram" in text),
            "interview_risk": int("telegram interview" in text),
            "company_risk":0,
            "linguistic_risk": int(text.isupper()),
            "recruiter_risk": int("linkedin" not in text),
            "document_risk": int("passport" in text)
        }

        features["label"] = label
        rows.append(features)

        if i % 500 == 0:
            print("Processed", i)

    df2 = pd.DataFrame(rows)
    df2.to_csv(OUTPUT_FILE,index=False)

    print("DONE")

if __name__ == "__main__":
    generate()
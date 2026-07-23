import pandas as pd

def load_data(path: str)-> pd.DataFrame:
    df = pd.read_csv(path)
    print ( f"Data loaded : {df.shape}")
    return df

if __name__=="__main__":
    load_data("postgresql://postgres:VinayBellamkonda@db.ovvvcudvagbnlojfmmnx.supabase.co:5432/postgresql")
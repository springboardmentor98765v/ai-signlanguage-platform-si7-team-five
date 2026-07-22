from deployment import load_model 

def integrate_model():
   model = load_model()
   
   print("Ïntegrated loaded model into the pipeline.")
   
   return model  
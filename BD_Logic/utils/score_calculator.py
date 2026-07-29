def calculator_accuracy(expected_sign, predicted_sign, confidence):
    if expected_sign == predicted_sign:
        return round(confidence*100,2)
    else: 
        return round((1-confidence)*100,2)

    
        
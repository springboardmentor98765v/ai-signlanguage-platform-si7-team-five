def calculator_accuracy(expected, predicted, confidence):
    if expected == predicted:
        return round(confidence*100,2)
    
    return 0.0

    
        
def generate_feedback(
    expected_sign,
    predicted_sign,
    confidence,
    accuracy
):
    if accuracy == 100:
        return (
            "Excellent! You are perfect in signing '{expected_sign}' ."
        )
    if accuracy >= 80:
        return (
            "Good! Your sign '{predicted_sign}' is correct but needs improvement."
            
        
        )
    if predicted_sign != expected_sign:
        return (
            "Your sign '{predicted_sign}' is incorrect."
            f"You should sign '{expected_sign}'."
        )
    if confidence <0.70:
        return(
            "Low Confidence! You should practice again."
            
        )
    return(
        "Needs Practice!"
    )

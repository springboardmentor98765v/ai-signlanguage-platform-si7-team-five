def generate_feedback(
    expected_sign,
    predicted_sign,
    confidence,
    accuracy
):
    if accuracy == 100:
        return (
            "perfect",
            f"Excellent! You are perfect in signing '{expected_sign}'."
        )
    if accuracy >= 80:
        return (
            "good",
            f"Good! Your sign '{predicted_sign}' is correct but needs improvement."
        )
    if predicted_sign != expected_sign:
        return (
            "incorrect",
            f"Your sign '{predicted_sign}' is incorrect. You should sign '{expected_sign}'."
        )
    if confidence < 0.70:
        return (
            "low_confidence",
            "Low Confidence! You should practice again."
        )
    return (
        "needs_practice",
        "Needs practice!"
    )

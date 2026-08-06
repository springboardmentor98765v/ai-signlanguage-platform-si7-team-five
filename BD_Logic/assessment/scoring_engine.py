# INTERN 4 CHECKPOINT: Weighted Scoring Engine
# This engine calculates comprehensive scores for sign language assessments
# It implements weighted scoring based on multiple factors: hand shape, finger position, motion, timing, and confidence

from .weights import WEIGHTS

class WeightedScoringEngine:
    # INTERN 4 CHECKPOINT: Score calculation method
    # Calculates a weighted score based on multiple sign language assessment factors
    # Each factor is weighted according to its importance in sign language recognition
    def calculate_score(
        self,
        hand_shape,
        finger_position,
        motion,
        timing,
        confidence
    ):
        
        score = (
            hand_shape * WEIGHTS["hand_shape"] +
            finger_position * WEIGHTS["finger_position"] +
            motion * WEIGHTS["motion"] +
            timing * WEIGHTS["timing"] +
            confidence * WEIGHTS["confidence"]
        )
        
        return(score,2)
from .weights import WEIGHTS

class WeightedScoringEngine:
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
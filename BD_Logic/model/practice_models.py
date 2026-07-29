from dataclasses import dataclass

@dataclass
class PracticeAttempt:
    user_id: str
    course_id: str
    expected_sign: str
    predicted_sign: str
    confidence: float
    hand_shape_score: float
    finger_position_score: float
    motion_score: float
    timing_score: float
    
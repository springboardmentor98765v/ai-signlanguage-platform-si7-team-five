
from BD_Logic.model.assessment import Assessment
from BD_Logic.repository.assessment_repository import save 
from BD_Logic.utils.score_calculator import calculator_accuracy

def evaluate(request):
    
    prediction = predict_sign(request.session_id)
    
    accuracy = calculate_accuracy(
        request.expected_sign,
        prediction["predicted_sign"],
        prediction["confidence"]
    )
assessment = Assessment(
    request.session_id,
    request.expected_sign,
    prediction["predicted_sign"],
    prediction["confidence"],
    accuracy
)

save(assessment)
  
return{
    "assessment_id": assessment.assessment_id,
    "expected_sign": assessment.expected_sign,
    "predicted_sign": assessment.predicted_sign,
    "confidence": assessment.confidence,
    "accuracy": assessment.accuracy
}
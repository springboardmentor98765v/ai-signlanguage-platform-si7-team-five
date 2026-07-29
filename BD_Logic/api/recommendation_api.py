from fastapi import APIRouter
from schemas.recommendation_schema import RecommendationRequest
from recommendation.recommendation_services import RecommendationService

router = APIRouter()

service = RecommendationService()

@router.post("/recommendation")
def recommendations(request:RecommendationRequest):

    return {
        "recommendations":

        service.get_recommendations(

            request.user_id
        )
        
    }
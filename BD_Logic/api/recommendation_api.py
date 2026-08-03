from fastapi import APIRouter
from BD_Logic.schemas.recommendation_schema import RecommendationRequest
from BD_Logic.recommendation.recommendation_services import RecommendationService

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
class RecommendationEngine:
    def recommend(self,weak_letters):
       recommendations = []
    
       for letter in weak_letters:
        recommendations.append(
            f"Practice letter {letter} to improve your accuracy."
        )
    
       return recommendations
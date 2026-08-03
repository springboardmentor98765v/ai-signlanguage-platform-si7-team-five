from data.lessons import LESSONS


class RecommendationEngine:
    def recommend(self,weak_signs):
       recommendations = []
    
       for sign in weak_signs:
           if sign in LESSONS:
               recommendations.append({
                   "letter": sign,
                   "lesson": LESSONS[sign]
                   
               })
                   
        
    
       return recommendations
# INTERN 4 CHECKPOINT: Recommendation Engine
# This engine generates personalized lesson recommendations based on weak signs
# It suggests specific lessons to help users improve their sign language skills

from data.lessons import LESSONS


class RecommendationEngine:
    # INTERN 4 CHECKPOINT: Recommendation generation method
    # Generates lesson recommendations based on identified weak signs
    # Maps weak signs to specific lessons for targeted practice
    def recommend(self, weak_signs):
       recommendations = []
    
       for sign in weak_signs:
           if sign in LESSONS:
               recommendations.append({
                   "letter": sign,
                   "lesson": LESSONS[sign]
                   
               })
                   
        
    
       return recommendations
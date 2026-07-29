class Analyticsengine:
    def weekly_summary(self,attempt):
        
        if len(attempt) == 0:
            return {
                "average_score":0,
                "attempts":0,
            }
            
        avg = sum(attempt)/len(attempt)
        
        return{
            "average_score":avg,
            "attempts":len(attempt)
        }
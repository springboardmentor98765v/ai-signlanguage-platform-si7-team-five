class Analyticsengine:
    def generate_summary(self,history,average,weak):
        
        if len(history) == 0:
            return {

                "average_score": 0,

                "total_attempts": 0,

                "best_score": 0,

                "weak_signs": []

            }

                    
            
            
        scores= [
            x["score"] for x in history
        ]
        avg = sum(scores)/len(scores)
        
        best = max(scores)
        
        weak_signs = [
            x["expected_sign"] for x in history
            if x["score"] < 60
        ]
        
        
        
        
        return{
            "average_score": round(average,2),

            "total_attempts": len(history),

            "best_score": best,

            "weak_signs": list(set(weak))
        }
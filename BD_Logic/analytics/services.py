from BD_Logic.database.crud import DatabaseService


class AnalyticsService:

    def __init__(self):

        self.database=DatabaseService()


    def save_assessment(self,record):

        self.database.save_assessment(record)


    def get_user_history(self,user_id):

        history=self.database.get_history(user_id)

        return [

            {

                "score":x.score,

                "expected_sign":x.expected_sign

            }

            for x in history

        ]
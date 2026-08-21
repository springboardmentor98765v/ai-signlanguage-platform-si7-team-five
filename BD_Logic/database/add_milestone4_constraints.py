from sqlalchemy import text

from BD_Logic.database.connection import engine


def add_constraints():
    constraints = [
        """
        ALTER TABLE certification_exam_results
        ADD CONSTRAINT fk_certification_exam_results_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        """,
        """
        ALTER TABLE trainer_learner_mapping
        ADD CONSTRAINT fk_trainer_learner_trainer
        FOREIGN KEY (trainer_id)
        REFERENCES users(id)
        """,
        """
        ALTER TABLE trainer_learner_mapping
        ADD CONSTRAINT fk_trainer_learner_learner
        FOREIGN KEY (learner_id)
        REFERENCES users(id)
        """,
    ]

    with engine.begin() as connection:
        for constraint in constraints:
            try:
                connection.execute(text(constraint))
                print("Constraint added successfully.")
            except Exception as error:
                error_message = str(error)

                if "already exists" in error_message:
                    print("Constraint already exists. Skipping.")
                else:
                    raise

    print("\nMilestone 4 foreign-key constraints completed.")


if __name__ == "__main__":
    add_constraints()
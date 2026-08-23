import sqlite3
import datetime

def seed():
    conn = sqlite3.connect('signlanguage_platform.db')  # or match the exact file name. Wait, the main.py says engine = create_engine('sqlite:///./signlanguage.db') let me check db.py
    # actually it's signlanguage.db
    # wait let me just use sqlalchemy engine execution
    conn.close()

if __name__ == '__main__':
    seed()

import sqlite3

def upgrade_db():
    try:
        conn = sqlite3.connect('fitpilot.db')
        cursor = conn.cursor()
        
        # Check if fiber column exists
        cursor.execute("PRAGMA table_info(nutrition_logs)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'fiber' not in columns:
            print("Adding fiber column to nutrition_logs...")
            cursor.execute("ALTER TABLE nutrition_logs ADD COLUMN fiber FLOAT")
            conn.commit()
            print("Migration successful.")
        else:
            print("Fiber column already exists.")
            
    except Exception as e:
        print(f"Error migrating DB: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    upgrade_db()

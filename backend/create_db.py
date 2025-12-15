import os
import pymysql
import sys

# Connect to MySQL server (no database selected initially)
try:
    connection = pymysql.connect(
        host=os.getenv('DB_HOST', '127.0.0.1'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    
    db_name = os.getenv('DB_NAME', 'smartdine')
    
    with connection.cursor() as cursor:
        print(f"Checking if database '{db_name}' exists...")
        cursor.execute(f"SHOW DATABASES LIKE '{db_name}'")
        result = cursor.fetchone()
        
        if not result:
            print(f"Database '{db_name}' does not exist. Creating...")
            cursor.execute(f"CREATE DATABASE {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f"Database '{db_name}' created successfully.")
        else:
            print(f"Database '{db_name}' already exists.")
            
    connection.close()

except Exception as e:
    print(f"Error creating database: {e}")
    sys.exit(1)

# database.py - Database operations

import sqlite3
import json
from datetime import datetime

class Database:
    def __init__(self, db_path='cropdoc.db'):
        self.db_path = db_path
        self.init_db()

    def init_db(self):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        
        # Create tables
        c.execute('''
            CREATE TABLE IF NOT EXISTS detections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                crop TEXT,
                condition TEXT,
                confidence REAL,
                symptoms TEXT,
                treatment TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        c.execute('''
            CREATE TABLE IF NOT EXISTS npk_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nitrogen REAL,
                phosphorus REAL,
                potassium REAL,
                ratio TEXT,
                status TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        c.execute('''
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT,
                data TEXT,
                filename TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()

    def save_detection(self, result):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute('''
            INSERT INTO detections (crop, condition, confidence, symptoms, treatment)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            result.get('crop', 'Unknown'),
            result.get('condition', 'Unknown'),
            result.get('confidence', 0),
            json.dumps(result.get('symptoms', [])),
            json.dumps(result.get('treatment', {}))
        ))
        conn.commit()
        conn.close()

    def save_npk(self, result):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        npk = result.get('npk', {})
        c.execute('''
            INSERT INTO npk_analysis (nitrogen, phosphorus, potassium, ratio, status)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            npk.get('nitrogen', 0),
            npk.get('phosphorus', 0),
            npk.get('potassium', 0),
            result.get('ratio', '0-0-0'),
            result.get('status', 'Unknown')
        ))
        conn.commit()
        conn.close()

    def get_history(self, limit=50):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute('''
            SELECT id, crop, condition, confidence, timestamp
            FROM detections
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (limit,))
        rows = c.fetchall()
        conn.close()
        
        return [{
            'id': r[0],
            'crop': r[1],
            'condition': r[2],
            'confidence': r[3],
            'timestamp': r[4]
        } for r in rows]

    def save_report(self, report_type, data, filename):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute('''
            INSERT INTO reports (type, data, filename)
            VALUES (?, ?, ?)
        ''', (report_type, json.dumps(data), filename))
        conn.commit()
        conn.close()

# app.py - Flask backend for CropDoc Pro

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import os
from datetime import datetime
from models import DiseaseModel, NPKModel
from database import Database
from report_generator import ReportGenerator

app = Flask(__name__)
CORS(app)

db = Database()
disease_model = DiseaseModel()
npk_model = NPKModel()
report_gen = ReportGenerator()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'version': '2.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/detect', methods=['POST'])
def detect_disease():
    try:
        data = request.get_json()
        image_data = data.get('image', '')
        
        # Run detection
        result = disease_model.predict(image_data)
        
        # Store in database
        db.save_detection(result)
        
        return jsonify({
            'success': True,
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/npk', methods=['POST'])
def analyze_npk():
    try:
        data = request.get_json()
        image_data = data.get('image', '')
        
        result = npk_model.analyze(image_data)
        
        return jsonify({
            'success': True,
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        limit = request.args.get('limit', 50, type=int)
        history = db.get_history(limit)
        return jsonify({
            'success': True,
            'data': history
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/report', methods=['POST'])
def generate_report():
    try:
        data = request.get_json()
        report_type = data.get('type', 'weekly')
        
        report = report_gen.generate(report_type, data.get('data', {}))
        
        return jsonify({
            'success': True,
            'report': report,
            'url': f'/reports/{report["id"]}.pdf'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/reports/<report_id>', methods=['GET'])
def get_report(report_id):
    try:
        file_path = report_gen.get_report(report_id)
        if file_path and os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        return jsonify({'success': False, 'error': 'Report not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

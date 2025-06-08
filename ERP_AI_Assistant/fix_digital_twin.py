#!/usr/bin/env python3
"""
SZYBKA NAPRAWA DIGITAL TWIN ROUTING
"""

import os
from flask import Flask, send_from_directory

app = Flask(__name__)

@app.route('/digital-twin-advanced.html')
def digital_twin_direct():
    """Bezpośredni dostęp do Digital Twin"""
    return send_from_directory(os.getcwd(), 'digital-twin-advanced.html')

@app.route('/twin')
def digital_twin_alias():
    """Alias dla Digital Twin"""
    return send_from_directory(os.getcwd(), 'digital-twin-advanced.html')

@app.route('/digital-twin-advanced.css')
def digital_twin_css():
    """CSS dla Digital Twin"""
    return send_from_directory(os.getcwd(), 'digital-twin-advanced.css')

@app.route('/digital-twin-advanced.js')
def digital_twin_js():
    """JS dla Digital Twin"""
    return send_from_directory(os.getcwd(), 'digital-twin-advanced.js')

@app.route('/')
def index():
    """Główna strona - przekierowanie do Digital Twin"""
    return send_from_directory(os.getcwd(), 'digital-twin-advanced.html')

if __name__ == '__main__':
    print("[FIX] Naprawiam routing Digital Twin...")
    print("Testuj na: http://127.0.0.1:5001/twin")
    app.run(host='127.0.0.1', port=5001, debug=False)

from flask import Flask, request, jsonify, session, send_from_directory
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Simuler une base de données d'utilisateurs
users = {
    'admin': '0410'
}

@app.route('/register', methods=['POST'])
def register():
    if 'username' not in session or session['username'] != 'admin':
        return jsonify({'message': 'Accès refusé'}), 403

    data = request.json
    new_username = data.get('username')
    new_password = data.get('password')

    if new_username in users:
        return jsonify({'message': 'L\'utilisateur existe déjà'}), 400

    users[new_username] = new_password
    return jsonify({'message': 'Utilisateur créé avec succès'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username in users and users[username] == password:
        session['username'] = username
        role = 'admin' if username == 'admin' else 'user'
        return jsonify({'message': 'Connexion réussie!', 'role': role}), 200
    else:
        return jsonify({'message': 'Nom d\'utilisateur ou mot de passe incorrect'}), 401

@app.route('/is_admin', methods=['GET'])
def is_admin():
    if 'username' in session and session['username'] == 'admin':
        return jsonify({'is_admin': True}), 200
    else:
        return jsonify({'is_admin': False}), 200

@app.route('/<path:path>', methods=['GET'])
def serve_file(path):
    return send_from_directory('.', path)

@app.route('/')
def index():
    return send_from_directory('.', 'login.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)

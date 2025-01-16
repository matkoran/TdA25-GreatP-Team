from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import json

app = Flask(__name__)

# Inicializace prázdného hracího pole (15x15)
matrix = [[0 for _ in range(15)] for _ in range(15)]
game_name = None
moves = []

# Složka pro uložení her
SAVED_GAMES_DIR = "saved_games"
os.makedirs(SAVED_GAMES_DIR, exist_ok=True)

def check(x, y, pole, z):
    if x > 14 or x < 0 or y > 14 or y < 0:
        return False
    elif pole[y][x] == z:
        return True
    else:
        return False

def win(x, y, pole, z):
    p1 = 1
    p2 = 1

    # Horizontální
    while check(x + p1, y, pole, z):
        p1 += 1
    while check(x - p2, y, pole, z):
        p2 += 1
    if p1 + p2 - 1 >= 5:
        return True
    else:
        p1 = 1
        p2 = 1

    # Vertikální
    while check(x, y - p1, pole, z):
        p1 += 1
    while check(x, y + p2, pole, z):
        p2 += 1
    if p1 + p2 - 1 >= 5:
        return True
    else:
        p1 = 1
        p2 = 1

    # Diagonální /
    while check(x + p1, y - p1, pole, z):
        p1 += 1
    while check(x - p2, y + p2, pole, z):
        p2 += 1
    if p1 + p2 - 1 >= 5:
        return True
    else:
        p1 = 1
        p2 = 1

    # Diagonální \
    while check(x - p1, y - p1, pole, z):
        p1 += 1
    while check(x + p2, y + p2, pole, z):
        p2 += 1
    if p1 + p2 - 1 >= 5:
        return True
    else:
        return False

@app.route('/')
def start():
    """
    Úvodní stránka se seznamem uložených her.
    """
    games = os.listdir(SAVED_GAMES_DIR)
    return render_template('start.html', games=games)

@app.route('/game', methods=['POST'])
def game():
    """
    Zobrazí herní stránku po zadání názvu hry.
    """
    global game_name, matrix, moves
    game_name = request.form['game_name']
    file_path = os.path.join(SAVED_GAMES_DIR, f"{game_name}.json")

    # Kontrola, zda již hra existuje
    if os.path.exists(file_path):
        return render_template('start.html', games=os.listdir(SAVED_GAMES_DIR), error=f"Hra '{game_name}' již existuje. Zvolte jiné jméno.")

    # Inicializace nové hry
    matrix = [[0 for _ in range(15)] for _ in range(15)]
    moves = []
    return render_template('index.html', game_name=game_name)


@app.route('/load_game_data/<game_name>')
def load_game_data(game_name):
    """
    Vrátí data hry ve formátu JSON.
    """
    file_path = os.path.join(SAVED_GAMES_DIR, game_name)
    if not os.path.exists(file_path):
        return jsonify({"error": "Hra neexistuje"}), 404

    with open(file_path, 'r') as f:
        data = json.load(f)

    return jsonify(data)

@app.route('/api/play', methods=['POST'])
def play():
    """
    API endpoint zpracovávající tah hráče.
    """
    global moves
    data = request.json
    x = data['x']
    y = data['y']
    player = data['player']

    # Kontrola, zda je pole volné
    if matrix[y][x] != 0:
        return jsonify({"success": False, "message": "Pole je již obsazené!"})

    # Zapsání tahu hráče
    matrix[y][x] = player
    moves.append({"x": x, "y": y, "player": player})

    # Kontrola výhry
    if win(x, y, matrix, player):
        save_game()
        return jsonify({"success": True, "winner": player, "message": "Máme vítěze!"})

    return jsonify({"success": True, "message": "Tah zapsán."})

def save_game():
    """
    Uloží záznam hry do JSON souboru.
    """
    if game_name:
        file_path = os.path.join(SAVED_GAMES_DIR, f"{game_name}.json")
        with open(file_path, 'w') as f:
            json.dump({"game_name": game_name, "moves": moves}, f)

if __name__ == '__main__':
    app.run(debug=True)

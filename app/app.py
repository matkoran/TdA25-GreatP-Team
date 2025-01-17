from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import json
from datetime import datetime

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
    winning_combination = []

    # Horizontální
    while check(x + p1, y, pole, z):
        p1 += 1
    while check(x - p2, y, pole, z):
        p2 += 1
    if p1 + p2 - 1 >= 5:
        winning_combination = [(x + i, y) for i in range(-p2 + 1, p1)]
        return True, winning_combination

    # Vertikální
    p1 = p2 = 1
    while check(x, y - p1, pole, z):
        p1 += 1
    while check(x, y + p2, pole, z):
        p2 += 1
    if p1 + p2 - 1 >= 5:
        winning_combination = [(x, y + i) for i in range(-p1 + 1, p2)]
        return True, winning_combination

    # Diagonální /
    p1 = p2 = 1
    while check(x + p1, y - p1, pole, z):
        p1 += 1
    while check(x - p2, y + p2, pole, z):
        p2 += 1
    if p1 + p2 - 1 >= 5:
        winning_combination = [(x + i, y - i) for i in range(-p2 + 1, p1)]
        return True, winning_combination

    # Diagonální \
    p1 = p2 = 1
    while check(x - p1, y - p1, pole, z):
        p1 += 1
    while check(x + p2, y + p2, pole, z):
        p2 += 1
    if p1 + p2 - 1 >= 5:
        winning_combination = [(x + i, y + i) for i in range(-p2 + 1, p1)]
        return True, winning_combination

    return False, []

@app.route('/')
def start():
    """
    Úvodní stránka se seznamem uložených her.
    """
    games = []
    for file_name in os.listdir(SAVED_GAMES_DIR):
        if file_name.endswith('.json'):
            file_path = os.path.join(SAVED_GAMES_DIR, file_name)
            with open(file_path, 'r') as f:
                data = json.load(f)
                games.append({"name": data["game_name"], "date": data.get("date", "Neznámé datum")})

    # Seřazení her podle data sestupně
    games.sort(key=lambda x: x["date"], reverse=True)
    return render_template('start.html', games=games)

@app.route('/game', methods=['POST'])
def game():
    """
    Zobrazí herní stránku po zadání názvu hry a jmen hráčů.
    """
    global game_name, matrix, moves, player1, player2
    game_name = request.form['game_name'].replace(" ", "_")
    player1 = request.form.get('player1', 'Hráč 1')
    player2 = request.form.get('player2', 'Hráč 2')

    file_path = os.path.join(SAVED_GAMES_DIR, f"{game_name}.json")

    # Kontrola, zda již hra existuje
    if os.path.exists(file_path):
        return render_template('start.html', games=os.listdir(SAVED_GAMES_DIR), error=f"Hra '{game_name}' již existuje. Zvolte jiné jméno.")

    # Inicializace nové hry
    matrix = [[0 for _ in range(15)] for _ in range(15)]
    moves = []
    return render_template('index.html', game_name=game_name, player1=player1, player2=player2)


@app.route('/load_game_data/<game_name>')
def load_game_data(game_name):
    """
    Vrátí data hry ve formátu JSON.
    """
    file_path = os.path.join(SAVED_GAMES_DIR, f"{game_name}.json")
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

@app.route('/api/replay', methods=['GET'])
def replay():
    """
    API endpoint pro přehrávání tahů.
    Vrací tah na základě indexu v parametru `step`.
    """
    game_name = request.args.get('game_name')
    step = int(request.args.get('step', 0))
    file_path = os.path.join(SAVED_GAMES_DIR, f"{game_name}.json")

    if not os.path.exists(file_path):
        return jsonify({"error": "Hra neexistuje"}), 404

    with open(file_path, 'r') as f:
        data = json.load(f)

    moves = data.get("moves", [])
    if step < 0 or step >= len(moves):
        return jsonify({"error": "Neplatný krok"}), 400

    current_move = moves[step]
    return jsonify({"move": current_move, "step": step, "total_steps": len(moves)})

def save_game():
    """
    Uloží záznam hry do JSON souboru.
    """
    if game_name:
        file_path = os.path.join(SAVED_GAMES_DIR, f"{game_name}.json")
        
        # Získání aktuálního času ve formátu "HH:MM"
        current_time = datetime.now().strftime("%m/%d/%Y, %H:%M")
        
        with open(file_path, 'w') as f:
            json.dump({"game_name": game_name, "moves": moves, "date": current_time}, f)


@app.route('/delete_game/<game_name>', methods=['DELETE'])
def delete_game(game_name):
    """
    Smaže hru na základě jejího názvu.
    """
    file_path = os.path.join(SAVED_GAMES_DIR, f"{game_name}.json")

    # Kontrola, zda soubor existuje
    if not os.path.exists(file_path):
        return jsonify({"error": "Hra neexistuje"}), 404

    # Smazání souboru hry
    os.remove(file_path)
    return jsonify({"success": True, "message": f"Hra '{game_name}' byla úspěšně smazána."})


if __name__ == '__main__':
    app.run(debug=True)

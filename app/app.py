# Importy a inicializace aplikace Flask
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

    # Diagonální 1
    while check(x + p1, y - p1, pole, z):
        p1 += 1
    while check(x - p2, y + p2, pole, z):
        p2 += 1
    if p1 + p2 - 1 >= 5:
        return True
    else:
        p1 = 1
        p2 = 1

    # Diagonální 2
    while check(x + p1, y + p1, pole, z):
        p1 += 1
    while check(x - p2, y - p2, pole, z):
        p2 += 1
    if p1 + p2 - 1 >= 5:
        return True
    else:
        return False

@app.route("/api/save_game", methods=["POST"])
def save_game():
    global game_name, moves
    if not game_name:
        return jsonify({"message": "Žádná hra není aktivní."}), 400

    game_data = {
        "name": game_name,
        "moves": moves,
        "matrix": matrix,
        "saved_at": datetime.now().isoformat()
    }

    file_path = os.path.join(SAVED_GAMES_DIR, f"{game_name}.json")
    with open(file_path, "w") as f:
        json.dump(game_data, f)

    return jsonify({"message": "Hra byla úspěšně uložena."}), 200

@app.route("/api/load_game", methods=["GET"])
def load_game():
    global game_name, moves, matrix
    game_name = request.args.get("name")
    if not game_name:
        return jsonify({"message": "Není zadán název hry."}), 400

    file_path = os.path.join(SAVED_GAMES_DIR, f"{game_name}.json")
    if not os.path.exists(file_path):
        return jsonify({"message": "Hra neexistuje."}), 404

    with open(file_path, "r") as f:
        game_data = json.load(f)

    moves = game_data["moves"]
    matrix = game_data["matrix"]

    return jsonify({"message": "Hra byla úspěšně načtena.", "game": game_data}), 200

# Endpoint for deleting a saved game
@app.route("/api/delete_game", methods=["POST"])
def delete_game():
    try:
        # Load game name from the request
        game_name = request.json.get("game_name")
        if not game_name:
            return jsonify({"message": "Není zadán název hry."}), 400

        # Path to the game file
        game_path = os.path.join(SAVED_GAMES_DIR, f"{game_name}.json")

        # Check if the file exists
        if not os.path.exists(game_path):
            return jsonify({"message": "Hra nebyla nalezena."}), 404

        # Delete the file
        os.remove(game_path)
        return jsonify({"message": "Hra byla úspěšně odstraněna."}), 200

    except Exception as e:
        return jsonify({"message": "Došlo k chybě.", "error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Inicializace prázdného hracího pole (15x15)
matrix = [[0 for _ in range(15)] for _ in range(15)]

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


    #horizontální
    while check(x+p1, y, pole, z):
        p1 = p1 + 1
        print(p1)
    while check(x-p2, y, pole, z):
        p2 = p2 + 1
        print(p2)
    if p1 + p2 - 1 >= 5:
        return True
    else:
        p1 = 1
        p2 = 1

    #vertikální
    while check(x, y-p1, pole, z):
        p1 = p1 + 1
    while check(x, y+p2, pole, z):
        p2 = p2 + 1
    if p1 + p2 - 1 >= 5:
        return True
    else:
        p1 = 1
        p2 = 1
    
    #diagonální /
    while check(x+p1, y-p1, pole, z):
        p1 = p1 + 1
    while check(x-p2, y+p2, pole, z):
        p2 = p2 + 1
    if p1 + p2 - 1 >= 5:
        return True
    else:
        p1 = 1
        p2 = 1
    
    #diagonální \
    while check(x-p1, y-p1, pole, z):
        p1 = p1 + 1
    while check(x+p2, y+p2, pole, z):
        p2 = p2 + 1
    if p1 + p2 - 1 >= 5:
        return True
    else:
        return False


@app.route('/')
def index():
    """
    Hlavní stránka aplikace s herním polem.
    """
    return render_template('index.html')

@app.route('/api/play', methods=['POST'])
def play():
    """
    API endpoint zpracovávající tah hráče.
    """
    data = request.json
    x = data['x']
    y = data['y']
    player = data['player']

    # Kontrola, zda je pole volné
    if matrix[y][x] != 0:
        return jsonify({"success": False, "message": "Pole je již obsazené!"})

    # Zapsání tahu hráče
    matrix[y][x] = player

    # Kontrola výhry
    if win(x, y, matrix, player):
        return jsonify({"success": True, "winner": player, "message": "Máme vítěze!"})

    return jsonify({"success": True, "message": "Tah zapsán."})

if __name__ == '__main__':
    app.run(debug=True)

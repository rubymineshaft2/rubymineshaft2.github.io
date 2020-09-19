class BoardNode {
    constructor() {
        this.color = 0
        this.connections = new Set()
    }
}

class Board {
    constructor(width, height) {
        this.size = width;
        this.width = width
        this.height = height
        this.turn = 1
        this.nodes = new Set()
        this.color = 'gray';
        

        for (let x = 0; x < this.width; x ++) {
            this[x] = {}
            for (let y = 0; y < this.height; y ++) {
                let node = new BoardNode()
                this[x][y] = node
            }
        }

        for (let x = 0; x + 1 < this.width; x ++) {
            for (let y = 0; y < this.height; y ++) {
                this[x][y].connections.add(this[x+1][y])
                this[x+1][y].connections.add(this[x][y])
            }
        }

        for (let x = 0; x < this.width; x ++) {
            for (let y = 0; y + 1 < this.height; y ++) {
                this[x][y].connections.add(this[x][y+1])
                this[x][y+1].connections.add(this[x][y])
            }
        }
    }
}

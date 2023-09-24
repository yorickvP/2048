class KeyboardInputManager {
    constructor() {
        this.events = {}
        this.listen()
    }
    on(e, t) {
        if (!this.events[e])
            this.events[e] = []
        this.events[e].push(t)
    }
    emit(e, t) {
        if (this.events[e])
            this.events[e].forEach(e => e(t))
    }
    listen() {
        const o = {
            38: 0, 39: 1, 40: 2, 37: 3,
            75: 0, 76: 1, 74: 2, 72: 3,
            87: 0, 68: 1, 83: 2, 65: 3
        };
        document.addEventListener("keydown", (e) => {
            const mod = e.altKey || e.ctrlKey || e.metaKey || e.shiftKey,
                  vec = o[e.which];
            if (!this.targetIsInput(e) && !mod) {
                if (vec !== undefined) {
                    e.preventDefault()
                    this.emit("move", vec)
                }
                if (82 === e.which)
                    this.restart(e)
            }
            

        })
        this.bindButtonPress(".retry-button", this.restart),
        this.bindButtonPress(".restart-button", this.restart)
        this.bindButtonPress(".keep-playing-button", this.keepPlaying);
        var n = document.getElementsByClassName("game-container")[0];
        n.addEventListener("touchstart", (function(o) {
            if (!(o.touches.length > 1 || o.targetTouches.length > 1 || i.targetIsInput(o))) {
                e = o.touches[0].clientX
                t = o.touches[0].clientY
                o.preventDefault()
            }
        }), {passive: true})
        n.addEventListener("touchmove", e => e.preventDefault(), {passive: true})
        n.addEventListener("touchend", (function(o) {
            if (!(o.touches.length > 0 || o.targetTouches.length > 0 || i.targetIsInput(o))) {
                const {clientX, clientY} = o.changedTouches[0]
                var r = clientX - e,
                    s = Math.abs(r),
                    c = clientY - t,
                    l = Math.abs(c);
                if (Math.max(s, l) > 10)
                    i.emit("move", s > l ? r > 0 ? 1 : 3 : c > 0 ? 2 : 0)
            }
        }))
    }
    restart(e) {
        e.preventDefault()
        this.emit("restart")
    }
    keepPlaying(e) {
        e.preventDefault()
        this.emit("keepPlaying")
    }
    bindButtonPress(e, t) {
        var i = document.querySelector(e);
        i.addEventListener("click", t.bind(this))
        i.addEventListener("touchend", t.bind(this))
    }
    targetIsInput(e) {
        return "input" === e.target.tagName.toLowerCase()
    }
}

class HTMLActuator {
    constructor() {
        Object.assign(this, {
            tileContainer: document.querySelector(".tile-container"),
            scoreContainer: document.querySelector(".score-container"),
            bestContainer: document.querySelector(".best-container"),
            messageContainer: document.querySelector(".game-message"),
            score: 0,
        })
    }
    actuate(grid, state) {
        window.requestAnimationFrame(() => {
            this.clearContainer(this.tileContainer)
            grid.eachCell((x, y, tile) => {
                if (tile) this.addTile(tile)
            })
            this.updateScore(state.score)
            this.updateBestScore(state.bestScore)
            if (state.terminated) {
                if (state.over) this.message(false)
                else if (state.won) this.message(true)
            }
        })
    }
    continueGame() {this.clearMessage()}
    clearContainer(e) {while (e.firstChild) e.removeChild(e.firstChild)}
    addTile({x, y, value, previousPosition, mergedFrom}) {
        var outer = document.createElement("div"),
            inner = document.createElement("div"),
            classes = ["tile", "tile-" + value, this.positionClass(previousPosition || {x, y})]
        if (value > 2048) classes.push("tile-super")
        inner.classList.add("tile-inner")
        inner.textContent = value
        if (previousPosition) {
            window.requestAnimationFrame(() => {
                classes[2] = this.positionClass({x, y})
                this.applyClasses(outer, classes)
            })
        } else if (mergedFrom) {
            classes.push("tile-merged")
            mergedFrom.forEach(e => this.addTile(e))
        } else classes.push("tile-new")
        this.applyClasses(outer, classes)
        this.tileContainer.appendChild(outer).appendChild(inner)
    }
    applyClasses(e, t) {e.setAttribute("class", t.join(" "))}
    positionClass(e) {
        const e2 = Pos.add(e, {x: 1, y: 1})
        return `tile-position-${e2.x}-${e2.y}`
    }
    updateScore(e) {
        this.clearContainer(this.scoreContainer);
        var t = e - this.score;
        if (this.score = e, this.scoreContainer.textContent = this.score, t > 0) {
            var i = document.createElement("div");
            i.classList.add("score-addition"), i.textContent = "+" + t, this.scoreContainer.appendChild(i)
        }
    }
    updateBestScore(e) {this.bestContainer.textContent = e}
    message(e) {
        var t = e ? "game-won" : "game-over",
            i = e ? "You win!" : "Game over!";
        this.messageContainer.classList.add(t)
        this.messageContainer.getElementsByTagName("p")[0].textContent = i
    }
    clearMessage() {
        this.messageContainer.classList.remove("game-won")
        this.messageContainer.classList.remove("game-over")
    }
}

class Grid {
    constructor(size, t) {
        this.size = size
        this.cells = t ? this.fromState(t) : this.empty()
    }
    empty() {
        for (var e = [], t = 0; t < this.size; t++)
            for (var i = e[t] = [], o = 0; o < this.size; o++) i.push(null);
        return e
    }
    fromState(e) {
        for (var t = [], i = 0; i < this.size; i++)
            for (var o = t[i] = [], n = 0; n < this.size; n++) {
                var a = e[i][n];
                o.push(a ? new Tile(a.position, a.value) : null)
            }
        return t
    }
    randomAvailableCell() {
        var e = this.availableCells();
        if (e.length) return e[Math.floor(Math.random() * e.length)]
    }
    availableCells() {
        const res = [];
        this.eachCell((x, y, cell) => {
            if (!cell) res.push({x, y})
        })
        return res
    }
    eachCell(e) {
        for (var x = 0; x < this.size; x++)
            for (var y = 0; y < this.size; y++)
                e(x, y, this.cells[x][y])
    }
    cellsAvailable() {
        return !!this.availableCells().length
    }
    cellAvailable(e) {
        return !this.cellOccupied(e)
    }
    cellOccupied(e) {
        return !!this.cellContent(e)
    }
    cellContent(e) {
        return this.withinBounds(e) ? this.cells[e.x][e.y] : null
    }
    insertTile(e) {
        this.cells[e.x][e.y] = e
    }
    removeTile(e) {
        this.cells[e.x][e.y] = null
    }
    withinBounds(e) {
        return e.x >= 0 && e.x < this.size && e.y >= 0 && e.y < this.size
    }
    serialize() {
        return {
            size: this.size,
            cells: this.cells.map(row => row.map(cell => (cell ? cell.serialize() : null)))
        }
    }
}
class Tile {
    constructor({x, y}, t) {
        Object.assign(this, {
            x, y, 
            value: t || 2,
            previousPosition: null,
            mergedFrom: null
        })
    }
    savePosition() {
        const {x, y} = this
        this.previousPosition = {x, y}
    }
    updatePosition({x, y}) {
        Object.assign(this, {x, y})
    }
    serialize() {
        const {x, y, value} = this
        return {
            position: { x, y },
            value
        }
    }
}

class LocalStorageManager {
    get bestScore() {
        return window.localStorage.getItem("bestScore") || 0
    }
    set bestScore(e) {
        window.localStorage.setItem("bestScore", e)
    }
    get gameState() {
        var e = window.localStorage.getItem("gameState");
        return e ? JSON.parse(e) : null
    }
    set gameState(e) {
        window.localStorage.setItem("gameState", JSON.stringify(e))
    }
    clearGameState() {
        window.localStorage.removeItem("gameState")
    }
}
class Pos {
    static equals({x: x1, y: y1}, {x: x2, y: y2}) {
        return x1 === x2 && y1 === y2
    }
    static add({x: x1, y: y1}, {x: x2, y: y2}) {
        return {x: x1 + x2, y: y1 + y2}
    }
}

class GameManager {
    constructor(size) {
        Object.assign(this, {
            size,
            inputManager: new KeyboardInputManager(),
            storageManager: new LocalStorageManager(),
            actuator: new HTMLActuator(),
            startTiles: 2,
        })
        this.inputManager.on("move", this.move.bind(this))
        this.inputManager.on("restart", this.restart.bind(this))
        this.inputManager.on("keepPlaying", this.keepPlaying.bind(this))
        this.setup()
    }

    restart() {
        this.storageManager.clearGameState()
        this.actuator.continueGame()
        this.setup()
    }
    keepPlaying() {
        this.keepPlaying = true
        this.actuator.continueGame()
    }
    isGameTerminated() {
        return this.over || this.won && !this.keepPlaying
    }
    setup() {
        const gameState = this.storageManager.gameState;
        if (gameState) {
            const {score, over, won, keepPlaying, grid} = gameState
            Object.assign(this, {
                grid: new Grid(grid.size, grid.cells),
                score, over, won, keepPlaying
            })
        } else {
            Object.assign(this, {
                grid: new Grid(this.size),
                score: 0,
                over: false,
                won: false,
                keepPlaying: false
            })
            this.addStartTiles()
        }
        this.actuate()
    }
    addStartTiles() {
        for (var e = 0; e < this.startTiles; e++) this.addRandomTile()
    }
    addRandomTile() {
        if (this.grid.cellsAvailable()) {
            var e = Math.random() < .9 ? 2 : 4,
                t = new Tile(this.grid.randomAvailableCell(), e);
            this.grid.insertTile(t)
        }
    }
    actuate() {
        if (this.storageManager.bestScore < this.score)
            this.storageManager.bestScore = this.score
        if (this.over) 
            this.storageManager.clearGameState()
        else
            this.storageManager.gameState = this.serialize()
        this.actuator.actuate(this.grid, {
            score: this.score,
            over: this.over,
            won: this.won,
            bestScore: this.storageManager.bestScore,
            terminated: this.isGameTerminated()
        })
    }
    serialize() {
        const { grid, score, over, won, keepPlaying } = this
        return {
            grid: grid.serialize(),
            score, over, won, keepPlaying
        }
    }
    prepareTiles() {
        this.grid.eachCell((e, t, i) => {
            if (i) {
                i.mergedFrom = null
                i.savePosition()
            }
        })
    }
    moveTile(e, t) {
        this.grid.cells[e.x][e.y] = null
        this.grid.cells[t.x][t.y] = e
        e.updatePosition(t)
    }
    move(e) {
        if (!this.isGameTerminated()) {
            var vector = GameManager.vectors[e],
                a = this.buildTraversals(vector),
                moved = false;
            this.prepareTiles()
            a.x.forEach((x) => {
                a.y.forEach((y) => {
                    const sourcePos = {x, y}
                    const sourceCell = this.grid.cellContent(sourcePos)
                    if (sourceCell) {
                        var s = this.findFarthestPosition(sourcePos, vector),
                            c = this.grid.cellContent(s.next);
                        if (c && c.value === sourceCell.value && !c.mergedFrom) {
                            var l = new Tile(s.next, 2 * sourceCell.value);
                            l.mergedFrom = [sourceCell, c]
                            this.grid.insertTile(l)
                            this.grid.removeTile(sourceCell)
                            sourceCell.updatePosition(s.next)
                            this.score += l.value
                            if (l.value === 2048) this.won = true
                        } else
                            this.moveTile(sourceCell, s.farthest)
                        if (!Pos.equals(sourcePos, sourceCell)) moved = true
                    }
                })
            })
            if (moved) {
                this.addRandomTile()
                if (!this.movesAvailable()) this.over = true
                this.actuate()
            }
        }
    }
    static vectors = [
        {x: 0, y: -1},
        {x: 1, y: 0},
        {x: 0, y: 1},
        {x: -1, y: 0}
    ]
    buildTraversals({x, y}) {
        const t = {
            x: Array.from({length: this.size}, (x, i) => i),
            y: Array.from({length: this.size}, (x, i) => i),
        }
        if (x == 1) t.x = t.x.reverse()
        if (y == 1) t.y = t.y.reverse()
        return t
    }
    findFarthestPosition(next, t) {
        let farthest;
        do {
            farthest = next
            next = {
                x: next.x + t.x,
                y: next.y + t.y
            }
        } while (this.grid.withinBounds(next) && this.grid.cellAvailable(next));
        return {farthest, next}
    }
    movesAvailable() {
        return this.grid.cellsAvailable() || this.tileMatchesAvailable()
    }
    tileMatchesAvailable() {
        let e
        for (let x = 0; x < this.size; x++)
            for (let y = 0; y < this.size; y++)
                if (e = this.grid.cellContent({x, y}))
                    for (const vec of GameManager.vectors) {
                        let r = this.grid.cellContent(Pos.add({x, y}, vec))
                        if (r && r.value === e.value) return true
                    }
        return false
    }
}
function runApplication() {
    window.game = new GameManager(4);
}
window.requestAnimationFrame(runApplication);



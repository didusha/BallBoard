'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'
const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/candy.png">'
const GLUE_GAMER = '<img src="img/gamer-purple.png">'

// Model:
var gBoard
var gGamerPos
var gCollected
var gBallOnBoard
var gIntervalId
var gIntervalGlue
var gIsGlue

function onInitGame() {
    gIsGlue = false
    gCollected = 0
    gBallOnBoard = 2
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    gIntervalId = setInterval(addBalls, 3000)
    gIntervalGlue = setInterval(addGlue, 5000)
    const elVictory = document.querySelector('.victory')
    elVictory.classList.add('hide')
}

function buildBoard() {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    const rowsCount = 10
    const colsCount = 12
    for (var i = 0; i < rowsCount; i++) {
        board[i] = []
        for (var j = 0; j < colsCount; j++) {
            // DONE: Put FLOOR everywhere and WALL at edges
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === rowsCount - 1 ||
                j === 0 || j === colsCount - 1) {
                board[i][j].type = WALL
            }
        }
    }
    //place secret Path
    var secRow = Math.floor(board.length / 2)
    var secCol = Math.floor(board[0].length / 2)
    board[secRow][0].type = FLOOR
    board[secRow][board[0].length - 1].type = FLOOR
    board[0][secCol].type = FLOOR
    board[board.length - 1][secCol].type = FLOOR

    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL
    // console.log(board)
    return board
}

// Render the board to an HTML table
function renderBoard(board) {
    var middleRow = Math.floor(board.length / 2)
    var middleCol = Math.floor(board[0].length / 2)

    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass = getClassName({ i, j }) // 'cell-0-0 floor'

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
    if (gIsGlue) return
    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)

    const targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return
    if (targetCell.type === GLUE) gluePlayer()


    //If the arrow clicked 

    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) ||
        (jAbsDiff === 1 && iAbsDiff === 0) ||
        (iAbsDiff === gBoard.length - 1) ||
        (jAbsDiff === gBoard[0].length - 1)) {

        if (targetCell.gameElement === BALL) {
            console.log('Collecting!')
            const audCollected = new Audio('sound/eat.mp3')
            audCollected.play()
            gCollected++
            gBallOnBoard--
            //update DOM with number of collected balls
            updateCollected()

            if (gBallOnBoard === 0) victory()
        } else if (targetCell.gameElement === GLUE) {
            gIsGlue = true
            setTimeout(() => { gIsGlue = false }, 3000)
        }
        //* REMOVE GAMER FROM LAST CELL
        // update the MODEl
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // update the DOM
        renderCell(gGamerPos, '')

        //* ADD GAMER TO NEXT CELL
        // update the MODEl
        gBoard[i][j].gameElement = GAMER
        gGamerPos = { i, j }
        // update the DOM
        renderCell(gGamerPos, GAMER_IMG)

        checkNeighbors(gGamerPos)
    } else {
        console.log(iAbsDiff, jAbsDiff)
    }
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // .cell-2-4
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

// Move the player by keyboard arrows
function onKey(ev) {
    // console.log('ev.key:', ev.key)
    const i = gGamerPos.i
    const j = gGamerPos.j

    switch (ev.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = `cell-${location.i}-${location.j}`
    return cellClass
}

function updateCollected() {
    var elSpanCollected = document.querySelector('.Balls-collected')
    elSpanCollected.innerText = gCollected
}

function addBalls() {
    var emptyCells = findEmptyCells()
    //get random position 
    var idx = getRandomIntInclusive(0, emptyCells.length)
    var pos = emptyCells[idx]
    //update model
    gBoard[pos.i][pos.j].gameElement = BALL
    //update DOM
    renderCell(pos, BALL_IMG)
    //update overall Balls on board
    gBallOnBoard++
    //update neighbors counter
    checkNeighbors(gGamerPos)
}

function victory() {
    clearInterval(gIntervalId)
    clearInterval(gIntervalGlue)
    //add victory text with restart button
    const elVictory = document.querySelector('.victory')
    elVictory.classList.remove('hide')
}

function restartGame() {
    gIntervalId = null
    updateCollected()
    onInitGame()
}

function checkNeighbors(pos) {
    var ngBalls = 0
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue

            if (i === pos.i && j === pos.j) continue
            if (gBoard[i][j].gameElement === BALL) {
                ngBalls++
            }
        }
    }
    const elNg = document.querySelector('.ngCount')
    elNg.innerText = ngBalls
}

function findEmptyCells() {
    //create pos array contains empty board spaces and not wall - pos{i, j}
    var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.gameElement === null && currCell.type !== WALL)
                emptyCells.push({ i, j })
        }
    }
    if (emptyCells.length === 0) return null
    return emptyCells
}

function addGlue() {
    var emptyCells = findEmptyCells()
    var idx = getRandomIntInclusive(0, emptyCells.length)
    var gluePos = emptyCells[idx]
    //update model
    gBoard[gluePos.i][gluePos.j].gameElement = GLUE
    //update DOM
    renderCell(gluePos, GLUE_IMG)
    setTimeout(() => {
        if (gIsGlue) return
        gBoard[gluePos.i][gluePos.j].gameElement = null
        renderCell(gluePos, '')
    }, 3000)

}

function gluePlayer() {
    setTimeout(() => {
        gIsGlue = false
        renderCell(gGamerPos, GLUE_GAMER)
    }, 3000)
}
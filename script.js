const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')


const audio = new Audio("../assets/audio.mp3")

const size = 30

const initialPosition = { x: 270, y: 240 }
let snake = [initialPosition]

const incrementScore = () => {
    score.innerText =+ score.innerText + 10
}

const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
}

const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size)
    return Math.round(number / size) * size
}

const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: "red"
}

let direction, loopId 

const drawFood = () => {
    const { x, y, color} = food

    ctx.fillStyle = food.color
    ctx.fillRect(food.x, food.y, size, size)
    ctx.shadowBlur = 0
}

const drawSnake = () => {
    ctx.fillStyle = "#ddd"

    snake.forEach((position, index) => {
        if (index == snake.length - 1) {
            ctx.fillStyle = "white"
        }

        ctx.fillRect(position.x, position.y, size, size)
    })
}

const moveSnake = () => {
    if (!direction) return

    const head = snake[snake.length - 1]

    if (direction == "right") {
        snake.push({ x: head.x + size, y: head.y })
    }

    if (direction == "left") {
        snake.push({ x: head.x - size, y: head.y })
    }

    if (direction == "down") {
        snake.push({ x: head.x, y: head.y + size })
    }

    if (direction == "up") {
        snake.push({ x: head.x, y: head.y - size})
    }

    snake.shift()
}

const checkEat = () => {
    const head = snake[snake.length - 1]

    if (head.x == food.x && head.y == food.y) {
        audio.play()

        let x, y

        do {
            x = randomPosition()
            y = randomPosition()
        } while (snake.find((position) => position.x == x && position.y == y))

        food.x = x
        food.y = y
        
        snake.push({ x: head.x, y: head.y })
    }
}


const checkCollision = () => {
    const head = snake[snake.length - 1]
    const canvasLimit = canvas.width - size
    const neckIndex = snake.length - 2

    const wallCollision = head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

    const selfCollision = snake.find((positon, index) => {
        return index < neckIndex && positon.x == head.x && positon.y == head.y
    })

    if (wallCollision || selfCollision) {
        snake = [initialPosition]
        food.x = randomPosition()
        food.y = randomPosition()

        clearInterval(loopId)
        gameLoop()
    }
}


const findShortestPath = (start, end) => {
    const visited = new Set()
    const queue = [[start, []]]

    while (queue.length > 0) {
        const [current, path] = queue.shift()

        if (current.x === end.x && current.y === end.y) {
            return path
        }

        visited.add(`${current.x},${current.y}`)

        const neighbors = [
            { x: current.x + size, y: current.y },
            { x: current.x - size, y: current.y },
            { x: current.x, y: current.y + size },
            { x: current.x, y: current.y - size }
        ]

        for (const neighbor of neighbors) {
            const key = `${neighbor.x},${neighbor.y}`
            if (
                neighbor.x >= 0 && neighbor.x < canvas.width &&
                neighbor.y >= 0 && neighbor.y < canvas.height &&
                !visited.has(key)
            ) {
                queue.push([neighbor, [...path, neighbor]])
                visited.add(key)
            }
        }
    }

    return null
}

const moveSnakeToFood = () => {
    const head = snake[snake.length - 1]
    const path = findShortestPath(head, food)

    if (path && path.length > 1) {
        const nextStep = path[1]
        const dx = nextStep.x - head.x
        const dy = nextStep.y - head.y

        if (dx > 0 && direction !== "left") {
            direction = "right"
        } else if (dx < 0 && direction !== "right") {
            direction = "left"
        } else if (dy > 0 && direction !== "up") {
            direction = "down"
        } else if (dy < 0 && direction !== "down") {
            direction = "up"
        }
    }
}

const gameLoop = () => {
    clearInterval(loopId)

    ctx.clearRect(0, 0, 1280, 720)
    drawFood()
    moveSnakeToFood() 
    moveSnake()
    drawSnake()
    checkEat()
    checkCollision()

    loopId = setTimeout(() => {
        gameLoop()
    }, 300)
}

gameLoop()


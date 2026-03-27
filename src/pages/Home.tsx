import { useEffect, useRef, useState } from 'react'

interface Position {
  x: number
  y: number
}

interface Obstacle {
  x: number
  y: number
  width: number
  height: number
  color: string
}

interface Level {
  id: number
  obstacles: Obstacle[]
  coins: Position[]
  timeLimit: number
}

export default function RobotMaze() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'win' | 'gameover'>('menu')
  const [score, setScore] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [coinsCollected, setCoinsCollected] = useState(0)

  const robotRef = useRef<Position>({ x: 50, y: 50 })
  const velocityRef = useRef<Position>({ x: 0, y: 0 })
  const keysRef = useRef<Set<string>>(new Set())

  // Game constants
  const GRID_SIZE = 20
  const ROBOT_SIZE = 18
  const ROBOT_SPEED = 3
  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 600

  // Level configurations
  const levels: Level[] = [
    // Level 1 - Easy
    {
      id: 1,
      obstacles: [
        { x: 200, y: 100, width: 20, height: 200, color: '#FF6B6B' },
        { x: 400, y: 200, width: 20, height: 250, color: '#4ECDC4' },
        { x: 100, y: 400, width: 300, height: 20, color: '#FFE66D' },
      ],
      coins: [
        { x: 150, y: 150 },
        { x: 350, y: 100 },
        { x: 600, y: 300 },
        { x: 250, y: 500 },
        { x: 700, y: 500 },
      ],
      timeLimit: 60,
    },
    // Level 2 - Medium
    {
      id: 2,
      obstacles: [
        { x: 150, y: 50, width: 20, height: 150, color: '#FF6B6B' },
        { x: 350, y: 150, width: 20, height: 200, color: '#4ECDC4' },
        { x: 550, y: 50, width: 20, height: 250, color: '#FFE66D' },
        { x: 200, y: 350, width: 250, height: 20, color: '#95E1D3' },
        { x: 100, y: 500, width: 400, height: 20, color: '#F38181' },
      ],
      coins: [
        { x: 100, y: 100 },
        { x: 250, y: 100 },
        { x: 450, y: 100 },
        { x: 650, y: 200 },
        { x: 300, y: 450 },
        { x: 600, y: 450 },
      ],
      timeLimit: 50,
    },
    // Level 3 - Hard
    {
      id: 3,
      obstacles: [
        { x: 100, y: 100, width: 20, height: 120, color: '#FF6B6B' },
        { x: 100, y: 100, width: 200, height: 20, color: '#4ECDC4' },
        { x: 300, y: 100, width: 20, height: 200, color: '#FFE66D' },
        { x: 300, y: 300, width: 250, height: 20, color: '#95E1D3' },
        { x: 550, y: 150, width: 20, height: 170, color: '#F38181' },
        { x: 150, y: 350, width: 20, height: 200, color: '#AA96DA' },
        { x: 400, y: 450, width: 250, height: 20, color: '#FCBAD3' },
      ],
      coins: [
        { x: 150, y: 150 },
        { x: 350, y: 150 },
        { x: 500, y: 200 },
        { x: 700, y: 250 },
        { x: 250, y: 450 },
        { x: 500, y: 500 },
        { x: 700, y: 550 },
      ],
      timeLimit: 40,
    },
  ]

  const currentLevelData = levels[currentLevel]

  // Collision detection
  const checkCollision = (pos: Position): boolean => {
    if (!currentLevelData) return false

    // Wall collision
    if (pos.x < 10 || pos.x > CANVAS_WIDTH - 10 - ROBOT_SIZE ||
        pos.y < 10 || pos.y > CANVAS_HEIGHT - 10 - ROBOT_SIZE) {
      return true
    }

    // Obstacle collision
    for (const obstacle of currentLevelData.obstacles) {
      if (
        pos.x < obstacle.x + obstacle.width &&
        pos.x + ROBOT_SIZE > obstacle.x &&
        pos.y < obstacle.y + obstacle.height &&
        pos.y + ROBOT_SIZE > obstacle.y
      ) {
        return true
      }
    }

    return false
  }

  // Coin collection check
  const checkCoinCollection = (pos: Position): Position | null => {
    if (!currentLevelData) return null

    for (const coin of currentLevelData.coins) {
      const distance = Math.sqrt(
        Math.pow(pos.x + ROBOT_SIZE / 2 - coin.x, 2) +
        Math.pow(pos.y + ROBOT_SIZE / 2 - coin.y, 2)
      )
      if (distance < 20) {
        return coin
      }
    }
    return null
  }

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const gameLoop = () => {
      // Update robot position
      const newX = robotRef.current.x + velocityRef.current.x
      const newY = robotRef.current.y + velocityRef.current.y

      const newPos = { x: newX, y: robotRef.current.y }
      if (!checkCollision(newPos)) {
        robotRef.current.x = newX
      }

      newPos.x = robotRef.current.x
      newPos.y = newY
      if (!checkCollision(newPos)) {
        robotRef.current.y = newY
      }

      // Check coin collection
      const collectedCoin = checkCoinCollection(robotRef.current)
      if (collectedCoin) {
        setScore((prev) => prev + 100)
        setCoinsCollected((prev) => prev + 1)
        // Remove collected coin
        const coinIndex = currentLevelData.coins.indexOf(collectedCoin)
        if (coinIndex > -1) {
          currentLevelData.coins.splice(coinIndex, 1)
        }
      }

      // Check win condition
      if (currentLevelData.coins.length === 0) {
        if (currentLevel < levels.length - 1) {
          setGameState('win')
        } else {
          setGameState('win')
        }
      }

      // Clear canvas
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw border
      ctx.strokeStyle = '#16213e'
      ctx.lineWidth = 20
      ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw grid
      ctx.strokeStyle = '#0f3460'
      ctx.lineWidth = 1
      for (let i = 0; i < CANVAS_WIDTH; i += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, CANVAS_HEIGHT)
        ctx.stroke()
      }
      for (let i = 0; i < CANVAS_HEIGHT; i += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(CANVAS_WIDTH, i)
        ctx.stroke()
      }

      // Draw obstacles
      currentLevelData.obstacles.forEach((obstacle) => {
        ctx.fillStyle = obstacle.color
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
        // Add glow effect
        ctx.shadowColor = obstacle.color
        ctx.shadowBlur = 15
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)
        ctx.shadowBlur = 0
      })

      // Draw coins
      currentLevelData.coins.forEach((coin) => {
        ctx.fillStyle = '#FFD700'
        ctx.beginPath()
        ctx.arc(coin.x, coin.y, 10, 0, Math.PI * 2)
        ctx.fill()
        // Sparkle effect
        ctx.shadowColor = '#FFD700'
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // Draw finish flag (if all coins collected)
      if (currentLevelData.coins.length === 0) {
        ctx.fillStyle = '#00FF00'
        ctx.fillRect(CANVAS_WIDTH - 50, CANVAS_HEIGHT - 50, 40, 40)
      }

      // Draw robot
      const robotX = robotRef.current.x
      const robotY = robotRef.current.y

      // Robot body
      ctx.fillStyle = '#2196F3'
      ctx.fillRect(robotX, robotY, ROBOT_SIZE, ROBOT_SIZE)
      ctx.strokeStyle = '#1976D2'
      ctx.lineWidth = 2
      ctx.strokeRect(robotX, robotY, ROBOT_SIZE, ROBOT_SIZE)

      // Robot eyes
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(robotX + 4, robotY + 4, 4, 4)
      ctx.fillRect(robotX + 10, robotY + 4, 4, 4)

      // Robot antenna
      ctx.strokeStyle = '#FF5722'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(robotX + ROBOT_SIZE / 2, robotY)
      ctx.lineTo(robotX + ROBOT_SIZE / 2, robotY - 5)
      ctx.stroke()

      ctx.fillStyle = '#FF5722'
      ctx.beginPath()
      ctx.arc(robotX + ROBOT_SIZE / 2, robotY - 5, 3, 0, Math.PI * 2)
      ctx.fill()

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    animationFrameId = requestAnimationFrame(gameLoop)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [gameState, currentLevel, currentLevelData])

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('gameover')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }
      keysRef.current.add(e.key)
      updateVelocity()
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key)
      updateVelocity()
    }

    const updateVelocity = () => {
      let vx = 0
      let vy = 0

      if (keysRef.current.has('ArrowUp') || keysRef.current.has('w')) vy = -ROBOT_SPEED
      if (keysRef.current.has('ArrowDown') || keysRef.current.has('s')) vy = ROBOT_SPEED
      if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) vx = -ROBOT_SPEED
      if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) vx = ROBOT_SPEED

      velocityRef.current = { x: vx, y: vy }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Touch controls
  const handleDirectionClick = (direction: 'up' | 'down' | 'left' | 'right') => {
    const speed = ROBOT_SPEED * 2
    switch (direction) {
      case 'up':
        velocityRef.current = { x: 0, y: -speed }
        break
      case 'down':
        velocityRef.current = { x: 0, y: speed }
        break
      case 'left':
        velocityRef.current = { x: -speed, y: 0 }
        break
      case 'right':
        velocityRef.current = { x: speed, y: 0 }
        break
    }

    setTimeout(() => {
      velocityRef.current = { x: 0, y: 0 }
    }, 200)
  }

  const startGame = () => {
    robotRef.current = { x: 50, y: 50 }
    velocityRef.current = { x: 0, y: 0 }
    setTimeLeft(currentLevelData.timeLimit)
    setCoinsCollected(0)
    // Reset coins for current level
    levels[currentLevel].coins = [...levels[currentLevel].coins]
    setGameState('playing')
  }

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1)
      setScore((prev) => prev + timeLeft * 10)
      startGame()
    }
  }

  const restartGame = () => {
    setCurrentLevel(0)
    setScore(0)
    setCoinsCollected(0)
    // Reset all levels
    levels.forEach((level, index) => {
      levels[index].coins = [...levels[index].coins]
    })
    startGame()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">
          🤖 Robot Maze Adventure
        </h1>
        <p className="text-lg md:text-xl text-yellow-300 font-semibold">
          Help the robot collect all coins and avoid obstacles!
        </p>
      </div>

      {/* Game Info */}
      {gameState === 'playing' && (
        <div className="flex flex-wrap gap-4 mb-4 justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-white text-xl font-bold">
            ⭐ Score: {score}
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-white text-xl font-bold">
            🪙 Coins: {coinsCollected}/{currentLevelData.coins.length + coinsCollected}
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-white text-xl font-bold">
            ⏱️ Time: {timeLeft}s
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-white text-xl font-bold">
            📍 Level: {currentLevel + 1}
          </div>
        </div>
      )}

      {/* Menu Screen */}
      {gameState === 'menu' && (
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl text-center max-w-2xl">
          <div className="text-8xl mb-6">🤖</div>
          <h2 className="text-3xl md:text-4xl font-bold text-purple-900 mb-6">
            Welcome to Robot Maze!
          </h2>
          <div className="text-left bg-blue-100 rounded-xl p-6 mb-6 space-y-3">
            <p className="text-lg font-semibold text-gray-800">📖 How to Play:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-2xl">⌨️</span>
                <span>Use arrow keys (or W/A/S/D) to move the robot</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">📱</span>
                <span>On mobile: Use the direction buttons</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🪙</span>
                <span>Collect all coins to win the level</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">🚫</span>
                <span>Avoid colorful obstacles and walls</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-2xl">⏱️</span>
                <span>Complete before time runs out!</span>
              </li>
            </ul>
          </div>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-2xl md:text-3xl font-bold py-4 px-12 rounded-full shadow-lg transform hover:scale-105 transition-transform"
          >
            🎮 Start Game
          </button>
        </div>
      )}

      {/* Win Screen */}
      {gameState === 'win' && (
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl text-center max-w-2xl">
          <div className="text-8xl mb-6">🎉</div>
          <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-4">
            Level Complete!
          </h2>
          <p className="text-2xl text-gray-700 mb-6">
            ⭐ Score: {score}
          </p>
          <div className="flex flex-col gap-4">
            {currentLevel < levels.length - 1 ? (
              <button
                onClick={nextLevel}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-lg transform hover:scale-105 transition-transform"
              >
                ➡️ Next Level
              </button>
            ) : (
              <div className="mb-4">
                <p className="text-3xl font-bold text-purple-600 mb-4">
                  🏆 You Won All Levels!
                </p>
                <p className="text-xl text-gray-600">
                  Final Score: {score}
                </p>
              </div>
            )}
            <button
              onClick={restartGame}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xl font-bold py-3 px-10 rounded-full shadow-lg transform hover:scale-105 transition-transform"
            >
              🔄 Restart Game
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl text-center max-w-2xl">
          <div className="text-8xl mb-6">⏰</div>
          <h2 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">
            Time's Up!
          </h2>
          <p className="text-2xl text-gray-700 mb-6">
            ⭐ Score: {score}
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-lg transform hover:scale-105 transition-transform"
            >
              🔄 Try Again
            </button>
            <button
              onClick={restartGame}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xl font-bold py-3 px-10 rounded-full shadow-lg transform hover:scale-105 transition-transform"
            >
              🏠 Back to Start
            </button>
          </div>
        </div>
      )}

      {/* Game Canvas */}
      {gameState === 'playing' && (
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-4 border-white rounded-2xl shadow-2xl max-w-full h-auto"
          />

          {/* Mobile Controls */}
          <div className="md:hidden mt-4">
            <div className="grid grid-cols-3 gap-2 w-64 mx-auto">
              <div />
              <button
                onMouseDown={() => handleDirectionClick('up')}
                onTouchStart={() => handleDirectionClick('up')}
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-3xl font-bold py-6 rounded-xl shadow-lg"
              >
                ⬆️
              </button>
              <div />
              <button
                onMouseDown={() => handleDirectionClick('left')}
                onTouchStart={() => handleDirectionClick('left')}
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-3xl font-bold py-6 rounded-xl shadow-lg"
              >
                ⬅️
              </button>
              <button
                onClick={() => setGameState('paused')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-xl font-bold py-6 rounded-xl shadow-lg"
              >
                ⏸️
              </button>
              <button
                onMouseDown={() => handleDirectionClick('right')}
                onTouchStart={() => handleDirectionClick('right')}
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-3xl font-bold py-6 rounded-xl shadow-lg"
              >
                ➡️
              </button>
              <div />
              <button
                onMouseDown={() => handleDirectionClick('down')}
                onTouchStart={() => handleDirectionClick('down')}
                className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-3xl font-bold py-6 rounded-xl shadow-lg"
              >
                ⬇️
              </button>
              <div />
            </div>
          </div>

          {/* Desktop Pause Button */}
          <div className="hidden md:block mt-4 text-center">
            <button
              onClick={() => setGameState('paused')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white text-xl font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-transform"
            >
              ⏸️ Pause
            </button>
          </div>
        </div>
      )}

      {/* Paused Screen */}
      {gameState === 'paused' && (
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl text-center max-w-md">
          <div className="text-6xl mb-4">⏸️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Game Paused
          </h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setGameState('playing')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xl font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-transform"
            >
              ▶️ Resume
            </button>
            <button
              onClick={restartGame}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-xl font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-transform"
            >
              🏠 Main Menu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

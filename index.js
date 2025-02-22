const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

// Original dimensions for scaling calculations
const ORIGINAL_WIDTH = 1024
const ORIGINAL_HEIGHT = 576

// Function to update canvas size
function resizeCanvas() {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  
  const gameAspectRatio = 16 / 9
  const windowAspectRatio = windowWidth / windowHeight
  
  let newWidth, newHeight
  
  if (windowAspectRatio > gameAspectRatio) {
    newHeight = windowHeight * 0.95
    newWidth = newHeight * gameAspectRatio
  } else {
    newWidth = windowWidth * 0.95
    newHeight = newWidth / gameAspectRatio
  }
  
  canvas.width = newWidth
  canvas.height = newHeight
  
  return {
    scaleX: newWidth / ORIGINAL_WIDTH,
    scaleY: newHeight / ORIGINAL_HEIGHT
  }
}

// Helper function for scaling velocities
function getScaledVelocity(baseVelocity) {
  return (baseVelocity * canvas.width) / ORIGINAL_WIDTH
}

// Initial canvas setup
const { scaleX, scaleY } = resizeCanvas()

// Scale gravity based on canvas height
const gravity = 0.7 * (canvas.height / ORIGINAL_HEIGHT)

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './img/background.png',
  scale: scaleX
})

const shop = new Sprite({
  position: {
    x: canvas.width * 0.6,
    y: canvas.height * 0.22
  },
  imageSrc: './img/shop.png',
  scale: 2.75 * scaleX,
  framesMax: 6
})

const player = new Fighter({
  position: {
    x: canvas.width * 0.2,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  offset: {
    x: 0,
    y: 0
  },
  imageSrc: './img/samuraiMack/Idle.png',
  framesMax: 8,
  scale: 2.5 * scaleX,
  offset: {
    x: 215,
    y: 157
  },
  sprites: {
    idle: {
      imageSrc: './img/samuraiMack/Idle.png',
      framesMax: 8
    },
    run: {
      imageSrc: './img/samuraiMack/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/samuraiMack/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/samuraiMack/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/samuraiMack/Attack1.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/samuraiMack/Death.png',
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 100 * scaleX,
      y: 50 * scaleY
    },
    width: 160 * scaleX,
    height: 50 * scaleY
  }
})

const enemy = new Fighter({
  position: {
    x: canvas.width * 0.8,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  offset: {
    x: -50,
    y: 0
  },
  imageSrc: './img/kenji/Idle.png',
  framesMax: 4,
  scale: 2.5 * scaleX,
  offset: {
    x: 215,
    y: 167
  },
  sprites: {
    idle: {
      imageSrc: './img/kenji/Idle.png',
      framesMax: 4
    },
    run: {
      imageSrc: './img/kenji/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/kenji/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/kenji/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/kenji/Attack1.png',
      framesMax: 4
    },
    takeHit: {
      imageSrc: './img/kenji/Take hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: './img/kenji/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -170 * scaleX,
      y: 50 * scaleY
    },
    width: 170 * scaleX,
    height: 50 * scaleY
  }
})

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}

// Handle window resize
window.addEventListener('resize', () => {
  const { scaleX, scaleY } = resizeCanvas()
  
  // Update game element scales
  background.scale = scaleX
  player.scale = 2.5 * scaleX
  enemy.scale = 2.5 * scaleX
  shop.scale = 2.75 * scaleX
  
  // Update attack box dimensions
  player.attackBox.width = 160 * scaleX
  player.attackBox.height = 50 * scaleY
  enemy.attackBox.width = 170 * scaleX
  enemy.attackBox.height = 50 * scaleY
  
  // Update positions
  shop.position.x = canvas.width * 0.6
  shop.position.y = canvas.height * 0.22
  
  if (!player.dead) {
    player.position.x = canvas.width * 0.2
  }
  if (!enemy.dead) {
    enemy.position.x = canvas.width * 0.8
  }
})

decreaseTimer()

function animate() {
  window.requestAnimationFrame(animate)
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  
  background.update()
  shop.update()
  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  enemy.update()

  player.velocity.x = 0
  enemy.velocity.x = 0

  // Player movement
  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = getScaledVelocity(-5)
    player.switchSprite('run')
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = getScaledVelocity(5)
    player.switchSprite('run')
  } else {
    player.switchSprite('idle')
  }

  // Player jumping
  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')
  }

  // Enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = getScaledVelocity(-5)
    enemy.switchSprite('run')
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = getScaledVelocity(5)
    enemy.switchSprite('run')
  } else {
    enemy.switchSprite('idle')
  }

  // Enemy jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')
  }

  // Detect collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking = false
    gsap.to('#enemyHealth', {
      width: enemy.health + '%'
    })
  }

  // If player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }

  // Player gets hit
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit()
    enemy.isAttacking = false
    gsap.to('#playerHealth', {
      width: player.health + '%'
    })
  }

  // If enemy misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  }

  // End game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId })
  }
}

animate()

window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        player.velocity.y = getScaledVelocity(-20)
        break
      case 's':
        player.attack()
        break
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break
      case 'ArrowUp':
        enemy.velocity.y = getScaledVelocity(-20)
        break
      case 'ArrowDown':
        enemy.attack()
        break
    }
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
  }
})


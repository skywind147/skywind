// 微信小游戏入口
const gameCanvas = wx.createCanvas()
const gameContext = gameCanvas.getContext('2d')

// 加载背景图片
const bgImage = wx.createImage()
bgImage.src = 'images/bg.png'
const bg2Image = wx.createImage()
bg2Image.src = 'images/bg2.png'

// 加载开始按钮图片
const startBtnImage = wx.createImage()
startBtnImage.src = 'images/start-btn.png'

const renBtnImage = wx.createImage()
renBtnImage.src = 'images/ren-btn.png'

// 加载怪物按钮图片
const guaiBtnImage = wx.createImage()
guaiBtnImage.src = 'images/guai-btn.png'

// 加载重来按钮图片
const chonglaiBtnImage = wx.createImage()
chonglaiBtnImage.src = 'images/chonglai-btn.png'

// 加载刀按钮图片
const daoBtnImage = wx.createImage()
daoBtnImage.src = 'images/dao-btn.png'

// 游戏状态
let showStartBtn = true
let showRenBtn = false
let showGuaiBtn = false
let showChonglaiBtn = false
let isDragging = false
let dragOffsetX = 0     // 添加水平方向的偏移量
let dragOffsetY = 0
let guaiBtnAppearTime = 0  // 记录怪物出现的时间
let currentBg = 'bg1'  // 当前背景
let daoAngle = 0  // 刀的旋转角度
let guaiOpacity = 1  // 怪物的透明度
let isGuaiFading = false  // 怪物是否正在消失
let killCount = 0  // 击败怪物的计数

// 按钮配置
const btnWidth = 200
const btnHeight = 80
const btnX = (gameCanvas.width - btnWidth) / 2
const btnY = (gameCanvas.height - btnHeight) / 2

// 重来按钮位置配置
const chonglaiBtnX = btnX
const chonglaiBtnY = btnY + 200  // 在中心位置基础上向下移动200像素

// 人物按钮位置和尺寸配置
const renBtnWidth = 80   // 从150减小到80
const renBtnHeight = 100 // 从200减小到100
let renBtnX = (gameCanvas.width - renBtnWidth) / 2
let renBtnY = gameCanvas.height * 0.6

// 怪物按钮配置
const guaiBtnWidth = 80
const guaiBtnHeight = 100
const guaiBtnSpeed = 2
const maxGuaiCount = 10  // 从3改为10，增加最大怪物数量限制
const guaiIncreaseInterval = 10000  // 每10秒增加怪物的间隔时间
let maxCurrentGuaiCount = 1  // 当前允许的最大怪物数量

// 怪物状态数组
let guaiButtons = []  // 存储所有怪物的状态

// 刀按钮配置
const daoBtnWidth = 30    // 从50减小到30
const daoBtnHeight = 30   // 从50减小到30
const daoRotationRadius = 80  // 从120减小到80，让刀的旋转半径也相应减小
const daoRotationSpeed = 0.02
const daoCount = 3

/**
 * 游戏主函数
 */
function main() {
    // 初始化游戏
    init()
}

/**
 * 初始化游戏
 */
function init() {
    // 等待所有图片加载完成
    Promise.all([
        new Promise(resolve => bgImage.onload = resolve),
        new Promise(resolve => bg2Image.onload = resolve),
        new Promise(resolve => startBtnImage.onload = resolve),
        new Promise(resolve => renBtnImage.onload = resolve),
        new Promise(resolve => guaiBtnImage.onload = resolve),
        new Promise(resolve => chonglaiBtnImage.onload = resolve),
        new Promise(resolve => daoBtnImage.onload = resolve)
    ]).then(() => {
        // 注册触摸事件
        wx.onTouchStart(handleTouchStart)
        wx.onTouchMove(handleTouchMove)
        wx.onTouchEnd(handleTouchEnd)
        // 开始游戏循环
        gameLoop()
    })
}

/**
 * 游戏循环
 */
function gameLoop() {
    update()
    render()
    
    // 循环调用gameLoop
    requestAnimationFrame(gameLoop)
}

/**
 * 创建新的怪物对象
 */
function createGuaiButton() {
    return {
        x: 0,
        y: 0,
        opacity: 1,
        isFading: false
    }
}

/**
 * 重置怪物位置到随机屏幕外位置
 */
function resetGuaiPosition(guai) {
    const direction = Math.floor(Math.random() * 4)
    
    switch(direction) {
        case 0: // 上方
            guai.x = Math.random() * (gameCanvas.width - guaiBtnWidth)
            guai.y = -guaiBtnHeight
            break
        case 1: // 右方
            guai.x = gameCanvas.width
            guai.y = Math.random() * (gameCanvas.height - guaiBtnHeight)
            break
        case 2: // 下方
            guai.x = Math.random() * (gameCanvas.width - guaiBtnWidth)
            guai.y = gameCanvas.height
            break
        case 3: // 左方
            guai.x = -guaiBtnWidth
            guai.y = Math.random() * (gameCanvas.height - guaiBtnHeight)
            break
    }
}

/**
 * 重置游戏状态
 */
function resetGame() {
    currentBg = 'bg1'
    showStartBtn = false
    showRenBtn = true
    showChonglaiBtn = false
    isDragging = false
    killCount = 0  // 重置击败计数
    
    // 重置人物位置
    renBtnX = (gameCanvas.width - renBtnWidth) / 2
    renBtnY = gameCanvas.height * 0.6
    
    // 清空怪物数组
    guaiButtons = []
    
    // 重置怪物出现时间
    guaiBtnAppearTime = Date.now()
    daoAngle = 0
    maxCurrentGuaiCount = 1  // 重置当前最大怪物数量
}

/**
 * 更新游戏状态
 */
function update() {
    // 检查是否需要增加最大怪物数量
    if (showRenBtn && Date.now() - guaiBtnAppearTime > 2000) {
        const timeElapsed = Date.now() - guaiBtnAppearTime
        maxCurrentGuaiCount = Math.min(maxGuaiCount, 1 + Math.floor(timeElapsed / guaiIncreaseInterval))
    }

    // 检查是否需要添加新怪物
    if (showRenBtn && Date.now() - guaiBtnAppearTime > 2000) {
        if (guaiButtons.length < maxCurrentGuaiCount) {
            const newGuai = createGuaiButton()
            resetGuaiPosition(newGuai)
            guaiButtons.push(newGuai)
        }
    }

    // 更新所有怪物
    for (let i = guaiButtons.length - 1; i >= 0; i--) {
        const guai = guaiButtons[i]
        
        if (guai.isFading) {
            // 更新透明度
            guai.opacity -= 0.05
            if (guai.opacity <= 0) {
                // 重置怪物状态
                guai.isFading = false
                guai.opacity = 1
                resetGuaiPosition(guai)
                killCount++  // 增加击败计数
            }
        } else {
            // 移动逻辑
            const dx = renBtnX - guai.x
            const dy = renBtnY - guai.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            
            if (distance > 0) {
                guai.x += (dx / distance) * guaiBtnSpeed
                guai.y += (dy / distance) * guaiBtnSpeed
                
                // 检查与人物的碰撞
                if (checkCollision(guai)) {
                    currentBg = 'bg2'
                    showRenBtn = false
                    isDragging = false
                    showChonglaiBtn = true
                    guaiButtons = []  // 清空所有怪物
                    return
                }
            }
        }
    }

    // 更新刀的碰撞检测
    if (showRenBtn) {
        daoAngle += daoRotationSpeed
        
        // 检查每把刀与每个怪物的碰撞
        for (let i = 0; i < daoCount; i++) {
            const angle = daoAngle + (i * 2 * Math.PI / daoCount)
            const daoBtnX = renBtnX + renBtnWidth/2 + Math.cos(angle) * daoRotationRadius
            const daoBtnY = renBtnY + renBtnHeight/2 + Math.sin(angle) * daoRotationRadius
            
            for (const guai of guaiButtons) {
                if (!guai.isFading && checkDaoCollision(daoBtnX, daoBtnY, guai)) {
                    guai.isFading = true
                    break
                }
            }
        }
    }
}

/**
 * 检测两个按钮是否碰撞
 */
function checkCollision(guai) {
    const shrinkRatio = 0.3
    
    const ren = {
        left: renBtnX + renBtnWidth * shrinkRatio,
        right: renBtnX + renBtnWidth * (1 - shrinkRatio),
        top: renBtnY + renBtnHeight * shrinkRatio,
        bottom: renBtnY + renBtnHeight * (1 - shrinkRatio)
    }
    
    const guaiBox = {
        left: guai.x + guaiBtnWidth * shrinkRatio,
        right: guai.x + guaiBtnWidth * (1 - shrinkRatio),
        top: guai.y + guaiBtnHeight * shrinkRatio,
        bottom: guai.y + guaiBtnHeight * (1 - shrinkRatio)
    }
    
    return !(ren.right < guaiBox.left || 
             ren.left > guaiBox.right || 
             ren.bottom < guaiBox.top || 
             ren.top > guaiBox.bottom)
}

/**
 * 检测刀和怪物的碰撞
 */
function checkDaoCollision(daoX, daoY, guai) {
    const shrinkRatio = 0.3
    
    const guaiBox = {
        left: guai.x + guaiBtnWidth * shrinkRatio,
        right: guai.x + guaiBtnWidth * (1 - shrinkRatio),
        top: guai.y + guaiBtnHeight * shrinkRatio,
        bottom: guai.y + guaiBtnHeight * (1 - shrinkRatio)
    }
    
    return daoX >= guaiBox.left && daoX <= guaiBox.right &&
           daoY >= guaiBox.top && daoY <= guaiBox.bottom
}

/**
 * 处理触摸开始事件
 */
function handleTouchStart(e) {
    const touch = e.touches[0]
    const x = touch.clientX
    const y = touch.clientY

    if (showStartBtn && 
        x >= btnX && x <= btnX + btnWidth &&
        y >= btnY && y <= btnY + btnHeight) {
        showStartBtn = false
        showRenBtn = true
        guaiBtnAppearTime = Date.now()
    } else if (showRenBtn &&
        x >= renBtnX && x <= renBtnX + renBtnWidth &&
        y >= renBtnY && y <= renBtnY + renBtnHeight) {
        isDragging = true
        dragOffsetX = x - renBtnX
        dragOffsetY = y - renBtnY
    } else if (showChonglaiBtn &&
        x >= chonglaiBtnX && x <= chonglaiBtnX + btnWidth &&
        y >= chonglaiBtnY && y <= chonglaiBtnY + btnHeight) {
        resetGame()
    }
}

/**
 * 处理触摸移动事件
 */
function handleTouchMove(e) {
    if (isDragging) {
        const touch = e.touches[0]
        // 更新人物按钮的X和Y坐标
        renBtnX = touch.clientX - dragOffsetX
        renBtnY = touch.clientY - dragOffsetY
        
        // 限制移动范围，防止移出屏幕
        const minX = 0
        const maxX = gameCanvas.width - renBtnWidth
        const minY = 0
        const maxY = gameCanvas.height - renBtnHeight
        
        // 限制在屏幕范围内
        renBtnX = Math.max(minX, Math.min(renBtnX, maxX))
        renBtnY = Math.max(minY, Math.min(renBtnY, maxY))
    }
}

/**
 * 处理触摸结束事件
 */
function handleTouchEnd() {
    isDragging = false
}

/**
 * 渲染画面
 */
function render() {
    // 清空画布
    gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height)
    
    // 根据当前场景绘制背景
    gameContext.drawImage(
        currentBg === 'bg1' ? bgImage : bg2Image,
        0,
        0,
        gameCanvas.width,
        gameCanvas.height
    )

    // 绘制开始按钮
    if (showStartBtn) {
        gameContext.drawImage(
            startBtnImage,
            btnX,
            btnY,
            btnWidth,
            btnHeight
        )
    }

    // 绘制人物按钮
    if (showRenBtn) {
        gameContext.drawImage(
            renBtnImage,
            renBtnX,
            renBtnY,
            renBtnWidth,
            renBtnHeight
        )
    }

    // 绘制所有怪物
    for (const guai of guaiButtons) {
        gameContext.globalAlpha = guai.opacity
        gameContext.drawImage(
            guaiBtnImage,
            guai.x,
            guai.y,
            guaiBtnWidth,
            guaiBtnHeight
        )
    }
    gameContext.globalAlpha = 1

    // 绘制重来按钮
    if (showChonglaiBtn) {
        gameContext.drawImage(
            chonglaiBtnImage,
            chonglaiBtnX,
            chonglaiBtnY,
            btnWidth,
            btnHeight
        )
    }

    // 绘制旋转的刀
    if (showRenBtn) {
        // 绘制多个刀
        for (let i = 0; i < daoCount; i++) {
            const angle = daoAngle + (i * 2 * Math.PI / daoCount)  // 均匀分布在圆周上
            
            // 计算刀的位置
            const daoBtnX = renBtnX + renBtnWidth/2 + Math.cos(angle) * daoRotationRadius - daoBtnWidth/2
            const daoBtnY = renBtnY + renBtnHeight/2 + Math.sin(angle) * daoRotationRadius - daoBtnHeight/2
            
            // 保存当前上下文状态
            gameContext.save()
            
            // 移动到刀的中心点
            gameContext.translate(daoBtnX + daoBtnWidth/2, daoBtnY + daoBtnHeight/2)
            
            // 旋转刀的朝向（让刀尖始终朝外）
            gameContext.rotate(angle + Math.PI/2)
            
            // 绘制刀（需要将坐标原点移回去）
            gameContext.drawImage(
                daoBtnImage,
                -daoBtnWidth/2,
                -daoBtnHeight/2,
                daoBtnWidth,
                daoBtnHeight
            )
            
            // 恢复上下文状态
            gameContext.restore()
        }
    }

    // 绘制击败计数和当前波数
    if (showRenBtn) {
        gameContext.save()
        gameContext.fillStyle = '#ffffff'
        gameContext.font = '24px Arial'
        gameContext.textAlign = 'center'
        gameContext.fillText(`击败: ${killCount}    波数: ${maxCurrentGuaiCount}`, gameCanvas.width / 2, 70)
        gameContext.restore()
    }
}

// 启动游戏
main()

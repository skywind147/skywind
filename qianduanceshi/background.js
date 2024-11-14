class ParticleBackground {
    constructor() {
        this.canvas = document.getElementById('backgroundCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mousePosition = {
            x: 0,
            y: 0
        };
        this.isMouseDown = false;
        this.hue = 0; // 用于颜色变化
        
        this.init();
        this.animate();
        this.addEventListeners();
    }
    
    init() {
        this.resize();
        this.createParticles();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const numberOfParticles = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        
        for (let i = 0; i < numberOfParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 3 + 2,
                originalX: Math.random() * this.canvas.width,
                originalY: Math.random() * this.canvas.height,
                vx: 0,
                vy: 0,
                speed: 0.05,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.1,
                color: `hsla(${Math.random() * 360}, 70%, 60%, 0.8)`,
                targetRadius: Math.random() * 3 + 2
            });
        }
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 / 15) * i;
            const velocity = 5;
            const particle = {
                x: x,
                y: y,
                radius: 3,
                originalX: x,
                originalY: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                speed: 0.95,
                life: 1,
                color: `hsla(${this.hue}, 70%, 60%, 0.8)`
            };
            this.particles.push(particle);
        }
    }
    
    animate() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.hue = (this.hue + 0.5) % 360;
        
        this.particles.forEach((particle, index) => {
            if (particle.life !== undefined) {
                // 爆炸粒子的处理
                particle.life *= 0.95;
                particle.vx *= particle.speed;
                particle.vy *= particle.speed;
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.radius *= 0.98;
                
                if (particle.life < 0.01) {
                    this.particles.splice(index, 1);
                    return;
                }
            } else {
                // 普通粒子的处理
                const dx = this.mousePosition.x - particle.x;
                const dy = this.mousePosition.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = this.isMouseDown ? 200 : 150;
                
                if (distance < maxDistance) {
                    const force = (maxDistance - distance) / maxDistance;
                    const repelForce = this.isMouseDown ? 2 : -1;
                    particle.vx = dx * force * particle.speed * repelForce;
                    particle.vy = dy * force * particle.speed * repelForce;
                    
                    // 粒子大小变化
                    particle.targetRadius = this.isMouseDown ? 
                        particle.radius * 1.5 : particle.radius * 0.5;
                } else {
                    particle.vx = (particle.originalX - particle.x) * particle.speed;
                    particle.vy = (particle.originalY - particle.y) * particle.speed;
                    particle.targetRadius = particle.radius;
                }
                
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // 旋转效果
                particle.angle += particle.spin;
            }
            
            // 绘制粒子
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.angle);
            
            this.ctx.beginPath();
            if (particle.life !== undefined) {
                this.ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${particle.life})`;
            } else {
                this.ctx.fillStyle = particle.color;
            }
            this.ctx.arc(0, 0, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
        
        // 绘制连接线
        this.particles.forEach((particle, i) => {
            for (let j = i + 1; j < this.particles.length; j++) {
                const other = this.particles[j];
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `hsla(${this.hue}, 70%, 60%, ${0.2 * (1 - distance/100)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.stroke();
                }
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
    
    addEventListeners() {
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
        });
        
        window.addEventListener('mousedown', () => {
            this.isMouseDown = true;
            this.createExplosion(this.mousePosition.x, this.mousePosition.y);
        });
        
        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
        
        // 触摸设备支持
        window.addEventListener('touchstart', (e) => {
            this.isMouseDown = true;
            this.mousePosition.x = e.touches[0].clientX;
            this.mousePosition.y = e.touches[0].clientY;
            this.createExplosion(this.mousePosition.x, this.mousePosition.y);
        });
        
        window.addEventListener('touchmove', (e) => {
            this.mousePosition.x = e.touches[0].clientX;
            this.mousePosition.y = e.touches[0].clientY;
        });
        
        window.addEventListener('touchend', () => {
            this.isMouseDown = false;
        });
    }
}

// 初始化背景
window.addEventListener('DOMContentLoaded', () => {
    new ParticleBackground();
}); 
import { _decorator, Component, instantiate, Prefab, Vec3, Node } from 'cc';
import { Ball } from './Ball';
import { BallColor, BallType, GameConfig } from './GameConfig';
const { ccclass, property } = _decorator;

@ccclass('BallManager')
export class BallManager {
    private static _instance: BallManager;
    public static get instance(): BallManager {
        if (!BallManager._instance) {
            BallManager._instance = new BallManager();
        }
        return BallManager._instance;
    }

    private ballPrefab: Prefab = null;
    public setBallPrefab(ballPrefab: Prefab) {
        this.ballPrefab = ballPrefab;
    }

    private ballContainer: Node = null;
    public setBallContainer(ballContainer: Node) {
        this.ballContainer = ballContainer;
    }

    public initBalls() {
        this.ballContainer.removeAllChildren();
        const totalBalls = 50;
        const config = GameConfig.BallGenConfig;
        let balls: { type: BallType, size: number, color: BallColor }[] = [];
        let sum = 0;

        // 先按比例分配
        for (let i = 0; i < config.length; i++) {
            let count = Math.round(config[i].rate / 100 * totalBalls);
            if (i === config.length - 1) {
                // 最后一个补齐
                count = totalBalls - sum;
            }
            sum += count;
            for (let j = 0; j < count; j++) {
                const color = this.generateRandomColor();
                balls.push({ type: config[i].type, size: config[i].size, color: color });
            }
        }

        // 可选：打乱顺序
        for (let i = balls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [balls[i], balls[j]] = [balls[j], balls[i]];
        }

        // 生成球
        for (let i = 0; i < balls.length; i++) {
            var ball = instantiate(this.ballPrefab);
            ball.setPosition(new Vec3(0, 0, 0));
            ball.getComponent(Ball).setBallIndex(i);
            ball.getComponent(Ball).setBallTypeAndSize(balls[i].type, balls[i].size);
            ball.getComponent(Ball).setBallColor(balls[i].color);
            this.ballContainer.addChild(ball);
        }
    }

    // 补充球
    addBall() {
        // 按照GameConfig.BallGenConfig概率 补充球 补充到50个 
        // 生成大球、巨大球后，不再生成小球，大球被抓走后，继续生成小球，保持场上最大小球数50个
        
        const currentBallCount = this.ballContainer.children.length;
        if (currentBallCount >= 50) {
            return; // 已达到最大球数
        }
        
        const needToAdd = 50 - currentBallCount;
        
        // 检查场上是否还有大球或巨大球
        const hasBigBalls = this.hasBigBalls();
        
        // 根据场上情况决定生成策略
        const ballsToAdd = this.generateBallsByStrategy(needToAdd, hasBigBalls);
        
        // 生成球
        for (let i = 0; i < ballsToAdd.length; i++) {
            const ball = instantiate(this.ballPrefab);
            ball.setPosition(new Vec3(0, 0, 0));
            ball.getComponent(Ball).setBallIndex(currentBallCount + i);
            ball.getComponent(Ball).setBallTypeAndSize(ballsToAdd[i].type, ballsToAdd[i].size);
            ball.getComponent(Ball).setBallColor(ballsToAdd[i].color);
            this.ballContainer.addChild(ball);
        }
    }

     // 检查场上是否还有大球或巨大球
     private hasBigBalls(): boolean {
        const children = this.ballContainer.children;
        for (let i = 0; i < children.length; i++) {
            const ball = children[i].getComponent(Ball);
            if (ball && (ball.getBallType() === BallType.Big || ball.getBallType() === BallType.SuperBig)) {
                return true;
            }
        }
        return false;
    }
    
    // 根据策略生成球
    private generateBallsByStrategy(count: number, hasBigBalls: boolean): { type: BallType, size: number, color: BallColor }[] {
        const config = GameConfig.BallGenConfig;
        let balls: { type: BallType, size: number, color: BallColor }[] = [];
        
        if (hasBigBalls) {
            // 有大球时，只生成大球和巨大球
            const bigBallConfigs = config.filter(c => c.type === BallType.Big || c.type === BallType.SuperBig);
            const totalRate = bigBallConfigs.reduce((sum, c) => sum + c.rate, 0);
            
            for (let i = 0; i < count; i++) {
                const random = Math.random() * totalRate;
                let currentRate = 0;
                
                for (const ballConfig of bigBallConfigs) {
                    currentRate += ballConfig.rate;
                    if (random <= currentRate) {
                        const color = this.generateRandomColor();
                        balls.push({ type: ballConfig.type, size: ballConfig.size, color: color });
                        break;
                    }
                }
            }
        } else {
            // 没有大球时，按正常概率生成所有类型的球
            const totalRate = config.reduce((sum, c) => sum + c.rate, 0);
            
            for (let i = 0; i < count; i++) {
                const random = Math.random() * totalRate;
                let currentRate = 0;
                
                for (const ballConfig of config) {
                    currentRate += ballConfig.rate;
                    if (random <= currentRate) {
                        const color = this.generateRandomColor();
                        balls.push({ type: ballConfig.type, size: ballConfig.size, color: color });
                        break;
                    }
                }
            }
        }
        
        return balls;
    }

     // 根据BallColorConfig概率生成随机颜色
     private generateRandomColor(): BallColor {
        const colorConfig = GameConfig.BallColorConfig;
        const totalRate = colorConfig.reduce((sum, c) => sum + c.rate, 0);
        const random = Math.random() * totalRate;
        let currentRate = 0;
        
        for (const config of colorConfig) {
            currentRate += config.rate;
            if (random <= currentRate) {
                return config.color;
            }
        }
        
        return BallColor.Red; // 默认返回红色
    }
    
}

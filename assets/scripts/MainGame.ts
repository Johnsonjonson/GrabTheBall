import { _decorator, Component, EventTouch, instantiate, Node, Prefab, RigidBody2D, RigidBodyComponent, Size, Sprite, SpriteFrame, tween, UITransform, Vec2, Vec3 } from 'cc';
import { Ball } from './Ball';
import { BallType, BallColor, GameConfig } from './GameConfig';
const { ccclass, property } = _decorator;

@ccclass('MainGame')
export class MainGame extends Component {
    @property(Node)
    private ballTouchArea: Node = null;
    
    @property(Node)
    private ballContainer: Node = null;

    // 爪子
    @property(Node)
    private claws: Node = null;
    
    // 爪子
    @property(Node)
    private clawsWallTop: Node = null;

    // 爪子节点
    @property(Node)
    private clawsNode: Node = null;

    // 爪子区域
    @property(Node)
    private clawsArea: Node = null;

    // 爪子杆
    @property(Node)
    private clawsPole: Node = null;

    @property(SpriteFrame)
    private clawsFrames: SpriteFrame[] = [];

    @property(Prefab)
    private ballPrefab: Prefab = null;

    private originalPosition: Vec3 = new Vec3(0, 0, 0);
    private originalPoleHeight: number = 0;
    private updateHeight: boolean = false;
    private isOpen: boolean = true;
    private genBallConfig: any = null;

    protected onLoad(): void {
        this.claws.angle = 0;
        this.originalPosition = this.claws.getPosition();
        this.originalPoleHeight = this.clawsPole.getComponent(UITransform).height;
    }
    
    start() {
        this.ballTouchArea.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.ballTouchArea.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.ballTouchArea.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);

        this.genBallConfig = 
        this.initBalls();
    }

    initBalls() {
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

    onTouchStart(event: EventTouch) {
        console.log('touch start');
        if (this.updateHeight) {
            return;
        }
        var location = event.getUILocation();
        this.updateAngle(location);

    }

    onTouchMove(event: EventTouch) {
        if (this.updateHeight) {
            return;
        }
        console.log('touch move');
        var location = event.getUILocation();
        this.updateAngle(location);
    }

    onTouchEnd(event: EventTouch) {
        if (this.updateHeight) {
            return;
        }
        this.clawsWallTop.active = false;
        this.claws.getComponent(Sprite).spriteFrame = this.clawsFrames[1];
        var location = event.getUILocation();
        var clawsPosition = this.clawsNode.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(location.x, location.y, 0));
        console.log('clawsPosition',clawsPosition);
        this.updateHeight = true;
        // 获取触摸点与爪子的角度
        this.updateAngle(location);
        this.crabTheBalls(clawsPosition);
    }    

    crabTheBalls(clawsPosition: Vec3) {
        this.isOpen = true;
        // 爪子移动到触摸点
        tween(this.claws.position).to(1, new Vec3(clawsPosition.x, clawsPosition.y, 0),{
            onUpdate : (target:Vec3, ratio:number)=>{                       // onUpdate 接受当前缓动的进度
                this.claws.setPosition(target);                                // 将缓动系统计算出的结果赋予 node 的位置
                this.updateClawPoleHeight();
            }
        }).call(()=> {
            // this.clawsNode.angle = 0;
            console.log('call');
            this.isOpen = false;
            this.calDisPosition = null; 
            var balls = this.getInClawsAreaBalls();
            // tween
            // this.clawsWallTop.active = true;
            for (let i = 0; i < balls.length; i++) {
                var ball = balls[i];
                var index = ball.getComponent(Ball).getBallIndex();
                console.log('getInClawsAreaBalls index',index); 
                // 将球放置在爪子内 并设置为不可移动
                var ballPosition = ball.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0));
                var clawsPosition = this.claws.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(ballPosition.x, ballPosition.y, 0));
                ball.setParent(this.claws);
                ball.setPosition(clawsPosition);
                ball.getComponent(RigidBody2D).enabled = false;
            }
            this.addBall();
            console.log('balls',balls);
            this.claws.getComponent(Sprite).spriteFrame = this.clawsFrames[0];
            tween(this.claws.position).to(1, this.originalPosition,{
                onUpdate : (target:Vec3, ratio:number)=>{                       // onUpdate 接受当前缓动的进度
                    this.claws.setPosition(target);                                // 将缓动系统计算出的结果赋予 node 的位置
                    this.updateClawPoleHeight();
                }
            }).call(()=>{
                this.updateHeight = false;
                this.calDisPosition = null;
                this.claws.setPosition(this.originalPosition);
                this.clawsPole.getComponent(UITransform).height = this.originalPoleHeight;
                for (let i = 0; i < balls.length; i++) {
                    balls[i].active = false;
                }
            }).start();
        }).start();
    }

    getInClawsAreaBalls() {
        var balls = this.ballContainer.children;
        var inClawsAreaBalls = [];
        console.log('getInClawsAreaBalls',balls.length);
        
        // 获取爪子的多边型区域
        var clawsAreaPosition = this.clawsArea.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0));
        var clawsAreaSize = this.clawsArea.getComponent(UITransform).contentSize;
        var clawsAreaPolygon = [
            new Vec2(clawsAreaPosition.x - clawsAreaSize.width / 2, clawsAreaPosition.y - clawsAreaSize.height / 2),
            new Vec2(clawsAreaPosition.x + clawsAreaSize.width / 2, clawsAreaPosition.y - clawsAreaSize.height / 2),
            new Vec2(clawsAreaPosition.x + clawsAreaSize.width / 2, clawsAreaPosition.y + clawsAreaSize.height / 2),
            new Vec2(clawsAreaPosition.x - clawsAreaSize.width / 2, clawsAreaPosition.y + clawsAreaSize.height / 2),
            new Vec2(clawsAreaPosition.x - clawsAreaSize.width / 2, clawsAreaPosition.y - clawsAreaSize.height / 2)
        ];

        // 获取爪子前进方向（从原始位置到当前位置的向量）
        var clawsDirection = new Vec2(
            this.claws.position.x - this.originalPosition.x,
            this.claws.position.y - this.originalPosition.y
        );
        clawsDirection.normalize();

        function isPointInPolygon(point: Vec2, polygon: Vec2[]): boolean {
            let inside = false;
            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                const xi = polygon[i].x, yi = polygon[i].y;
                const xj = polygon[j].x, yj = polygon[j].y;
                const intersect = ((yi > point.y) !== (yj > point.y)) &&
                    (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        }

        function isSmallBallInClaw(ballCenter: Vec2, ballRadius: number, clawPolygon: Vec2[]): boolean {
            console.log('isSmallBallInClaw',ballCenter,ballRadius,clawPolygon);
            const totalSamples = 1000; // 总采样点数
            let insideCount = 0;
        
            for (let i = 0; i < totalSamples; i++) {
                // 在球体内随机生成一点
                const angle = Math.random() * Math.PI * 2;
                const r = ballRadius * Math.sqrt(Math.random());
                const point = new Vec2(
                    ballCenter.x + r * Math.cos(angle),
                    ballCenter.y + r * Math.sin(angle)
                );
        
                // 判断点是否在爪内
                if (isPointInPolygon(point, clawPolygon)) {
                    insideCount++;
                }
            }
        
            const ratio = insideCount / totalSamples;
            return ratio >= 0.8; // 80% 体积在爪内
        }

        function calculateAngle(clawsDirection: Vec2, ballCenter: Vec2, clawsPosition: Vec3): number {
            // 计算爪子到球中心的向量
            var ballToClaws = new Vec2(
                ballCenter.x - clawsPosition.x,
                ballCenter.y - clawsPosition.y
            );
            ballToClaws.normalize();
            
            // 计算两个向量的夹角
            var dotProduct = clawsDirection.x * ballToClaws.x + clawsDirection.y * ballToClaws.y;
            var angle = Math.acos(Math.max(-1, Math.min(1, dotProduct))) * 180 / Math.PI;
            
            return angle;
        }

        function shouldCatchBigBall(angle: number, ballCenter: Vec2, ballRadius: number, clawsPosition: Vec3, clawsSize: Size): boolean {
            console.log('shouldCatchBigBall',angle);
            
            // 1. 检查球是否与爪子触碰
            // const distance = Math.sqrt(
            //     Math.pow(ballCenter.x - clawsPosition.x, 2) + 
            //     Math.pow(ballCenter.y - clawsPosition.y, 2)
            // );
            // const touchDistance = ballRadius + Math.max(clawsSize.width, clawsSize.height) / 2;
            // if (distance > touchDistance) {
            //     console.log('球未与爪子触碰，距离:', distance, '触碰距离:', touchDistance);
            //     return false;
            // }
            
            // 2. 检查高度重合度是否达到80%
            const ballTop = ballCenter.y + ballRadius;
            const ballBottom = ballCenter.y - ballRadius;
            const clawsTop = clawsPosition.y + clawsSize.height / 2;
            const clawsBottom = clawsPosition.y - clawsSize.height / 2;
            
            const overlapTop = Math.min(ballTop, clawsTop);
            const overlapBottom = Math.max(ballBottom, clawsBottom);
            const overlapHeight = Math.max(0, overlapTop - overlapBottom);
            const ballHeight = ballRadius * 2;
            const overlapRatio = overlapHeight / ballHeight;
            
            console.log('高度重合度:', overlapRatio, '球高度:', ballHeight, '重合高度:', overlapHeight);
            if (overlapRatio < 0.6) {
                console.log('高度重合度不足60%');
                return false;
            }
            
            console.log('夹角:', angle);
            
            // 3. 根据夹角判断抓取成功率
            if (angle < 15) return true;           // 100% 抓取
            else if (angle >= 15 && angle < 25) return Math.random() < 0.7; // 70% 成功
            else return false;                     // 抓取失败
        }

        console.log('clawsAreaPolygon',clawsAreaPolygon);
        for (let i = 0; i < balls.length; i++) {
            var ball = balls[i];
            var ballComponent = ball.getComponent(Ball);
            var ballType = ballComponent.getBallType();
            var ballPosition = ball.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0));
            var ballCenter = new Vec2(ballPosition.x, ballPosition.y);
            var ballRadius = ball.getComponent(UITransform).contentSize.width / 2;
            
            // 根据球的大小类型使用不同的抓取逻辑
            if (ballType === BallType.SuperMini || ballType === BallType.Mini || ballType === BallType.Mid) {
                // 小、中球：体积检测
                if (isSmallBallInClaw(ballCenter, ballRadius, clawsAreaPolygon)) {
                    inClawsAreaBalls.push(ball);
                }
            } else if (ballType === BallType.Big || ballType === BallType.SuperBig) {
                // 大球、巨大球：夹角检测
                console.log('大球、巨大球：夹角检测');
                var angle = calculateAngle(clawsDirection, ballCenter, clawsAreaPosition);
                var clawsSize = this.clawsArea.getComponent(UITransform).contentSize;
                if (shouldCatchBigBall(angle, ballCenter, ballRadius, clawsAreaPosition, clawsSize)) {
                    inClawsAreaBalls.push(ball);
                }
            }
        }
        return inClawsAreaBalls;
    }

    updateAngle(location: Vec2) {
        var clawsPosition = this.claws.getPosition();
        // var destPosition =  this.claws.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(location.x, location.y, 0));
        var size = this.ballTouchArea.getComponent(UITransform).contentSize;
        var deltaX = location.x - size.width / 2 - clawsPosition.x;
        var deltaY = location.y - size.height / 2 - clawsPosition.y;
        // var deltaX = destPosition.x - clawsPosition.x;
        // var deltaY = destPosition.y - clawsPosition.y;
        const radians = Math.atan2(deltaY, deltaX);
        const clawsAngle = radians * 180 / Math.PI - 90;
        const normalizedDegrees = clawsAngle < 0 ? clawsAngle + 360 : clawsAngle;

        this.clawsNode.setRotationFromEuler(new Vec3(0, 0, normalizedDegrees));
        // this.clawsNode.angle = normalizedDegrees;
    }

    updateClawPoleHeight() {
        var clawsPosition = this.claws.getPosition(); 
        if (this.calDisPosition == null) {
            this.calDisPosition = clawsPosition;
        }
        var deltaX = this.calDisPosition.x - clawsPosition.x;
        var deltaY = this.calDisPosition.y - clawsPosition.y;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        // console.log('distance   ',distance);

        var height = this.isOpen ? distance : -distance;
        var clawsPoleSize = this.clawsPole.getComponent(UITransform).contentSize;
        this.clawsPole.getComponent(UITransform).height = clawsPoleSize.height + height;
        this.calDisPosition = clawsPosition;
    }
    
    private calDisPosition: Vec3 = null;
    update(deltaTime: number) {
        // if (this.updateHeight) {
        //     var clawsPosition = this.claws.getPosition(); 
        //     if (this.calDisPosition == null) {
        //         this.calDisPosition = clawsPosition;
        //     }
        //     var deltaX = this.calDisPosition.x - clawsPosition.x;
        //     var deltaY = this.calDisPosition.y - clawsPosition.y;
        //     var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        //     // console.log('distance   ',distance);
    
        //     var height = this.isOpen ? distance : -distance;
        //     var clawsPoleSize = this.clawsPole.getComponent(UITransform).contentSize;
        //     this.clawsPole.getComponent(UITransform).height = clawsPoleSize.height + height;
        //     this.calDisPosition = clawsPosition;
        //     // console.log('clawsPoleSize',clawsPoleSize);
        // }
        
    }
}



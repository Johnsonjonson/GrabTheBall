import { _decorator, Component, Node, Sprite, SpriteFrame, tween, UITransform, Vec2, Vec3, Size, RigidBody2D, director, view, screen, Line, Color, Graphics } from 'cc';
import { Ball } from './Ball';
import { BallType } from './GameConfig';
import { HorizontalSkillManager } from './HorizontalSkillManager';
const { ccclass, property } = _decorator;

@ccclass('Claws')
export class Claws extends Component {
    // 爪子相关节点
    @property(Node)
    private clawsWallTop: Node = null;

    @property(Node)
    private clawsNode: Node = null;

    @property(Node)
    private clawsArea: Node = null;

    @property(Node)
    private clawsPole: Node = null;

    @property(SpriteFrame)
    private clawsFrames: SpriteFrame[] = [];
    @property(Node)
    private lineNode: Node = null;

    // 爪子配置
    private originalPosition: Vec3 = new Vec3(0, 0, 0);
    private originalPoleHeight: number = 0;
    private clawLength: number = 800; // 固定爪子长度，可根据实际需求调整
    private radians: number = 1.57;
    private isOpen: boolean = true;
    private updateHeight: boolean = false;
    private calDisPosition: Vec3 = null;
    private _lastClawEndPos: Vec3 = new Vec3(0, 0, 0);

    // 回调函数类型定义
    public onCrabBallEndCallback: (balls: Node[]) => void = null;

    protected onLoad(): void {
        this.node.angle = 0;
        this.originalPosition = this.node.getPosition();
        this.originalPoleHeight = this.clawsPole.getComponent(UITransform).height;
    }

    start() {
        // 计算爪子与球体contaier的距离
        // this.clawLength = Director.instance.getDesignResolutionSize().height * 0.8;
    }

    update(deltaTime: number) {
        
    }

    public setClawLength(clawLength: number) {
        this.clawLength = clawLength;
    }

    /**
     * 更新爪子角度
     * @param location 触摸位置
     * @param touchAreaSize 触摸区域大小
     */
    public updateAngle(location: Vec2, touchAreaSize: Size) {
        var origin = this.originalPosition;
        // var origin = this.clawsNode.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0));
        var targetX = location.x - touchAreaSize.width / 2;
        var targetY = location.y - touchAreaSize.height / 2;
        var deltaX = targetX - origin.x;
        var deltaY = targetY - origin.y;
        const radians = Math.atan2(deltaY, deltaX);
        this.radians = radians;
        console.log('radians', radians);
        this.calculateClawEndPos(touchAreaSize);
    }

    /**
     * 计算爪子末端位置
     * @param touchAreaSize 触摸区域大小
     */
    public calculateClawEndPos(touchAreaSize: Size) {
        console.log('calculateClawEndPos', this.radians,touchAreaSize);
        var clawsSize = this.node.getComponent(UITransform).contentSize;

        var origin = this.originalPosition; 
        const clawsAngle = this.radians * 180 / Math.PI - 90;
        const normalizedDegrees = clawsAngle < 0 ? clawsAngle + 360 : clawsAngle;
        this.clawsNode.setRotationFromEuler(new Vec3(0, 0, normalizedDegrees));
        // director.
        // 获取屏幕宽度
        let visibleSize = view.getVisibleSize()
        let windowSize =  screen.windowSize;
        console.log('visibleSize', visibleSize,windowSize);

        // let visibleSize = view.getVisibleSize()
        const visibleRatio = visibleSize.x/visibleSize.y
        // let windowSize = screen.windowSize;
        let winRatio = windowSize.width / windowSize.height;
        let size = new Size(0,0);
        if (visibleRatio > winRatio) {
            size = new Size(visibleSize.width, visibleSize.height*visibleRatio/winRatio)
        } else {
            size = new Size(visibleSize.width*(winRatio/visibleRatio), visibleSize.height)
        }
        console.log('calculateClawEndPos  size', size);

        // 计算末端点
        this._lastClawEndPos = new Vec3(
            origin.x + this.clawLength * Math.cos(this.radians) - Math.cos(this.radians) * size.width/2,
            origin.y + this.clawLength * Math.sin(this.radians),
            0
        );
         // 用graphics画一条线
         var graphics = this.lineNode.getComponent(Graphics);
         graphics.clear();
         graphics.fillColor = new Color(255, 0, 0, 255);
         graphics.moveTo(this.originalPosition.x, this.originalPosition.y);
         graphics.lineTo(this._lastClawEndPos.x, this._lastClawEndPos.y);
         graphics.stroke();
    }

    /**
     * 获取爪子末端位置
     */
    public getLastClawEndPos(): Vec3 {
        return this._lastClawEndPos.clone();
    }

    /**
     * 抓取球
     * @param clawsPosition 爪子位置
     * @param ballContainer 球容器
     */
    public crabTheBalls(ballContainer: Node) {
        var clawsPosition = this.getLastClawEndPos();

        this.clawsWallTop.active = false;
        this.node.getComponent(Sprite).spriteFrame = this.clawsFrames[1];
        this.isOpen = true;
        this.updateHeight = true;
        
        // 爪子移动到末端点
        tween(this.node.position).to(1, clawsPosition, {
            onUpdate: (target: Vec3, ratio: number) => {
                this.node.setPosition(target);
                this.updateClawPoleHeight();
                
                // 检查技能触发
                this.checkSkillTrigger();
            }
        }).call(() => {
            console.log('call');
            this.isOpen = false;
            this.calDisPosition = null; 
            var balls = this.getInClawsAreaBalls(ballContainer);
            
            for (let i = 0; i < balls.length; i++) {
                var ball = balls[i];
                var index = ball.getComponent(Ball).getBallIndex();
                console.log('getInClawsAreaBalls index', index); 
                // 将球放置在爪子内 并设置为不可移动
                var ballPosition = ball.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0));
                var clawsPosition = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(ballPosition.x, ballPosition.y, 0));
                ball.setParent(this.node);
                ball.setPosition(clawsPosition);
                ball.getComponent(RigidBody2D).enabled = false;
            }
            
            this.node.getComponent(Sprite).spriteFrame = this.clawsFrames[0];
            tween(this.node.position).to(1, this.originalPosition, {
                onUpdate: (target: Vec3, ratio: number) => {
                    this.node.setPosition(target);
                    this.updateClawPoleHeight();
                }
            }).call(() => {
                this.onCrabBallEnd(balls);
            }).start();
        }).start();
    }

    /**
     * 抓取结束回调
     * @param balls 抓取到的球
     */
    private onCrabBallEnd(balls: Node[]) {
        this.updateHeight = false;
        this.calDisPosition = null;
        this.node.setPosition(this.originalPosition);
        this.clawsPole.getComponent(UITransform).height = this.originalPoleHeight;
        for (let i = 0; i < balls.length; i++) {
            balls[i].active = false;
        }
        
        // 调用外部回调
        if (this.onCrabBallEndCallback) {
            this.onCrabBallEndCallback(balls);
        }
    }

    /**
     * 获取爪子区域内的球
     * @param ballContainer 球容器
     */
    private getInClawsAreaBalls(ballContainer: Node): Node[] {
        var balls = ballContainer.children;
        var inClawsAreaBalls: Node[] = [];
        console.log('getInClawsAreaBalls', balls.length);
        
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
            this.node.position.x - this.originalPosition.x,
            this.node.position.y - this.originalPosition.y
        );
        clawsDirection.normalize();

        console.log('clawsAreaPolygon', clawsAreaPolygon);
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
                if (this.isSmallBallInClaw(ballCenter, ballRadius, clawsAreaPolygon)) {
                    inClawsAreaBalls.push(ball);
                }
            } else if (ballType === BallType.Big || ballType === BallType.SuperBig) {
                // 大球、巨大球：夹角检测
                console.log('大球、巨大球：夹角检测');
                var angle = this.calculateAngle(clawsDirection, ballCenter, clawsAreaPosition);
                var clawsSize = this.clawsArea.getComponent(UITransform).contentSize;
                if (this.shouldCatchBigBall(angle, ballCenter, ballRadius, clawsAreaPosition, clawsSize)) {
                    inClawsAreaBalls.push(ball);
                }
            }
        }
        return inClawsAreaBalls;
    }

    /**
     * 判断点是否在多边形内
     */
    private isPointInPolygon(point: Vec2, polygon: Vec2[]): boolean {
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

    /**
     * 判断小球是否在爪内
     */
    private isSmallBallInClaw(ballCenter: Vec2, ballRadius: number, clawPolygon: Vec2[]): boolean {
        // console.log('isSmallBallInClaw', ballCenter, ballRadius, clawPolygon);
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
            if (this.isPointInPolygon(point, clawPolygon)) {
                insideCount++;
            }
        }
    
        const ratio = insideCount / totalSamples;
        return ratio >= 0.8; // 80% 体积在爪内
    }

    /**
     * 计算夹角
     */
    private calculateAngle(clawsDirection: Vec2, ballCenter: Vec2, clawsPosition: Vec3): number {
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

    /**
     * 判断是否应该抓取大球
     */
    private shouldCatchBigBall(angle: number, ballCenter: Vec2, ballRadius: number, clawsPosition: Vec3, clawsSize: Size): boolean {
        console.log('shouldCatchBigBall', angle);
        
        // 检查高度重合度是否达到60%
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
        
        // 根据夹角判断抓取成功率
        if (angle < 15) return true;           // 100% 抓取
        else if (angle >= 15 && angle < 25) return Math.random() < 0.7; // 70% 成功
        else return false;                     // 抓取失败
    }

    /**
     * 更新爪子杆高度
     */
    private updateClawPoleHeight() {
        // 使用固定长度 clawLength 进行伸缩
        var clawsPosition = this.node.getPosition(); 
        if (this.calDisPosition == null) {
            this.calDisPosition = clawsPosition;
        }
        var deltaX = this.calDisPosition.x - clawsPosition.x;
        var deltaY = this.calDisPosition.y - clawsPosition.y;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // 使用固定长度 clawLength 而不是动态计算的距离
        var height = this.isOpen ? distance : -distance
        var clawsPoleSize = this.clawsPole.getComponent(UITransform).contentSize;
        this.clawsPole.getComponent(UITransform).height = clawsPoleSize.height + height;
        this.calDisPosition = clawsPosition;
    }

    /**
     * 设置抓取结束回调
     */
    public setCrabBallEndCallback(callback: (balls: Node[]) => void) {
        this.onCrabBallEndCallback = callback;
    }

    /**
     * 获取是否正在更新高度
     */
    public isUpdatingHeight(): boolean {
        return this.updateHeight;
    }

    /**
     * 设置是否正在更新高度
     */
    public setUpdatingHeight(value: boolean) {
        this.updateHeight = value;
    }

    /**
     * 检查技能触发
     */
    private checkSkillTrigger(): void {
        if (!HorizontalSkillManager.instance) return;

        // 获取爪子位置和大小
        const clawPosition = this.clawsArea.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0));
        const clawSize = this.clawsArea.getComponent(UITransform).contentSize;

        // 检查技能触发
        HorizontalSkillManager.instance.checkSkillTrigger(clawPosition, clawSize);
    }
}



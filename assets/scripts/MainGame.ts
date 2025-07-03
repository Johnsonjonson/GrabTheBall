import { _decorator, Component, EventTouch, instantiate, Node, Prefab, RigidBody2D, RigidBodyComponent, Size, Sprite, SpriteFrame, tween, UITransform, Vec2, Vec3 } from 'cc';
import { Ball } from './Ball';
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
        for (let i = 0; i < 50; i++) {
            var ball = instantiate(this.ballPrefab);
            ball.setPosition(new Vec3(0, 0, 0));
            ball.getComponent(Ball).setBallIndex(i);
            this.ballContainer.addChild(ball);
        }
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
        tween(this.claws.position).to(2, new Vec3(clawsPosition.x, clawsPosition.y, 0),{
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
            console.log('balls',balls);
            this.claws.getComponent(Sprite).spriteFrame = this.clawsFrames[0];
            tween(this.claws.position).to(2, this.originalPosition,{
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

        function isBallInClaw(ballCenter: Vec2, ballRadius: number, clawPolygon: Vec2[]): boolean {
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

        console.log('clawsAreaPolygon',clawsAreaPolygon);
        for (let i = 0; i < balls.length; i++) {
            var ball = balls[i];
            var ballPosition = ball.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(0, 0, 0));
            var ballCenter = new Vec2(ballPosition.x, ballPosition.y);
            var ballRadius = ball.getComponent(UITransform).contentSize.width / 2;
            if (isBallInClaw(ballCenter, ballRadius, clawsAreaPolygon)) {
                inClawsAreaBalls.push(ball);
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



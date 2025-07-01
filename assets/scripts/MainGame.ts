import { _decorator, Component, EventTouch, instantiate, Node, Prefab, Size, Sprite, SpriteFrame, tween, UITransform, Vec2, Vec3 } from 'cc';
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

    protected onLoad(): void {
        this.claws.angle = 0;
        this.originalPosition = this.claws.getPosition();
        this.originalPoleHeight = this.clawsPole.getComponent(UITransform).height;
    }
    
    start() {
        this.ballTouchArea.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.ballTouchArea.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.ballTouchArea.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);

        this.initBalls();
    }

    initBalls() {
        this.ballContainer.removeAllChildren();
        for (let i = 0; i < 50; i++) {
            var ball = instantiate(this.ballPrefab);
            ball.setPosition(new Vec3(0, 0, 0));
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
            this.clawsWallTop.active = true;
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
            }).start();
        }).start();
    }    

    updateAngle(location: Vec2) {
        var clawsPosition = this.claws.getPosition();
        var size = this.ballTouchArea.getComponent(UITransform).contentSize;
        var deltaX = location.x - size.width / 2 - clawsPosition.x;
        var deltaY = location.y - size.height / 2 - clawsPosition.y;
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



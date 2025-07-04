import { _decorator, CircleCollider2D, Collider2D, Component, Label, Node, RigidBody2D, Size, Sprite, SpriteFrame, UITransform, Color } from 'cc';
import { BallType, BallColor } from './GameConfig';
const { ccclass, property } = _decorator;

@ccclass('Ball')
export class Ball extends Component {

    @property(Sprite)
    private ballSprite: Sprite = null;

    @property(SpriteFrame)
    private ballSpriteFrames: SpriteFrame[] = [];

    @property(Label)
    private ballLabel: Label = null;

    private ballIndex: number = 0;
    private ballType: BallType = BallType.SuperMini;
    private ballSize: number = 10;
    private ballColor: BallColor = BallColor.Red;

    start() {

    }
    setBallData(data: any) {
        this.ballIndex = data.index;
        // this.setBallSprite(data.index % 8);
        this.setBallLabel(data.index);
    }

    setBallIndex(index: number) {
        this.ballIndex = index;
        // this.setBallSprite(index % 8);
        this.setBallLabel(index);
    }

    setBallTypeAndSize(type: BallType, size: number) {
        this.ballType = type;
        this.ballSize = size;
        this.getComponent(UITransform).setContentSize(new Size(size, size));
        this.getComponent(CircleCollider2D).radius = size / 2;
    }

    setBallColor(color: BallColor) {
        this.ballColor = color;
        this.applyColor();
    }

    getBallColor() {
        return this.ballColor;
    }

    private applyColor() {
        if (this.ballSprite) {
            const colorSpriteMap = {
                [BallColor.Red]: 0,
                [BallColor.Orange]: 1,
                [BallColor.Yellow]: 2,
                [BallColor.Green]: 3,
                [BallColor.Blue]: 4,
                [BallColor.White]: 5,
                [BallColor.Black]: 6,
            };
            this.setBallSprite(colorSpriteMap[this.ballColor]);
        }
    }

    getBallIndex() {
        return this.ballIndex;
    }

    getBallType() {
        return this.ballType;
    }

    setBallSprite(index: number) {
        this.ballSprite.spriteFrame = this.ballSpriteFrames[index];
        this.getComponent(UITransform).setContentSize(new Size(this.ballSize, this.ballSize));
        this.getComponent(CircleCollider2D).radius = this.ballSize / 2;
    }

    setBallLabel(index: number) {
        this.ballLabel.string = index.toString();
    }

    update(deltaTime: number) {
        
    }
}



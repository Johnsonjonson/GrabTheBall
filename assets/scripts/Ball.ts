import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
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

    start() {

    }

    setBallIndex(index: number) {
        this.ballIndex = index;
        this.setBallSprite(index % 8);
        this.setBallLabel(index);
    }

    getBallIndex() {
        return this.ballIndex;
    }

    setBallSprite(index: number) {
        this.ballSprite.spriteFrame = this.ballSpriteFrames[index];
    }

    setBallLabel(index: number) {
        this.ballLabel.string = index.toString();
    }

    update(deltaTime: number) {
        
    }
}



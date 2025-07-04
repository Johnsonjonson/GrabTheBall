import { _decorator, Component, Prefab } from 'cc';
import { Ball } from './Ball';
import { BallColor } from './GameConfig';
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

    
    
}

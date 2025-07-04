/**
 * @FileName: SpriteUtility.ts
 * @Author: ReneYang
 * @Date: 2025-03-27 15:33:52
 * @Description: Sprite相关工具类
 */

import { ImageAsset, Sprite, SpriteFrame, Texture2D } from "cc";
import { StringUtility } from "./StringUtility";
import { UITransform } from "cc";

export class SpriteUtility {

    public static showSpriteWithBase64(sprite:Sprite, base64: string) {
        if(sprite == null || StringUtility.isEmpty(base64)) {
            return;
        }
        let size = sprite.getComponent(UITransform).contentSize
        const image = new Image(size.width, size.height);
        image.onload = () => {
            const imageAsset = new ImageAsset(image);
            const texture = new Texture2D();
            texture.image = imageAsset;
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            spriteFrame.packable = false; // 避免动态合图问题[5](@ref)

            if (sprite) {
                sprite.spriteFrame = spriteFrame;
            }
        };
        image.src = base64;
    }
}
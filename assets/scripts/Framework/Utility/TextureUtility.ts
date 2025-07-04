import { __private } from "cc";
import { ImageAsset, SpriteFrame, Texture2D, RenderTexture, Camera, Node, Canvas, view, Rect } from "cc";
import { Log } from "../Log/Logger";

export class TextureUtility {

    /**
     * 将 base64 字符串转换为 Texture2D
     * @param base64 base64 字符串，支持带 data:image/ 前缀的格式
     * @returns Promise<Texture2D> 返回 Texture2D 对象
     */
    public static base64ToTexture2D(base64: string): Promise<Texture2D> {
        return new Promise((resolve, reject) => {
            if (!base64) {
                reject(new Error("base64 string is empty"));
                return;
            }

            // 创建 Image 对象
            const image = new Image();

            image.onload = () => {
                try {
                    // 创建 ImageAsset
                    const imageAsset = new ImageAsset(image);

                    // 创建 Texture2D
                    const texture = new Texture2D();
                    texture.image = imageAsset;

                    resolve(texture);
                } catch (error) {
                    reject(error);
                }
            };

            image.onerror = (error) => {
                reject(new Error(`Failed to load image from base64: ${error}`));
            };

            // 设置图片源
            image.src = base64;
        });
    }

    /**
     * 将 base64 字符串转换为 SpriteFrame
     * @param base64 base64 字符串
     * @returns Promise<SpriteFrame> 返回 SpriteFrame 对象
     */
    public static base64ToSpriteFrame(base64: string): Promise<SpriteFrame> {
        return this.base64ToTexture2D(base64).then(texture => {
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            spriteFrame.packable = false; // 避免动态合图问题
            return spriteFrame;
        }).catch((err) => {
            Log.d('base64ToSpriteFrame error', err);
            return null;
        });
    }

    /**
     * 将 base64 字符串转换为 Texture2D（同步版本，需要先确保图片已加载）
     * @param base64 base64 字符串
     * @param width 图片宽度
     * @param height 图片高度
     * @returns Texture2D 对象
     */
    public static base64ToTexture2DSync(base64: string, width: number = 256, height: number = 256): Texture2D {
        if (!base64) {
            throw new Error("base64 string is empty");
        }

        // 创建 Image 对象
        const image = new Image(width, height);
        image.src = base64;

        // 创建 ImageAsset
        const imageAsset = new ImageAsset(image);

        // 创建 Texture2D
        const texture = new Texture2D();
        texture.image = imageAsset;

        return texture;
    }

    /**
     * 检查 base64 字符串是否为有效的图片格式
     * @param base64 base64 字符串
     * @returns boolean 是否为有效的图片格式
     */
    public static isValidImageBase64(base64: string): boolean {
        if (!base64) return false;

        // 检查是否包含 data:image/ 前缀
        if (base64.startsWith('data:image/')) {
            return true;
        }

        // 检查是否为纯 base64 字符串（至少包含一些常见图片格式的特征）
        const validBase64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
        return validBase64Pattern.test(base64);
    }

    /**
     * 清理 Texture2D 资源
     * @param texture Texture2D 对象
     */
    public static destroyTexture(texture: __private._cocos_asset_assets_texture_base__TextureBase): void {
        if (texture) {
            texture.destroy();
        }
    }

    /**
     * 清理 SpriteFrame 资源
     * @param spriteFrame SpriteFrame 对象
     */
    public static destroySpriteFrame(spriteFrame: SpriteFrame): void {
        if (spriteFrame) {
            if (spriteFrame.texture) {
                this.destroyTexture(spriteFrame.texture);
            }
            spriteFrame.destroy();
        }
    }

    /**
     * 将 SpriteFrame 转换为 base64 字符串（简化版本，参照 test.ts）
     * @param spriteFrame SpriteFrame 对象
     * @param targetWidth 目标宽度
     * @param targetHeight 目标高度
     * @param quality 图片质量 (0-1)
     * @returns Promise<string> 返回 base64 字符串
     */
    public static spriteFrameToBase64Simple(spriteFrame: SpriteFrame, targetWidth: number = 300, targetHeight: number = 300, quality: number = 0.8): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!spriteFrame || !spriteFrame.texture) {
                reject(new Error("SpriteFrame or texture is null"));
                return;
            }

            try {
                // 创建canvas元素
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('无法获取canvas上下文'));
                    return;
                }

                // 设置canvas尺寸为目标尺寸
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                // 创建Image对象
                const img = new Image();
                img.crossOrigin = 'anonymous';

                img.onload = () => {
                    try {
                        // 绘制图片到canvas，缩放到目标尺寸
                        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                        // 转换为base64
                        const base64 = canvas.toDataURL('image/jpeg', quality);
                        resolve(base64);
                    } catch (error) {
                        reject(new Error(`绘制图片失败: ${error.message}`));
                    }
                };

                img.onerror = () => {
                    reject(new Error('图片加载失败:'));
                };

                // 从Texture2D获取图片数据（简化版本）
                const texture = spriteFrame.texture as Texture2D;
                if (!texture || !texture.image) {
                    reject(new Error('SpriteFrame没有有效的纹理数据'));
                    return;
                }

                const imageAsset = texture.image;

                // 尝试多种方式获取图片源
                if (imageAsset.nativeUrl) {
                    img.src = imageAsset.nativeUrl;
                } else if (imageAsset.url) {
                    img.src = imageAsset.url;
                } else if (imageAsset instanceof HTMLImageElement) {
                    img.src = imageAsset.src;
                } else if (imageAsset instanceof HTMLCanvasElement) {
                    img.src = imageAsset.toDataURL();
                } else if (imageAsset.data instanceof HTMLImageElement) {
                    img.src = imageAsset.data.src;
                } else {
                    reject(new Error('无法获取纹理数据，请检查ImageAsset格式'));
                }

            } catch (error) {
                reject(new Error(`获取base64失败: ${error.message}`));
            }
        });
    }

    /**
     * 真正裁剪 SpriteFrame，创建新的 Texture2D 和 SpriteFrame
     * @param sourceSpriteFrame 源 SpriteFrame
     * @param rect 裁剪区域
     * @param targetWidth 目标宽度
     * @param targetHeight 目标高度
     * @returns Promise<SpriteFrame> 返回裁剪后的新 SpriteFrame
     */
    public static cropSpriteFrame(sourceSpriteFrame: SpriteFrame, rect: Rect, targetWidth: number = 300, targetHeight: number = 300): Promise<SpriteFrame> {
        return new Promise((resolve, reject) => {
            if (!sourceSpriteFrame || !sourceSpriteFrame.texture) {
                reject(new Error("Source SpriteFrame or texture is null"));
                return;
            }

            try {
                // 创建canvas元素
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('无法获取canvas上下文'));
                    return;
                }

                // 设置canvas尺寸为目标尺寸
                canvas.width = targetWidth;
                canvas.height = targetHeight;

                // 创建Image对象
                const img = new Image();
                img.crossOrigin = 'anonymous';

                img.onload = () => {
                    try {
                        // 清空canvas
                        ctx.clearRect(0, 0, targetWidth, targetHeight);

                        // 绘制裁剪区域到canvas
                        ctx.drawImage(
                            img,
                            rect.x, rect.y, rect.width, rect.height,  // 源图片裁剪区域
                            0, 0, targetWidth, targetHeight           // 目标canvas区域
                        );
                        const base64 = canvas.toDataURL('image/jpeg', 0.9);
                        const newImg = new Image();
                        newImg.onload = () => {
                            try {
                                // 创建新的ImageAsset
                                const newImageAsset = new ImageAsset(newImg);
                                // 创建新的Texture2D
                                const newTexture = new Texture2D();
                                newTexture.image = newImageAsset;
                                // 创建新的SpriteFrame
                                const newSpriteFrame = new SpriteFrame();
                                newSpriteFrame.texture = newTexture;
                                newSpriteFrame.packable = false;
                                resolve(newSpriteFrame);
                            } catch (error) {
                                reject(new Error(`创建新SpriteFrame失败: ${error.message}`));
                            }
                        };
                        newImg.onerror = () => {
                            reject(new Error('创建新图片失败'));
                        };
                        newImg.src = base64;

                    } catch (error) {
                        reject(new Error(`裁剪图片失败: ${error.message}`));
                    }
                };

                img.onerror = () => {
                    reject(new Error('源图片加载失败'));
                };

                // 从源Texture2D获取图片数据
                const sourceTexture = sourceSpriteFrame.texture as Texture2D;
                if (!sourceTexture || !sourceTexture.image) {
                    reject(new Error('源Texture2D没有有效的图片数据'));
                    return;
                }

                const imageAsset = sourceTexture.image;

                // 尝试多种方式获取图片源
                if (imageAsset.nativeUrl) {
                    img.src = imageAsset.nativeUrl;
                } else if (imageAsset.url) {
                    img.src = imageAsset.url;
                } else if (imageAsset instanceof HTMLImageElement) {
                    img.src = imageAsset.src;
                } else if (imageAsset instanceof HTMLCanvasElement) {
                    img.src = imageAsset.toDataURL();
                } else if (imageAsset.data instanceof HTMLImageElement) {
                    img.src = imageAsset.data.src;
                } else {
                    reject(new Error('无法获取源纹理数据，请检查ImageAsset格式'));
                }

            } catch (error) {
                reject(new Error(`裁剪SpriteFrame失败: ${error.message}`));
            }
        });
    }

    /**
     * 将base64数据转换成File类型
     * @param base64 base64字符串
     * @param filename 文件名
     * @returns File对象
     */
    public static base64ToFile(base64: string, filename: string): File {
        // 移除base64前缀（如：data:image/jpeg;base64,）
        const base64Data = base64.split(',')[1];

        // 将base64转换为二进制数据
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        return new File([blob], filename, { type: 'image/jpeg' });
    }

} 
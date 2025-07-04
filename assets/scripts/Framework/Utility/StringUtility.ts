/**
 * 
 * @FileName: StringUtility.ts
 * @ClassName: StringUtility
 * @Author: yafang
 * @CreateDate: Mon May 27 2024 19:22:22 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Utility/StringUtility.ts
 * @Description: 
 *      字符串处理工具类
 */
import { RichText } from "cc";
import { Log } from "../Log/Logger";
import { SpriteAtlas } from "cc";
// import { GameEntry } from "../../GameMain/Base/GameEntry";
// import { BundleInfo } from "../../GameMain/Definition/enum/BundleInfo";


export class StringUtility {
    public static readonly SEPARATOR: string = "@";

    public static isEmpty(value: string) {
        if (typeof value != 'string') {
            return true;
        }

        let emptyReg = /\s+/g;
        if (!value) {
            return true;
        }

        if (value.replace(emptyReg, "").length === 0) {
            return true;
        }

        return false;
    }

    /**
    * 解析项目资源数据，元数据格式（bundleName@res_path）
    * @param resourceData 数据格式
    */
    public static parsePath(resourceData: string): { bundName: string, path: string } {
        if (StringUtility.isEmpty(resourceData)) {
            Log.e("资源路径配置错误，资源路径为空字符串！", resourceData)
            return null;
        }

        let arr = resourceData.split(StringUtility.SEPARATOR)
        if (arr.length != 2) {
            Log.e("资源路径配置错误，资源路径分割符号使用错误！", resourceData)

            return null;
        }

        return { bundName: arr[0], path: arr[1] };
    }

    /**
    * 组装资源路径
    * @param bundleName 模块名称
    * @param path 相对于模块的路径
    * @returns 
    */
    public static getAssetPath(bundleName: string, path: string): string {
        return `${bundleName}@${path}`;
    }


    public static formatParams(str: string, ...args: any[]): string {
        if (StringUtility.isEmpty(str)) {
            return "";
        }

        if (args.length == 0) {
            return str;
        }

        let result = str;
        if (args.length == 1 && typeof (args[0]) == "object" && args[0] != null) {
            for (let key in args[0]) {
                if (Object.prototype.hasOwnProperty.call(args[0], key)) {
                    let reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[0][key]);
                }
            }
        } else {
            for (let i = 0; i < args.length; i++) {
                let reg = new RegExp("({[" + i + "]})", "g");
                result = result.replace(reg, String(args[i]));
            }
        }
        return result
    }

    public static uint8ArrayToBase64(buffer: Uint8Array): string {
        return btoa(String.fromCharCode(...buffer));
    }
    public static uint8ArrayToString(buffer: Uint8Array): string {
        return String.fromCharCode(...buffer);
    }

    public static base64ToUint8Array(base64: string): Uint8Array {
        const tempStr = atob(base64);

        // 将字符串编码为Uint8Array
        let str = new Uint8Array(tempStr.length);
        for (let i = 0; i < tempStr.length; i++) {
            str[i] = tempStr.charCodeAt(i)
        }
        return str
    }


    public static stringToUint8Array(tempStr: string): Uint8Array {
        let str = new Uint8Array(tempStr.length);
        for (let i = 0; i < tempStr.length; i++) {
            str[i] = tempStr.charCodeAt(i)
        }
        return str
    }

    /**
       * 获得字符串的字节长度
       * zjy 2024-05-28 14:38:57
       * @param str 字符串
       * @returns 字节长度
       */
    public static getStringByteLength(str: string): number {
        let len = 0;
        for (let i = 0; i < str.length; i++) {
            len += this.getCharLength(str, i);
        }
        return len;
    }

    /**
     * 获取字符串中第idx个字符的长度
     */
    public static getCharLength(str: string, idx: number = 0): number {
        let c = str.charCodeAt(idx);
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
            return 1;
        }
        else {
            return 2;
        }
    }

    /**
     * 替换字符串中的花括号内容
     */
    public static replaceCurlyBracket(str: string, replaceStr: string | number): string {
        let reg = /\{.*?\}/g;
        return str.replace(reg, replaceStr.toString());
    }

    /**
     * 获取截取长度后的字符串
     */
    public static getShortStr(str: string, maxLength: number = 12) {
        let len = 0;
        for (let i = 0; i < str.length; i++) {
            let tempLen = this.getCharLength(str, i)
            if (len + tempLen > maxLength) {
                return str.substring(0, i) + "...";
            }
            len += tempLen;
        }
        return str;
    }

    /**
     *  把图片加入富文本图集中去
     *   zjy 2024-05-28 14:39:45
     * @param richText 富文本
     * @param iconPath 图片路径 带bundleName 如： bundleName@path
     * 
     */

    // public static addImageToRichTextImageAtlas(richText: RichText, iconPathList: string[]) {

    //     if (iconPathList.length == 0) {
    //         return Promise.resolve(true);
    //     }

    //     return new Promise<Boolean>((resolve, reject) => {
    //         let len = iconPathList.length;
    //         let count = 0;
    //         iconPathList.forEach((iconPath) => {
    //             let atlas: SpriteAtlas = richText.imageAtlas ?? new SpriteAtlas();
    //             richText.imageAtlas = atlas;
    //             if (atlas.spriteFrames[iconPath]) {
    //                 count++;
    //                 if (count >= len) {
    //                     resolve(true);
    //                 }
    //             } else {
    //                 let resData = StringUtility.parsePath(iconPath);
    //                 GameEntry.resourceComponent.loadSpriteFrame(resData.bundName as BundleInfo, resData.path).then((spriteFrame) => {
    //                     atlas.spriteFrames[iconPath] = spriteFrame;
    //                     richText.imageAtlas = atlas;
    //                     count++;
    //                     if (count >= len) {
    //                         resolve(true);
    //                     }
    //                 })
    //             }
    //         })
    //     })
    // }
    
    /**
     * 使用正则表达式忽略大小写检查主字符串是否包含指定模式字符串
     * @param text 主字符串
     * @param pattern 要匹配的模式字符串
     * @returns 若包含则返回 true，否则返回 false
     */
    public static simpleRegexMatch(text: string, pattern: string): boolean {
        // 'i' 标志表示忽略大小写
        const regex = new RegExp(pattern, 'i');
        return regex.test(text);
    }

    //获取图片后缀的方法
    public static getImageSuffix(url: string): string {
        //暂时是测试了png 和jpg 其他几种之后再测试
        let extension = url.split('/').pop(); // 获取最后一个点之后的部分，即扩展名
        if(extension) {
            extension = extension.toLowerCase();
        }
        let imgSuffixList = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']; // 常见图片格式后缀
        for (let i = 0; i < imgSuffixList.length; i++) {
            const suffix = imgSuffixList[i];
            if (extension.includes(suffix)) { // 检查是否以该后缀结尾
                return suffix; // 返回后缀
            }
        }
        return null; // 如果没有找到匹配的后缀，返回 null;
    }
    //判断路径是网络资源还是本地资源
    public static isNetPath(path: string): boolean {
        // 正则表达式匹配常见的网络资源路径格式
        const regex = /^(http|https|ftp):\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?!%&=]*)?$/i;
        return regex.test(path); // 返回匹配结果 
    }


    public static validEmail(email: string): boolean {
        // 正则表达式匹配常见的邮箱格式
        const regex = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        return regex.test(email); // 返回匹配结果
    }
}
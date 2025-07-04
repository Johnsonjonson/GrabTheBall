/**
 * 
 * @FileName: Utility.ts
 * @ClassName: Utility
 * @Author: yafang
 * @CreateDate: Wed Aug 14 2024 16:05:52 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Utility/Utility.ts
 * @Description: 
 *      工具类
 */

import { UITransform } from "cc";
import { Vec3 } from "cc";
import { Node } from "cc";
import { sys } from "cc";
import { GameEntry } from "../../GameMain/Base/GameEntry";
import { Language } from '../Localization/Language';
import { Log } from "../Log/Logger";
import { DEBUG } from "cc/env";

export class Utility {

    constructor() {

    }

    public static isDemo(): boolean {
        return DEBUG;
    }

    public static isNative(): boolean {
        if(sys.isNative) {
            return true;
        }
        return false;
    }

    /**
     * 当前环境是ios系统的web端
     */
    public static isIosWeb(): boolean {
        if(sys.isNative) {
            Log.d("Utility.isIosWeb: ", false);
            return false;
        }

        const os = sys.os.toString();
        let isIos = (os.includes(sys.OS.IOS) || os.includes(sys.OS.OSX));
        Log.d("Utility.isIosWeb: ", isIos);
        return isIos;
    }

    public static getDistanceX(node1:Node, node2: Node): number {
        let worldPos1 = node1.parent.getComponent(UITransform).convertToWorldSpaceAR(node1.position);
        let worldPos2 = node2.parent.getComponent(UITransform).convertToWorldSpaceAR(node2.position);

        return Math.abs(worldPos1.x - worldPos2.x);
    }

    public static getLanguageMark(language: Language): string {
        switch(language) {
            case Language.English:
                return "en";
            case Language.Chinese:
                return "zh";
            case Language.TW:
                return "th";
            case Language.TH:
                return "tl"; 
            case Language.ID:
                return "id"; // 印尼
            case Language.VN:
                return "vn";  // 越南
            case Language.IT:
                return "it";   // 意大利T
            case Language.ES:
                return "sp";  // 西班牙
            case Language.PT:
                return "pt";  // 葡萄牙
            case Language.AR:
                return "ar";  // 阿拉伯
            case Language.FR:
                return "fr";  // 法语
            case Language.DE:
                return "de";  // 德语
            case Language.JP:
                return "jp";  // 日本
            case Language.RU:
                return "ru";  // 俄语
            case Language.TR:
                return "tr";  // 土耳其
            case Language.PL:
                return "pl";  // 波兰
        }

        return "en";
    }

    public static getSysLanguage(): Language {
        let lan = Language.English;
        switch(sys.language) {
            case "en":
                lan = Language.English;
                break;
            case "zh":
                lan = Language.Chinese;
                break;
            case "fr":
                lan = Language.FR;
                break;
            case "it":
                lan = Language.IT;
                break;
            case "de":
                lan = Language.DE;
                break;
            case "es":
                lan = Language.ES;
                break;
            case "pt":
                lan = Language.PT;
                break;
            case "ru":
                lan = Language.RU;
                break;
            case "ar":
                lan = Language.AR;
                break;
            case "pl":
                lan = Language.PL;
                break;
            case "tr":
                lan = Language.TR;
                break;

        }
        Log.d("Utility.getSysLanguage : sys - ", sys.language, ", lan - ", lan);
        return lan;
    }

    public static hasUserInteractedWeb(): boolean{
        if(sys.isNative) {
            return true;
        }
        // 在Index.ts中定义了
        if(window.hasUserInteracted) {
            return true
        }

        return false;

    }

}

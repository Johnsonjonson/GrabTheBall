/**
 * 
 * @FileName: LocalizationManager.ts
 * @ClassName: LocalizationManager
 * @Author: yafang
 * @CreateDate: Tue Jun 25 2024 11:08:16 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Localization/LocalizationManager.ts
 * @Description: 多语言本地化管理器
 *      使用i18n进行多语言管理
 */

import { sys } from "cc";
import { Language } from "./Language";
import { Log } from "../Log/Logger";
import * as i18n from "../../../../extensions/i18n/assets/LanguageData";
import { StringUtility } from "../Utility/StringUtility";
import { director } from "cc";
import { Utility } from "../Utility/Utility";


export class LocalizationManager {

    public readonly localizationRegExp = /\/i18n_[a-zA-Z0-9]+?\//;

    /**
     * 当前显示语言
     */
    private m_language: Language = Language.Unspecified;
    get language(): Language {
        return this.m_language;
    }

    /**
     * 设置当前语言
     */
    set language(value: Language) {
        if(!value) {
            Log.w("value is not a Language.");
            return;
        }

        if(value == Language.Unspecified) {
            Log.e("Language is invalid.");
            // 默认英语
            value = Language.English;
        }

        if(value == this.m_language) {
            return;
        }

        this.m_language = value;
        let languageMark = Utility.getLanguageMark(value);
        i18n.init(languageMark);
        this.updateSceneRenderers();
    }

    /**
     * 获取系统语言（sys.languageCode）
     */
    get sysLanguage(): string {
        return sys.languageCode;
    }

    constructor(language: Language) {
        this.m_language = language;
    }

    /**
     * 获取本地化文本
     * @param key 
     * @returns 
     */
    public getString(key: string,): string {
        if(StringUtility.isEmpty(key)) {
            Log.e(`key is invalid.`);
            return "";
        }
        
        let content = i18n.t(key);
        if(StringUtility.isEmpty(content)) {
            Log.e(`Localization value is invalid. Key is ${key}`);
            return key;
        }

       return content;
    }

    /**
     * 获取本地化资源路径
     * @param assetPath 资源路径（bundle@aaaaa/i18n_en/bbbbbb）
     */
    public getAsset(assetFullPath: string) {
        if(StringUtility.isEmpty(assetFullPath)) {
            Log.e("assetFullPath is ivalid.");
            return "";
        }

        let repValue = `/i18n_${this.language}/`;
        return assetFullPath.replace(this.localizationRegExp, repValue);
    }

    /**
     * 通知当前场景下所有节点，语言已切换
     */
    public updateSceneRenderers() {
        const rootNodes = director.getScene()!.children;
        const allHelpers: any[] = [];
        for (let i = 0; i < rootNodes.length; ++i) {
            let helpers = rootNodes[i].getComponentsInChildren('LocalizationHelper');
            Array.prototype.push.apply(allHelpers, helpers);
        }
        for (let i = 0; i < allHelpers.length; ++i) {
            let helper = allHelpers[i];
            if(!helper.node.active)
                continue;
            helper.onLanguageUpdate();
        }
    }
}

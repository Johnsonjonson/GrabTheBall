/**
 * 
 * @FileName: CsvUtility.ts
 * @ClassName: CsvUtility
 * @Author: yafang
 * @CreateDate: Fri Oct 18 2024 15:02:34 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Utility/CsvUtility.ts
 * @Description: 
 * 
 */

import { cvsParse } from "../Librarys/cvsLib";
import { Log } from "../Log/Logger";

export interface CvsParseHandler {
    complete(results, file); // 解析成功后回调
    error(error);            // 异常回调
    fastMode?: boolean;       // 是否快速模式，如果内容不带”引号“时才有效
    preview?: number;         // 如果 > 0, 则只解析priview行数据
    comments?: string;        // 注释标识符，遇到此字符串开头的将跳过
    header?: boolean;         // 如果为空或false，则每行返回为数组，如果为true，则返回
}

export class CsvUtility {
    /**
     * 表示注释的字符
     */
    public static COMMENT_CODE = "#"

    /**
     * 解析cvs数据（字符串）
     * @param csvData 字符串格式的cvs数据 
     * @param config 参数配置
     */
    public static parseString(csvData: string, config: CvsParseHandler) {
        cvsParse(csvData, config);
    }

    /**
     * 解析cvs数据（文件），用于web版解析远程文件
     * @param csvFile csv文件地址
     * @param config 参数配置
     */
    public static parseFile(csvFile: string, config: CvsParseHandler) {
        Log.w("待实现")
    }

}

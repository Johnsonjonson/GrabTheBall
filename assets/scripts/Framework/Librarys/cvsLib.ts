/**
 * 
 * @FileName: cvsLib.ts
 * @ClassName: CvsLib
 * @Author: yafang
 * @CreateDate: Fri Oct 18 2024 16:01:01 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Library/cvsLib.ts
 * @Description: 
 *      cvs解析器，api文档地址：https://www.papaparse.com/docs#config
 * 
 */

import cvsLib from './papaparse.js'

export function cvsParse(content: string, config: any) {
    cvsLib.parse(content, config);
}

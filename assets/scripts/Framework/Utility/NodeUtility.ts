/**
 * 
 * @FileName: NodeUtility.ts
 * @ClassName: NodeUtility
 * @Author: yafang
 * @CreateDate: Fri Sep 13 2024 16:35:21 GMT+0800 (中国标准时间)
 * @FilePath: db://assets/Framework/Utility/NodeUtility.ts
 * @Description: 节点工具类
 *      封装和节点相关的工具函数：
 *      
 * 
 */

import { UITransform } from "cc";
import { Mat4 } from "cc";
import { Rect } from "cc";
import { Node } from "cc";

export class NodeUtility {

    /**
     * 获取节点在世界坐标范围内的包围盒，不受子节点影响。
     * getBoundingBoxToWorld：会受子节点影响
     * @param node 
     */
    public static getBoundingBoxToWorldWithoutChild(node: Node) : Rect {
        let worldRect = new Rect();
        if(node == null) {
            return worldRect;
        }

        let lrect = node.getComponent(UITransform).getBoundingBox();
        let worldMatrix = new Mat4();
        node.parent.getWorldMatrix(worldMatrix);
        
        worldRect = lrect.transformMat4(worldMatrix);

        return worldRect;
    }

    /**
     * 注意性能，如果节点层级比较深，会有性能问题
     * 根据节点名称，从UI树中查找子节点
     * @param rootNode 根节点
     * @param name 需要查找的子节点名称
     * @returns 
     */
    public static findChildByName(rootNode: Node, name: string) : Node {
        if(rootNode == null) {
            return null;
        }

        if(name == null || name.trim() == "") {
            return null;
        }

         // 如果目标节点本身名称匹配，直接返回（若需要排除自身，可添加条件判断）
        if (rootNode.name === name) {
            return rootNode;
        }

        // 遍历直接子节点
        for (const child of rootNode.children) {
            // 递归查找子节点的子孙
            const result = this.findChildByName(child, name);
            if (result) {
                return result;
            }
        }


        return null;
    }
}

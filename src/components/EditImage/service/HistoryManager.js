// 操作历史记录
import {
  ActionTypeEnum,
  LineWidthEnum,
  NodeTypeEnum,
  TextSizeToFontEnum,
} from '@components/EditImage/service/constants'

export default class HistoryManager {
  constructor(canvasEditor) {
    this.historyStack = []
    this.canvasEditor = canvasEditor
  }

  addHistory(params) {
    const { type, object, previousData } = params
    this.historyStack.push({
      type, object, previousData,
    })
  }
  // 清空历史记录
  clear() {
    this.historyStack = []
  }
  // true: 历史记录为空
  isEmpty() {
    return this.historyStack.length === 0
  }
  // 颜色回撤
  handleModifyColor(lastAction) {
    const preColor = lastAction.previousData.drawColor
    const targetObj = lastAction.object
    if (!targetObj) return
    switch (targetObj.drawType) {
      // 根据类型进一步处理
      case NodeTypeEnum.ARROW:
        targetObj.set('stroke', preColor)
        targetObj.set('fill', preColor)
        break
      case NodeTypeEnum.ELLIPSE:
      case NodeTypeEnum.RECTANGLE:
      case NodeTypeEnum.PEN:
        targetObj.set('stroke', preColor)
        break
      case NodeTypeEnum.TEXT:
        targetObj.set('borderColor', preColor)
        targetObj.set('fill', preColor)
        break
      default:
        break
    }
    targetObj.set('drawColor', preColor)
    this.canvasEditor.renderAll()
  }
  handleModifySize(lastAction) {
    const currentSizeStr = lastAction.previousData.currentSizeStr
    const targetObj = lastAction.object
    if (!targetObj) return
    switch (targetObj.drawType) {
      case NodeTypeEnum.ARROW:
      case NodeTypeEnum.ELLIPSE:
      case NodeTypeEnum.RECTANGLE:
      case NodeTypeEnum.PEN:
        targetObj.set('strokeWidth',  LineWidthEnum[currentSizeStr])
        break
      case NodeTypeEnum.TEXT:
        targetObj.set('fontSize', TextSizeToFontEnum[currentSizeStr])
        break
      default:
        break
    }
    targetObj.set('currentSizeStr', currentSizeStr)
    this.canvasEditor.renderAll()
  }
  handleModifyPosition(lastAction) {
    const { object, previousData } = lastAction
    object.set(previousData)
    object.setCoords() // 更新元素的边界框,保持其可以被选中
    this.canvasEditor.renderAll()
  }
  undoLastAction() {
    if (this.isEmpty()) {
      return
    }
    const lastAction = this.historyStack.pop()
    switch (lastAction.type) {
      case ActionTypeEnum.ADD:
        this.canvasEditor.remove(lastAction.object)
        break
      case ActionTypeEnum.DELETE:
        // 将删除的元素再加回来
        this.canvasEditor.add(lastAction.object)
        break
      case ActionTypeEnum.MODIFY_COLOR:
        this.handleModifyColor(lastAction)
        break
      case ActionTypeEnum.MODIFY_SIZE:
        this.handleModifySize(lastAction)
        break
      case ActionTypeEnum.MODIFY_POSITION:
        this.handleModifyPosition(lastAction)
        break
      default:
        break
    }
  }
}

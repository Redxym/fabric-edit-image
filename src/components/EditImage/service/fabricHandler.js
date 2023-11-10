import { fabric } from 'fabric'
import { NodeTypeEnum } from '@components/EditImage/service/constants'

/**
 * 绘制箭头
 * @param mouseFrom 起始坐标
 * @param mouseTo 鼠标移动的坐标
 * @param lineWidth 线宽
 * @param color 线条的颜色
 * @returns {*} 绘制元素对象
 */
export function addArrow(params = {}) {
  const { mouseTo = {}, mouseFrom = {}, lineWidth = 2, color } = params
  const { x: left, y: top } = mouseFrom
  const { x: x2, y: y2 } = mouseTo
  const w = x2 - left
  const h = y2 - top
  const sh = Math.cos(Math.PI / 4) * 16
  const sin = h / Math.sqrt(w ** 2 + h ** 2)
  const cos = w / Math.sqrt(w ** 2 + h ** 2)
  const w1 = (16 * sin) / 4
  const h1 = (16 * cos) / 4
  const centerX = sh * cos
  const centerY = sh * sin
  /**
   * centerX,centerY 表示起始点，终点连线与箭头尖端等边三角形交点相对x，y
   * w1 ，h1用于确定四个点
   */
  const path = `M ${left} ${top}
                        L ${x2 - centerX + w1} ${y2 - centerY - h1}
                        L ${x2 - centerX + w1 * 2} ${y2 - centerY - h1 * 2}
                        L ${x2} ${y2}
                        L ${x2 - centerX - w1 * 2} ${y2 - centerY + h1 * 2}
                        L ${x2 - centerX - w1} ${y2 - centerY + h1}
                        Z`
  return new fabric.Path(path, {
    stroke: color,
    fill: color,
    strokeWidth: lineWidth,
  })
}

/**
 * 绘制椭圆
 * @param mouseFrom 起始坐标
 * @param mouseTo 鼠标移动的坐标
 * @param lineWidth 线宽
 * @param color 线条的颜色
 * @returns {*} 绘制元素对象
 */
export function addEllipse(params = {}) {
  const { mouseTo = {}, mouseFrom = {}, lineWidth = 2, color } = params
  // left、top, 确定椭圆左上角的位置。originX/originY:指定椭圆的圆点位置，这里设置为中心点。rx、ry:椭圆的半径
  return new fabric.Ellipse({
    left: (mouseTo.x - mouseFrom.x) / 2 + mouseFrom.x,
    top: (mouseTo.y - mouseFrom.y) / 2 + mouseFrom.y,
    stroke: color,
    fill: 'rgba(255, 255, 255, 0)',
    originX: 'center',
    originY: 'center',
    rx: Math.abs(mouseFrom.x - mouseTo.x) / 2,
    ry: Math.abs(mouseFrom.y - mouseTo.y) / 2,
    strokeWidth: lineWidth,
  })
}

/**
 * 绘制长方形
 * @returns {*}
 */
export function addRect(params = {}) {
  const { mouseTo = {}, mouseFrom = {}, lineWidth = 2, color } = params

  let width = mouseTo.x - mouseFrom.x
  let height = mouseTo.y - mouseFrom.y

  // 根据鼠标移动的方向来确定矩形的起点和尺寸
  const rectLeft = width > 0 ? mouseFrom.x : mouseTo.x
  const rectTop = height > 0 ? mouseFrom.y : mouseTo.y
  width = Math.abs(width)
  height = Math.abs(height)
  return new fabric.Rect({
    left: rectLeft,
    top: rectTop,
    width: width,
    height: height,
    stroke: color,
    strokeWidth: lineWidth,
    fill: 'rgba(255, 255, 255, 0)',
  })
}

// 绘制文本
export function addTextbox(params = {}) {
  const { mouseFrom = {}, color, currentSizeStr, fontSize } = params
  const textbox = new fabric.Textbox('', {
    left: mouseFrom.x,
    top: mouseFrom.y - 10,
    fontSize: fontSize || 14,
    borderColor: color,
    fill: color,
    hasControls: false,
  })
  textbox.set('drawType', NodeTypeEnum.TEXT)
  textbox.set('drawColor', color)
  textbox.set('currentSizeStr', currentSizeStr)
  return textbox
}

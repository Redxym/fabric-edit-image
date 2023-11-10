export const NodeTypeEnum = {
  RECTANGLE: 'RECTANGLE', // 矩形
  ELLIPSE: 'ELLIPSE', // 画圆
  ARROW: 'ARROW', // 箭头
  PEN: 'PEN', // 自由画笔
  TEXT: 'TEXT', // 文字
  FREE: 'FREE', // 自由选择模式
  REVOKE: 'REVOKE', // 回撤模式
}

export const SizeEnum = {
  SMALL: 'small', // 小号
  MEDIUM: 'medium', // 中号
  LARGE: 'large', // 大号
}
// 尺寸对应的线条样式
export const LineWidthEnum = {
  [SizeEnum.SMALL]: 2, // 小号
  [SizeEnum.MEDIUM]: 10, // 中号
  [SizeEnum.LARGE]: 16, // 大号
}
// 尺寸对应的字体样式
export const TextSizeToFontEnum = {
  [SizeEnum.SMALL]: 16, // 小号
  [SizeEnum.MEDIUM]: 24, // 中号
  [SizeEnum.LARGE]: 36, // 大号
}

// 尺寸对应的css样式
export const LineWidthToStyleEnum = {
  [SizeEnum.SMALL]: '10px', // 小号
  [SizeEnum.MEDIUM]: '16px', // 中号
  [SizeEnum.LARGE]: '20px', // 大号
}

// 元素的操作类型
export const ActionTypeEnum = {
  ADD: 'ADD', // 新增
  DELETE: 'DELETE', // 删除
  MODIFY_COLOR: 'MODIFY_COLOR', // 修改颜色
  MODIFY_SIZE: 'MODIFY_SIZE', // 修改笔触宽度
  MODIFY_POSITION: 'MODIFY_POSITION', // 修改位置、旋转、伸缩等
}


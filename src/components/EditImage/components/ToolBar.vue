<template>
  <div class="draw-btn-group">
    <div v-for="item in drawTypeBtns" :key="item.title" :class="{ active: drawType === item.type }" :title="item.title" @click="drawTypeChange(item.type)">
      <i :class="item.iconClass" />
    </div>
    <div title="从文件选择图片上传" @click="uploadImg">
      <i class="draw-icon icon-img" />
    </div>
    <div title="保存" @click="save">
      <i class="draw-icon icon-save" />
    </div>
  </div>
</template>

<script>
import { NodeTypeEnum } from '@components/EditImage/service/constants';

export default {
  name: 'ToolBar',
  props: {
    drawType: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { emit }) {
    const drawTypeBtns = [
      { type: NodeTypeEnum.FREE, title: '自由选择', iconClass: 'draw-icon icon-mouse' },
      { type: NodeTypeEnum.ARROW, title: '画箭头', iconClass: 'draw-icon icon-arrow' },
      { type: NodeTypeEnum.TEXT, title: '文本输入框', iconClass: 'draw-icon icon-text' },
      { type: NodeTypeEnum.ELLIPSE, title: '画圆', iconClass: 'draw-icon icon-circle' },
      { type: NodeTypeEnum.RECTANGLE, title: '画矩形', iconClass: 'draw-icon icon-rect' },
      { type: NodeTypeEnum.PEN, title: '自由绘制', iconClass: 'draw-icon icon-pen' },
      { type: NodeTypeEnum.REVOKE, title: '撤销', iconClass: 'draw-icon icon-revoke' },
    ];

    const drawTypeChange = (type) => {
      emit('changeDrawType', type);
    };

    const save = () => {
      emit('save');
    };

    const uploadImg = () => {
      emit('uploadImg');
    };

    return {
      drawTypeBtns,
      drawTypeChange,
      save,
      uploadImg,
    };
  },
};
</script>

<style scoped lang="scss">
@import "./toolBar.scss";
</style>

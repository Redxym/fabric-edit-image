<template>
  <div class="color-list">
    <span
      v-for="item in colorList"
      :key="item"
      class="color-item"
      :style="{
        backgroundColor: item
      }"
      @click="handleClick(item)"
    >
      <i v-if="isCurrentColor(item)" class="el-icon-check" />
    </span>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'ColorTool',
  props: {
    currentColor: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const colorList = ['#EA3F26', '#F7C846', '#89E946', '#436CEB', '#000000', '#90949D', '#FFFFFF'];
    const currentColorVal = ref(props.currentColor);

    const handleClick = (item) => {
      currentColorVal.value = item;
    };

    const isCurrentColor = (item) => {
      return currentColorVal.value.toUpperCase() === item.toUpperCase();
    };

    // Watch for changes in currentColor prop and update currentColorVal accordingly
    watch(() => props.currentColor, (newVal) => {
      currentColorVal.value = newVal;
    });

    // Emit the updated currentColor value when currentColorVal changes
    watch(currentColorVal, (newVal) => {
      emit('update:currentColor', newVal);
    });

    return {
      colorList,
      currentColorVal,
      handleClick,
      isCurrentColor,
    };
  },
};
</script>

<style scoped lang="scss">
.color-list {
  .color-item {
    display: inline-block;
    margin-left: 6px;
    height: 20px;
    width: 20px;
    font-size: 12px;
    line-height: 20px;
    vertical-align: middle;
    cursor: pointer;
    i {
      font-size: 19px;
      color: #fff;
    }
    &:last-child {
      border: 1px solid #000;
      i {
        color: #000;
      }
    }
  }
}
</style>

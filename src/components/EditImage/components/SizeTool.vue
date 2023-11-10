<template>
  <div class="size-list">
    <span
      v-for="item in sizeList"
      :key="item"
      class="size-item"
      :style="{
        width: `${lineWidthToStyleEnum[item]}`,
        height: `${lineWidthToStyleEnum[item]}`,
        backgroundColor: currentSizeVal === item ? '#436CEB' : '#90949D',
      }"
      @click="handleClick(item)"
    ></span>
  </div>
</template>

<script>
import { ref } from 'vue';
import { SizeEnum, LineWidthToStyleEnum } from '@components/EditImage/service/constants';

export default {
  name: 'SizeTool',
  props: {
    currentSize: {
      type: String,
      default: SizeEnum.SMALL,
    },
  },
  setup(props, { emit }) {
    const sizeList = ref([SizeEnum.SMALL, SizeEnum.MEDIUM, SizeEnum.LARGE]);
    const currentSizeVal = ref(props.currentSize);
    const lineWidthToStyleEnum = LineWidthToStyleEnum;

    const handleClick = (item) => {
      currentSizeVal.value = item;
      emit('update:currentSize', item);
    };

    return {
      sizeList,
      currentSizeVal,
      lineWidthToStyleEnum,
      handleClick,
    };
  },
};
</script>

<style scoped lang="scss">
.size-list {
  .size-item {
    display: inline-block;
    margin-left: 6px;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background-color: #90949D;
    line-height: 20px;
    vertical-align: middle;
    cursor: pointer;
  }
}
</style>

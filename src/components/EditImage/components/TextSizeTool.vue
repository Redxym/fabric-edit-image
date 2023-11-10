<template>
  <div class="size-list">
    <el-select v-model="currentSizeVal" size="small" @change="handleClick">
      <el-option v-for="item in sizeList" :key="item.value" :value="item.value" :label="item.label" />
    </el-select>
  </div>
</template>

<script>
import { SizeEnum } from '@components/EditImage/service/constants';
import { ref } from 'vue';

export default {
  name: 'TextSizeTool',
  props: {
    currentSize: {
      type: String,
      default: SizeEnum.SMALL,
    },
  },
  setup(props, { emit }) {
    const sizeList = [
      { label: '小', value: SizeEnum.SMALL },
      { label: '中', value: SizeEnum.MEDIUM },
      { label: '大', value: SizeEnum.LARGE },
    ];
    const currentSizeVal = ref(props.currentSize);

    const handleClick = () => {
      emit('update:currentSize', currentSizeVal.value);
    };

    return {
      sizeList,
      currentSizeVal,
      handleClick,
    };
  },
};
</script>

<style scoped lang="scss">
.size-list {
  ::v-deep(.el-select) {
    width: 90px;
    .el-input__inner {
      height: 24px;
      line-height: 24px;
    }
  }
}
</style>

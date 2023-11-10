<template>
  <div class="size-color-tool">
    <TextSizeTool v-if="isText" v-model:current-size="curSize" />
    <SizeTool v-else v-model:current-size="curSize" />
    <ColorTool v-model:current-color="curColor" />
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import SizeTool from '@components/EditImage/components/SizeTool.vue';
import ColorTool from '@components/EditImage/components/ColorTool.vue';
import TextSizeTool from '@components/EditImage/components/TextSizeTool.vue';
import { NodeTypeEnum, SizeEnum } from '@components/EditImage/service/constants';

export default {
  name: 'SizeAndColorTool',
  components: { TextSizeTool, ColorTool, SizeTool },
  props: {
    currentSize: {
      type: String,
      default: SizeEnum.SMALL,
    },
    currentColor: {
      type: String,
      default: '',
    },
    currentNodeType: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const curColor = ref(props.currentColor);
    const curSize = ref(props.currentSize);

    const isText = computed(() => {
      return props.currentNodeType === NodeTypeEnum.TEXT;
    });

    watch(curColor, (newVal) => {
      emit('update:currentColor', newVal);
    });

    watch(curSize, (newVal) => {
      emit('update:currentSize', newVal);
    });

    return {
      curColor,
      curSize,
      isText,
    };
  },
};
</script>

<style scoped lang="scss">
.size-color-tool {
  display: flex;
}
</style>

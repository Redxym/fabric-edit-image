<template>
  <div class="edit-pic-container">
    <div class="edit-wrap">
      <canvas id="canvasId" ref="canvas" />
      <ToolBar
        :drawType="drawType"
        @changeDrawType="drawTypeChange"
        @uploadImg="uploadImg"
        @save="save"
      />
      <SizeAndColorTool
        v-show="showSizeColorTool"
        v-model:currentColor="color"
        v-model:currentSize="currentSizeStr"
        :currentNodeType="currentNodeType"
      />
    </div>
    <input id="imgInput" ref="imgInput" type="file" accept="image/*" @change="uploadImgChange">
    <img id="img" :src="imgSrc">
  </div>
</template>
<script>
import ToolBar from '@components/EditImage/components/ToolBar.vue';
import SizeAndColorTool from '@components/EditImage/components/SizeAndColorTool.vue';
import {ref, computed, watch, onMounted} from 'vue';
import {
  ActionTypeEnum,
  LineWidthEnum,
  NodeTypeEnum,
  SizeEnum,
  TextSizeToFontEnum
} from '@components/EditImage/service/constants';
import {fabric} from 'fabric';
import HistoryManager from '@components/EditImage/service/HistoryManager';
import {downloadByUrl} from '@components/EditImage/service/utils';
import {addArrow, addEllipse, addRect, addTextbox} from '@components/EditImage/service/fabricHandler';
export default {
  name: 'EditImage',
  components: { ToolBar, SizeAndColorTool },
  props: {
    // 画布初始传入的图片路径
    fileSrc: {
      type: String,
      default: '',
    },
    width: {
      type: Number,
      default: 640,
    },
    height: {
      type: Number,
      default: 480,
    },
  },
  setup(props) {
    const canvas = ref(null);
    const canvasEditor = ref({});

    const mouseFrom = ref({ x: 0, y: 0 });// 鼠标按下的位置
    const mouseTo = ref({ x: 0, y: 0 });// 鼠标松开的位置

    const drawType = ref(null); // 当前绘制图像的种类
    const color = ref('#EA3F26'); // 画笔颜色
    const drawingObject = ref(null); // 当前绘制对象
    const moveCount = ref(1); // 绘制移动计数器
    const doDrawing = ref(false); // 绘制状态

    // 上传图片，加载到的图片对象
    const imgFile = ref({});
    const imgSrc = ref('');
    const imgInput = ref();

    const currentSelectedObject = ref(null); // 当前选中的元素类型
    const currentSizeStr = ref(SizeEnum.SMALL); // 当前选中的尺寸，笔触宽度
    // 历史记录管理
    let historyManager = null;
    // 记录对象改变前的数据
    const previousData = ref({});

    // 当前尺寸对应的线条实际值
    const currentLineWidth = computed(() => {
      return LineWidthEnum[currentSizeStr.value];
    });

    // 当前尺寸对应的文字font实际值
    const currentTextSize = computed(() => {
      return TextSizeToFontEnum[currentSizeStr.value];
    });

    // true: 自由选择模式
    const drawTypeIsFree = computed(() => {
      return drawType.value === NodeTypeEnum.FREE;
    });

    const freeOrRevoke = computed(() => {
      return [NodeTypeEnum.FREE, NodeTypeEnum.REVOKE].includes(drawType.value);
    });

    // 当前模式、选中元素的 图案类型
    const currentNodeType = computed(() => {
      if (drawTypeIsFree.value) {
        return currentSelectedObject.value?.drawType;
      } else {
        return drawType.value;
      }
    });

    // 显示颜色工具栏：1、非自由选择状态或者撤销状态。2、自由选择状态、但有选中的元素
    const showSizeColorTool = computed(() => {
      return !freeOrRevoke.value || (drawTypeIsFree.value && currentSelectedObject.value);
    });

    // 控制画布上的对象是否可以被选中， true可以选中;drawType为自由选择的时候可以选中
    watch(drawType, () => {
      canvasEditor.value.selection = freeOrRevoke.value;
    });

    // 设置绘制笔刷的颜色
    watch(color, () => {
      if (canvasEditor.value?.freeDrawingBrush?.color) {
        setFreeDrawingBrush('color', color.value);
      }
      if (freeOrRevoke.value && currentSelectedObject.value) {
        // 自由选择模式，更换颜色，改变选中对象的颜色
        changeSelectColor();
      }
    });

    // 设置绘制笔刷的线条宽度
    watch(currentSizeStr, () => {
      if (canvasEditor.value?.freeDrawingBrush?.width) {
        setFreeDrawingBrush('width', currentLineWidth.value);
      }
      if (freeOrRevoke.value && currentSelectedObject.value) {
        // 自由选择时，更换尺寸，改变选中对象的尺寸
        changeSelectSize();
      }
    });

    // 从文件加载图片至canvas
    watch(imgSrc, (newVal) => {
      if (newVal) {
        imageAddToCanvas(newVal);
      }
    }, { immediate: true });

    const initCanvas = () => {
      canvasEditor.value = new fabric.Canvas('canvasId', {
        width: props.width,
        height: props.height,
      });

      fabric.Object.prototype.set({
        cornerStyle: 'circle',
        transparentCorners: false,
        cornerSize: 10,
      });

      canvasEditor.value.selectionColor = 'rgba(0,0,0,0.05)';

      canvasEditor.value.on('mouse:down', mousedown);
      canvasEditor.value.on('mouse:move', mousemove);
      canvasEditor.value.on('mouse:up', mouseup);
      canvasEditor.value.on('selection:created', selectionCreated);
      canvasEditor.value.on('selection:updated', selectionCreated);
      canvasEditor.value.on('selection:cleared', () => {
        currentSelectedObject.value = null;
      });
      canvasEditor.value.on('object:modified', objectModified);

      document.addEventListener('keydown', handleDeleteKey);

      canvas.value = document.querySelector('#canvasId');
      canvasEditor.value.stateful = true;

      initHistory();
    };

    onMounted(() => {
      initCanvas()
    })

    const initHistory = () => {
      historyManager = new HistoryManager(canvasEditor.value);
    };

    // eslint-disable-next-line no-unused-vars
    const getPicData = () => {
      clearActiveStatus();
      return new Promise((resolve, reject) => {
        canvas.value.toBlob(resolve);
      }).catch((e) => {
        console.log(e);
      });
    };

    const save = () => {
      clearActiveStatus()
      const canvasEditor = canvas.value
      let imgData = canvasEditor.toDataURL('image/jpeg')
      imgData = imgData.replace('image/jpeg', 'image/octet-stream')
      const filename = 'pic_' + (new Date()).getTime() + '.jpg'
      downloadByUrl(imgData, filename)
    }

    const uploadImg = () => {
      imgInput.value.click()
    }
    const uploadImgChange = () => {
      const eleImportInput = imgInput.value
      const imgFile = eleImportInput.files[0]
      if (!imgFile) {
        return
      }
      if (!/\.(jpe?g|png|gif)$/i.test(imgFile.name)) {
        return
      }
      loadImageFromFile(imgFile)
    }

    const loadImageFromFile = (file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        imgSrc.value = event.target.result
        resetCanvas()
        imageAddToCanvas(event.target.result)
      }
      reader.readAsDataURL(file)
    }

    const imageAddToCanvas = (imgSrc) => {
      if (!canvasEditor.value) { return }
      let imgElement = new Image()
      imgElement.crossOrigin = 'anonymous'
      imgElement.src = imgSrc
      imgElement.onload = () => {
        canvasEditor.value.setHeight(imgElement.height)
        canvasEditor.value.setWidth(imgElement.width)
        canvasEditor.value.calcOffset()
        const imgInstance = new fabric.Image(imgElement, {
          zIndex: -1,
          selectable: false,
        })
        canvasEditor.value.add(imgInstance)
        imgElement = null
      }
    }

    const pathCreated = (el) => {
      const path = el.path
      path.set({ stroke: color.value, drawType: drawType.value, drawColor: color.value, currentSizeStr: currentSizeStr.value })
      historyManager.addHistory({ type: ActionTypeEnum.ADD, object: path })
    }
    const setFreeDrawingBrush = (key, value) => {
      canvasEditor.value.freeDrawingBrush[key] = value
    }

    const drawTypeChange = (e) => {
      drawType.value = e
      canvasEditor.value.skipTargetFind = !drawTypeIsFree.value
      if (e === NodeTypeEnum.PEN) {
        canvasEditor.value.isDrawingMode = true
        setFreeDrawingBrush('color', color.value)
        setFreeDrawingBrush('width', currentLineWidth.value)
        canvasEditor.value.on('path:created', pathCreated)
      } else {
        canvasEditor.value.isDrawingMode = false
        canvasEditor.value.off('path:created', pathCreated)
      }
      if (drawType.value === NodeTypeEnum.REVOKE) {
        historyManager.undoLastAction()
      }
    }

    const mousedown = (e) => {
      const xy = e.pointer || transformMouse(e.e.offsetX, e.e.offsetY)
      mouseFrom.value.x = xy.x
      mouseFrom.value.y = xy.y
      doDrawing.value = true
      if (drawType.value === NodeTypeEnum.TEXT) {
        drawing()
      }
      if (e?.target) {
        previousData.value = Object.assign({}, e.target.toObject())
      }
    }

    const mouseup = (e) => {
      if (drawingObject.value) {
        historyManager.addHistory({ type: ActionTypeEnum.ADD, object: drawingObject.value })
      }
      const xy = e.pointer || transformMouse(e.e.offsetX, e.e.offsetY)
      mouseTo.value.x = xy.x
      mouseTo.value.y = xy.y
      drawingObject.value = null
      moveCount.value = 1
      doDrawing.value = false
    }

    const mousemove = (e) => {
      if (moveCount.value % 2 && !doDrawing.value) {
        return
      }
      moveCount.value++
      const xy = e.pointer || transformMouse(e.e.offsetX, e.e.offsetY)
      mouseTo.value.x = xy.x
      mouseTo.value.y = xy.y
      if (drawType.value !== NodeTypeEnum.TEXT) {
        drawing(e)
      }
    }
    const clearActiveStatus = () => {
      canvasEditor.value.discardActiveObject();
      canvasEditor.value.renderAll();
    };

    const handleDeleteKey = (e) => {
      if ([8, 46].includes(e.keyCode)) {
        const activeObjects = canvasEditor.value?.getActiveObjects();
        if (!activeObjects) {
          return;
        }

        for (const item of activeObjects) {
          if (item?.drawType === NodeTypeEnum.TEXT && item?.isEditing) {
            continue;
          }
          canvasEditor.value.remove(item);
          canvasEditor.value.discardActiveObject();
          // 删除操作入历史记录栈
          historyManager.addHistory({ type: ActionTypeEnum.DELETE, object: item });
          break;
        }
      }
      // 按ctrl+z, 执行撤销操作
      if (e.ctrlKey && e.code === 'KeyZ') {
        historyManager.undoLastAction();
      }
    };

    const transformMouse = (mouseX, mouseY) => {
      return { x: mouseX / 1, y: mouseY / 1 };
    };

    const addText = () => {
      const textbox = addTextbox({
        mouseFrom: mouseFrom.value,
        color: color.value,
        currentSizeStr: currentSizeStr.value,
        fontSize: currentTextSize.value,
      });
      canvasEditor.value.add(textbox);
      // 文字框自动获取焦点，进入编辑模式
      textbox.enterEditing();
      textbox.hiddenTextarea.focus();
      textbox.isEditing = true;
      // 在进入编辑模式后，使用 setActiveObject 方法来选择对象
      canvasEditor.value.setActiveObject(textbox);
      drawTypeChange(NodeTypeEnum.FREE);
      // 新建文本框操作如历史记录栈
      historyManager.addHistory({ type: ActionTypeEnum.ADD, object: textbox });
    };
    const drawing = () => {
      if (drawingObject.value) {
        canvasEditor.value.remove(drawingObject.value);
      }
      let canvasObject = null;
      const params = {
        mouseFrom: mouseFrom.value,
        mouseTo: mouseTo.value,
        color: color.value,
        lineWidth: currentLineWidth.value,
      };
      switch (drawType.value) {
        case NodeTypeEnum.ARROW: // 箭头
          canvasObject = addArrow(params);
          break;
        case NodeTypeEnum.ELLIPSE: // 画圆
          canvasObject = addEllipse(params);
          break;
        case NodeTypeEnum.RECTANGLE: // 长方形
          canvasObject = addRect(params);
          break;
        case NodeTypeEnum.TEXT: // 文本框
          addText();
          break;
        default:
          break;
      }
      if (canvasObject) {
        canvasObject.set('drawType', drawType.value);
        canvasObject.set('drawColor', color.value);
        canvasObject.set('currentSizeStr', currentSizeStr.value);
        canvasEditor.value.add(canvasObject);
        drawingObject.value = canvasObject;
      }
    };

    const resetCanvas = () => {
      historyManager?.clear();
      previousData.value = {};
      canvasEditor.value?.clear();
    };

    const objectModified = (e) => {
      historyManager.addHistory({
        type: ActionTypeEnum.MODIFY_POSITION,
        object: e.target,
        previousData: previousData.value,
      });
    };

    const selectionCreated = (e) => {
      const selectedObject = e.selected?.[0];
      if (!selectedObject) {
        return;
      }
      currentSelectedObject.value = selectedObject;
      const drawColor = selectedObject.drawColor;
      const selectSize = selectedObject.currentSizeStr;
      color.value = drawColor;
      currentSizeStr.value = selectSize;
    };

    const changeSelectSize = () => {
      if (!currentSelectedObject.value) {
        return;
      }
      const oldSize = currentSelectedObject.value.currentSizeStr;
      if (oldSize !== currentSizeStr.value) {
        historyManager.addHistory({
          type: ActionTypeEnum.MODIFY_SIZE,
          object: currentSelectedObject.value,
          previousData: { currentSizeStr: oldSize },
        });
      }
      currentSelectedObject.value.set('currentSizeStr', currentSizeStr.value);
      switch (currentSelectedObject.value.drawType) {
        case NodeTypeEnum.ARROW:
        case NodeTypeEnum.ELLIPSE:
        case NodeTypeEnum.RECTANGLE:
        case NodeTypeEnum.PEN:
          currentSelectedObject.value.set('strokeWidth', currentLineWidth.value);
          break;
        case NodeTypeEnum.TEXT:
          currentSelectedObject.value.set('fontSize', currentTextSize.value);
          break;
        default:
          break;
      }
      canvasEditor.value.renderAll();
    };

    const changeSelectColor = () => {
      if (!currentSelectedObject.value) {
        return;
      }
      const drawColor = currentSelectedObject.value.drawColor;
      if (drawColor !== color.value) {
        historyManager.addHistory({
          type: ActionTypeEnum.MODIFY_COLOR,
          object: currentSelectedObject.value,
          previousData: { drawColor },
        });
      }
      currentSelectedObject.value.set('drawColor', color.value);
      switch (currentSelectedObject.value.drawType) {
        case NodeTypeEnum.ARROW:
          currentSelectedObject.value.set('stroke', color.value);
          currentSelectedObject.value.set('fill', color.value);
          break;
        case NodeTypeEnum.ELLIPSE:
        case NodeTypeEnum.RECTANGLE:
        case NodeTypeEnum.PEN:
          currentSelectedObject.value.set('stroke', color.value);
          break;
        case NodeTypeEnum.TEXT:
          currentSelectedObject.value.set('borderColor', color.value);
          currentSelectedObject.value.set('fill', color.value);
          break;
        default:
          break;
      }
      canvasEditor.value.renderAll();
    };

    return {
      drawType,
      color,
      imgFile,
      imgSrc,
      currentSizeStr,
      currentNodeType,
      showSizeColorTool,
      imgInput,
      uploadImg,
      save,
      uploadImgChange,
      drawTypeChange,
    };
  },
};
</script>
<style lang="scss" scoped>
.edit-pic-container {
  position: relative;
}
#imgInput, #img {
  display: none;
}
.edit-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}
#canvasId {
  border: 1px dashed black;
  margin-bottom: 6px;
}
</style>


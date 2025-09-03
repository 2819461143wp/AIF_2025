<template>
  <el-card>
    <template #header>
      <span>示例数据集 → 设备能耗优化建议</span>
    </template>

    <!-- 1. 选择数据集 -->
    <el-form :inline="true">
      <el-form-item label="选择示例数据集">
        <el-select
          v-model="selectedKey"
          placeholder="请选择"
          @change="loadData"
          style="width: 260px"
        >
          <el-option v-for="(item, key) in dataSets" :key="key" :label="item.label" :value="key" />
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 2. 数据集预览 -->
    <el-table v-if="rawRows.length" :data="rawRows" style="width: 100%" max-height="300">
      <el-table-column prop="deviceId" label="设备" width="80" />
      <el-table-column prop="faultType" label="故障类型" width="110" />
      <el-table-column prop="faultDesc" label="故障描述" />
      <el-table-column prop="predictTime" label="预测时间" width="160" />
    </el-table>

    <!-- 3. 生成建议按钮（放在数据集下方） -->
    <div v-if="rawRows.length" style="margin-top: 16px">
      <el-button
        type="success"
        :disabled="!rawRows.length || tableData.length > 0"
        @click="generateSuggestion"
      >
        生成建议
      </el-button>
    </div>

    <!-- 4. 带建议的最终列表 -->
    <el-table
      v-if="tableData.length"
      :data="tableData"
      style="width: 100%; margin-top: 16px"
      max-height="400"
    >
      <el-table-column prop="deviceId" label="设备" width="80" />
      <el-table-column prop="faultType" label="故障类型" width="110" />
      <el-table-column prop="faultDesc" label="故障描述" />
      <el-table-column prop="predictTime" label="预测时间" width="160" />
      <el-table-column prop="suggestion" label="能耗优化建议" min-width="220" />
    </el-table>

    <!-- 5. 导出 -->
    <div v-if="tableData.length" style="margin-top: 16px">
      <el-button type="primary" @click="downloadCsv"> 下载带建议的 CSV </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import dayjs from 'dayjs'

interface FaultRow {
  deviceId: string
  faultType: string
  faultDesc: string
  predictTime: string
  suggestion?: string
}

/* ---------- 内置 3 个示例数据集 ---------- */
const dataSets = reactive({
  datasetA: {
    label: 'Dataset_A - 轴承类故障',
    rows: [
      {
        deviceId: 'M01',
        faultType: 'B1',
        faultDesc: '轴承磨损早期',
        predictTime: '2025-06-01 08:00',
      },
      {
        deviceId: 'M02',
        faultType: 'B1',
        faultDesc: '轴承温度偏高 72℃',
        predictTime: '2025-06-01 09:15',
      },
      {
        deviceId: 'M03',
        faultType: 'B1',
        faultDesc: '轴承振动超标',
        predictTime: '2025-06-01 10:30',
      },
    ],
  },
  datasetB: {
    label: 'Dataset_B - 电机类故障',
    rows: [
      {
        deviceId: 'M04',
        faultType: 'B2',
        faultDesc: '电机绕组过热',
        predictTime: '2025-06-01 11:00',
      },
      {
        deviceId: 'M05',
        faultType: 'B2',
        faultDesc: '电机散热风扇停转',
        predictTime: '2025-06-01 12:15',
      },
    ],
  },
  datasetC: {
    label: 'Dataset_C - 冷却与传感类故障',
    rows: [
      { deviceId: 'M06', faultType: 'B3', faultDesc: '皮带松动', predictTime: '2025-06-01 14:00' },
      {
        deviceId: 'M07',
        faultType: 'B4',
        faultDesc: '冷却泵效率下降',
        predictTime: '2025-06-01 15:15',
      },
      {
        deviceId: 'M08',
        faultType: 'B5',
        faultDesc: '传感器漂移',
        predictTime: '2025-06-01 16:30',
      },
    ],
  },
})

/* ---------- 状态 ---------- */
const selectedKey = ref<string | null>(null)
const rawRows = ref<FaultRow[]>([])
const tableData = ref<FaultRow[]>([])

/* ---------- 方法 ---------- */
function loadData(key: string) {
  rawRows.value = dataSets[key].rows
  tableData.value = [] // 清空旧建议
}

function generateSuggestion() {
  tableData.value = rawRows.value.map((r) => ({
    ...r,
    suggestion: genSuggestion(r),
  }))
}

function genSuggestion(row: FaultRow): string {
  switch (row.faultType) {
    case 'B1':
      return '轴承磨损 → 建议提前更换并下调主轴转速 3%，可省电 8 kWh/班次'
    case 'B2':
      return '电机绕组过热 → 立即检查散热风机，温度每降 5 ℃ 约省电 2 kWh'
    case 'B3':
      return '皮带松动 → 张紧后减少打滑，可降空载电流 1.5 A'
    case 'B4':
      return '冷却泵效率低 → 切换备用泵并清洗滤网，预计日省电 12 kWh'
    case 'B5':
      return '传感器漂移 → 校准后避免过度补偿，降低制冷负荷 5%'
    default:
      return `未知故障(${row.faultDesc}) → 请人工评估能耗影响`
  }
}

function downloadCsv() {
  const csv =
    'deviceId,faultType,faultDesc,predictTime,suggestion\n' +
    tableData.value
      .map(
        (r) => `${r.deviceId},${r.faultType},"${r.faultDesc}",${r.predictTime},"${r.suggestion}"`,
      )
      .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `fault_suggestion_${dayjs().format('YYYYMMDDHHmm')}.csv`
  link.click()
}

/* ---------- 向父组件暴露采纳事件 ---------- */
const emit = defineEmits<{
  adopt: [suggestion: string]
}>()

function adopt(text: string) {
  emit('adopt', text)
}
</script>
<style scoped>
/* 统一滚动条样式 */
.scrollbar-table {
  /* 横向滚轮：鼠标滚轮即可左右滑动 */
  overflow-x: auto;
}
.scrollbar-table::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.scrollbar-table::-webkit-scrollbar-track {
  background: #f3f3f3;
}
.scrollbar-table::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
.scrollbar-table::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
<style scoped>
/* 按需微调 */
</style>

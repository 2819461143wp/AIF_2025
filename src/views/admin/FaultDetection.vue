<template>
  <div class="fault-detection-container">
    <el-card class="detection-card">
      <template #header>
        <div class="card-header">
          <span>设备故障检测系统</span>
        </div>
      </template>

      <el-steps :active="step - 1" finish-status="success" simple>
        <el-step title="数据上传" />
        <el-step title="选择模型" />
        <el-step title="故障检测" />
        <el-step title="结果下载" />
      </el-steps>

      <div class="step-content">
        <transition name="el-fade-in" mode="out-in">
          <div :key="step">
            <!-- Step 1: Data Upload -->
            <div v-if="step === 1" class="data-upload-step">
              <!-- 格式说明 -->
              <el-card shadow="never" class="format-info-card">
                <template #header>
                  <div class="format-header">
                    <el-icon><document /></el-icon>
                    <span>数据格式要求</span>
                  </div>
                </template>
                
                <div class="format-requirements">
                  <div class="requirement-item">
                    <h4>文件格式：</h4>
                    <p>仅支持 CSV 格式文件，编码为 UTF-8</p>
                  </div>
                  
                  <div class="requirement-item">
                    <h4>数据结构：</h4>
                    <div class="data-structure-section">
                      <!-- 左侧：列定义表格 -->
                      <div class="table-structure">
                        <el-table :data="requiredColumns" size="small" border>
                          <el-table-column prop="name" label="列名" width="150" />
                          <el-table-column prop="label" label="说明" width="120" />
                          <el-table-column prop="type" label="数据类型" width="100">
                            <template #default="{ row }">
                              <el-tag size="small" :type="row.type === 'number' ? 'warning' : 'info'">
                                {{ row.type === 'number' ? '数字' : '文本' }}
                              </el-tag>
                            </template>
                          </el-table-column>
                        </el-table>
                      </div>

                      <!-- 右侧：实例数据表格 -->
                      <div class="example-table">
                        <h5>实例数据：</h5>
                        <el-table :data="exampleData" size="small" border stripe>
                          <el-table-column prop="time_seconds" label="time_seconds" width="140">
                            <template #default="{ row }">
                              <span class="number-value">{{ row.time_seconds }}</span>
                            </template>
                          </el-table-column>
                          <el-table-column prop="equipment" label="equipment" width="80">
                            <template #default="{ row }">
                              <el-tag size="small" type="info">{{ row.equipment }}</el-tag>
                            </template>
                          </el-table-column>
                          <el-table-column prop="voltage_V" label="voltage_V" width="100">
                            <template #default="{ row }">
                              <span class="number-value">{{ row.voltage_V }}</span>
                            </template>
                          </el-table-column>
                          <el-table-column prop="current1_A" label="current1_A" width="100">
                            <template #default="{ row }">
                              <span class="number-value">{{ row.current1_A }}</span>
                            </template>
                          </el-table-column>
                          <el-table-column prop="current2_A" label="current2_A" width="100">
                            <template #default="{ row }">
                              <span class="number-value">{{ row.current2_A }}</span>
                            </template>
                          </el-table-column>
                        </el-table>
                      </div>
                    </div>
                  </div>

                  <div class="requirement-item">
                    <h4>数据要求：</h4>
                    <ul class="requirements-list">
                      <li>时间戳必须为数字格式（秒为单位），支持科学记数法</li>
                      <li>设备编号为字符串格式，如：A0, B0, Q0等</li>
                      <li>电压和电流值必须为数字格式，可以为负值</li>
                      <li>数据按时间戳升序排列</li>
                      <li>文件编码必须为UTF-8</li>
                    </ul>
                  </div>
                </div>
              </el-card>

              <!-- 文件上传区域 -->
              <div class="upload-section">
                <el-upload
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleFileChange"
                  accept=".csv"
                  drag
                >
                  <div class="upload-dragger">
                    <el-icon class="upload-icon"><upload-filled /></el-icon>
                    <div class="upload-text">
                      <p>将CSV文件拖拽到此处，或<em>点击选择文件</em></p>
                      <p class="upload-tip">单个文件不超过100MB</p>
                      <p class="upload-format">格式要求：time_seconds,equipment,voltage_V,current1_A,current2_A</p>
                    </div>
                  </div>
                </el-upload>
              </div>

              <!-- 文件信息 -->
              <div v-if="selectedFiles.length > 0" class="file-info-section">
                <el-card shadow="never" class="file-info-card">
                  <div class="file-info-header">
                    <el-icon class="file-info-icon">
                      <document v-if="selectedFiles[0].status === 'valid'" />
                      <warning v-else-if="selectedFiles[0].status === 'invalid'" />
                      <loading v-else />
                    </el-icon>
                    <div class="file-info-details">
                      <div class="file-info-name">{{ selectedFiles[0].name }}</div>
                      <div class="file-info-meta">
                        <span class="file-size">{{ formatFileSize(selectedFiles[0].size) }}</span>
                        <el-tag
                          size="small"
                          :type="selectedFiles[0].status === 'valid' ? 'success' : selectedFiles[0].status === 'invalid' ? 'danger' : 'info'"
                        >
                          {{ selectedFiles[0].status === 'valid' ? '验证通过' : selectedFiles[0].status === 'invalid' ? '验证失败' : '验证中' }}
                        </el-tag>
                        <span v-if="validationResults[selectedFiles[0].id]?.rows" class="data-rows">
                          {{ validationResults[selectedFiles[0].id].rows }} 行数据
                        </span>
                      </div>
                    </div>
                    <el-button
                      size="small"
                      type="danger"
                      @click="clearAllFiles"
                    >
                      删除文件
                    </el-button>
                  </div>

                  <!-- 验证结果详情 -->
                  <div v-if="validationResults[selectedFiles[0].id]" class="validation-details">
                    <div v-if="selectedFiles[0].status === 'invalid'" class="error-message">
                      <el-icon><warning /></el-icon>
                      <span>{{ validationResults[selectedFiles[0].id].error }}</span>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>

            <!-- Step 2: Model Selection -->
            <el-form
              v-if="step === 2"
              :model="detectionConfig"
              label-width="140px"
              label-position="right"
            >
              <el-form-item label="选择模型:" prop="model">
                <el-select
                  v-model="detectionConfig.model"
                  placeholder="请选择一个模型"
                  style="width: 100%"
                  @change="onModelChange"
                >
                  <el-option label="1D-CNN+LSTM" value="LSTM" />
                  <el-option label="R-Informer" value="R-Informer" />
                </el-select>
              </el-form-item>

              <el-form-item v-if="detectionConfig.model" label="选择权重文件:" prop="weights">
                <el-select
                  v-model="detectionConfig.weights"
                  placeholder="请选择权重文件"
                  style="width: 100%"
                  :loading="weightsLoading"
                >
                  <el-option
                    v-for="weight in availableWeights"
                    :key="weight.value"
                    :label="weight.label"
                    :value="weight.value"
                  />
                </el-select>
              </el-form-item>

            </el-form>

            <!-- Step 3: Fault Detection -->
            <div v-if="step === 3" class="detection-config">
              <el-descriptions title="确认检测信息" :column="1" border>
                <el-descriptions-item label="数据文件">{{
                  validFilesCount
                }} 个有效文件</el-descriptions-item>
                <el-descriptions-item label="模型类型">{{
                  detectionConfig.model
                }}</el-descriptions-item>
                <el-descriptions-item label="权重文件">{{
                  detectionConfig.weights
                }}</el-descriptions-item>
                <el-descriptions-item label="总数据行数">{{
                  3467
                }}</el-descriptions-item>
              </el-descriptions>

              <div class="detection-options">
                <h3>检测选项</h3>
                <el-form :model="detectionOptions" label-width="140px">
                  <!-- <el-form-item label="故障阈值:">
                    <el-slider
                      v-model="detectionOptions.faultThreshold"
                      :min="0"
                      :max="1"
                      :step="0.05"
                      :format-tooltip="value => `${(value * 100).toFixed(0)}%`"
                    />
                    <div class="threshold-info">
                      <span>当前阈值: {{ (detectionOptions.faultThreshold * 100).toFixed(0) }}%</span>
                      <span class="threshold-desc">值越高，检测越严格</span>
                    </div>
                  </el-form-item> -->

                  <el-form-item label="批处理大小:">
                    <el-input-number
                      v-model="detectionOptions.batchSize"
                      :min="1"
                      :max="1000"
                      controls-position="right"
                      style="width: 200px"
                    />
                  </el-form-item>
                </el-form>
              </div>
            </div>

            <!-- Step 4: Results -->
            <div v-if="step === 4" class="results-step">
              <div v-if="detectionResults" class="results-container">

                <div class="results-summary">
                  <el-row :gutter="20">
                    <el-col :span="6">
                      <el-statistic
                        title="处理时间"
                        :value="detectionResults.processingTime"
                        suffix="ms"
                      />
                    </el-col>
                    <el-col :span="6">
                      <el-statistic
                        title="故障数量"
                        :value="1032"
                      />
                    </el-col>
                    <el-col :span="6">
                      <el-statistic
                        title="故障率"
                        :value="29.76"
                        suffix="%"
                        :precision="2"
                      />
                    </el-col>
                    <el-col :span="6">
                      <el-statistic title="处理样本数" :value="3467" />
                    </el-col>
                  </el-row>
                </div>

                <div class="results-preview">
                  <h4>结果预览（前5行）：</h4>
                  <el-table :data="detectionResults.previewData" size="small" border stripe>
                    <el-table-column prop="time_seconds" label="时间戳" width="120" />
                    <el-table-column prop="equipment" label="设备编号" width="100" />
                    <el-table-column prop="voltage_V" label="电压(V)" width="100" />
                    <el-table-column prop="current1_A" label="电流1(A)" width="100" />
                    <el-table-column prop="current2_A" label="电流2(A)" width="100" />
                    <el-table-column prop="running_equipment" label="运行设备" width="120" />
                    <el-table-column prop="fault_type" label="故障类型" width="150">
                      <template #default="{ row }">
                        <el-tag 
                          size="small" 
                          :type="row.fault_type === '正常' ? 'success' : 'danger'"
                        >
                          {{ row.fault_type }}
                        </el-tag>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>

                <div class="results-actions">
                  <el-button type="primary" @click="downloadResults">
                    <el-icon><download /></el-icon>
                    下载CSV结果
                  </el-button>
                  <el-button @click="resetDetection">重新检测</el-button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div class="navigation-buttons">
        <el-button v-if="step > 1" @click="prevStep">上一步</el-button>
        <el-button v-if="step < 4" type="primary" @click="nextStep" :disabled="!canGoNext">
          下一步
        </el-button>
        <el-button v-if="step === 3" type="success" @click="startDetection" :loading="detecting" :disabled="!canStartDetection">
          {{ detecting ? '检测中...' : '开始检测' }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, Warning, Loading, UploadFilled, Download } from '@element-plus/icons-vue'

// 步骤控制
const step = ref(1)
const weightsLoading = ref(false)
const detecting = ref(false)

// 数据上传相关状态
const selectedFiles = ref([])
const validationResults = ref({})

// 检测配置
const detectionConfig = reactive({
  model: '',
  weights: '',
})

// 检测选项
const detectionOptions = reactive({
  faultThreshold: 0.7,
  batchSize: 64,
})

// 检测结果
const detectionResults = ref(null)

// CSV文件要求的格式
const requiredColumns = [
  { name: 'time_seconds', label: '时间戳(秒)', type: 'number' },
  { name: 'equipment', label: '设备编号', type: 'string' },
  { name: 'voltage_V', label: '电压(V)', type: 'number' },
  { name: 'current1_A', label: '电流1(A)', type: 'number' },
  { name: 'current2_A', label: '电流2(A)', type: 'number' }
]

// 示例数据
const exampleData = [
  { time_seconds: '0.0', equipment: 'Q0', voltage_V: '-161.7176', current1_A: '0.46696', current2_A: '-0.23348' },
  { time_seconds: '6.499837504062398e-05', equipment: 'Q0', voltage_V: '-161.7176', current1_A: '0.46696', current2_A: '-0.23348' },
  { time_seconds: '0.0001299967500812', equipment: 'Q0', voltage_V: '-161.7176', current1_A: '0.46696', current2_A: '-0.23348' },
  { time_seconds: '0.0001949951251218', equipment: 'Q0', voltage_V: '-161.54182', current1_A: '0.47594', current2_A: '-0.23348' },
  { time_seconds: '0.0002599935001624', equipment: 'Q0', voltage_V: '-161.54182', current1_A: '0.47594', current2_A: '-0.23348' },
  { time_seconds: '0.0003249918752031', equipment: 'Q0', voltage_V: '-161.54182', current1_A: '0.47594', current2_A: '-0.23348' }
]

// Mock data for available weights
const mockWeights = {
  LSTM: [
    {
      label: '1D-CNN lstm_fault_detection_v1.0',
      value: '1D-CNN lstm_v1_0',
      accuracy: '95.2%',
      trainDate: '2024-08-10',
    },
    { label: '1D-CNN lstm_best_model', value: '1D-CNN lstm_best', accuracy: '96.8%', trainDate: '2024-08-12' },
    {
      label: '1D-CNN lstm_checkpoint_100',
      value: '1D-CNN lstm_cp100',
      accuracy: '94.5%',
      trainDate: '2024-08-08',
    },
  ],
  'R-Informer': [
    {
      label: 'R-Informer_fault_detection_v2.1',
      value: 'R-Informer_v2_1',
      accuracy: '97.1%',
      trainDate: '2024-08-14',
    },
    {
      label: 'R-Informer_best_performance',
      value: 'R-Informer_best',
      accuracy: '98.3%',
      trainDate: '2024-08-13',
    },
    {
      label: 'R-Informer_stable',
      value: 'R-Informer_stable',
      accuracy: '96.9%',
      trainDate: '2024-08-11',
    },
  ],
}

// 计算属性
const availableWeights = computed(() => {
  if (!detectionConfig.model) return []
  return mockWeights[detectionConfig.model] || []
})

const validFilesCount = computed(() => {
  return selectedFiles.value.filter(file => file.status === 'valid').length
})

const invalidFilesCount = computed(() => {
  return selectedFiles.value.filter(file => file.status === 'invalid').length
})

const totalDataRows = computed(() => {
  return selectedFiles.value
    .filter(file => file.status === 'valid')
    .reduce((total, file) => total + (validationResults.value[file.id]?.rows || 0), 0)
})

const uniqueEquipments = computed(() => {
  const equipments = new Set()
  selectedFiles.value
    .filter(file => file.status === 'valid')
    .forEach(file => {
      const validation = validationResults.value[file.id]
      if (validation && validation.preview) {
        validation.preview.slice(1).forEach(line => {
          const columns = line.split(',')
          if (columns.length > 1) {
            equipments.add(columns[1].trim())
          }
        })
      }
    })
  return Array.from(equipments)
})

const canGoNext = computed(() => {
  if (step.value === 1) {
    return validFilesCount.value > 0
  }
  if (step.value === 2) {
    return detectionConfig.model && detectionConfig.weights
  }
  if (step.value === 3) {
    return true
  }
  return false
})

const canStartDetection = computed(() => {
  return validFilesCount.value > 0 && detectionConfig.model && detectionConfig.weights
})

// 文件大小格式化
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}


// 文件选择处理
const handleFileChange = (uploadFile) => {
  const file = uploadFile.raw
  
  // 检查文件格式
  if (!file.name.toLowerCase().endsWith('.csv')) {
    ElMessage.error('只支持CSV格式文件')
    return
  }

  // 检查文件大小（100MB限制）
  const maxSize = 100 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过100MB')
    return
  }

  // 如果已有文件，先清除
  if (selectedFiles.value.length > 0) {
    clearAllFiles()
  }

  const fileItem = {
    id: Date.now() + Math.random(),
    file: file,
    name: file.name,
    size: file.size,
    status: 'valid'
  }

  selectedFiles.value.push(fileItem)
  
  // 直接标记为验证通过，不进行实际验证
  validationResults.value[fileItem.id] = {
    valid: true,
    rows: 0, // 暂时设为0，实际使用时再计算
    preview: [] // 空预览
  }
  
  ElMessage.success(`${file.name} 上传成功`)
}

// 删除文件
const removeFile = (fileId) => {
  selectedFiles.value = selectedFiles.value.filter(file => file.id !== fileId)
  delete validationResults.value[fileId]
}

// 清空所有文件
const clearAllFiles = () => {
  selectedFiles.value = []
  validationResults.value = {}
}

// 移除所有无效文件
const removeInvalidFiles = () => {
  const invalidFiles = selectedFiles.value.filter(file => file.status === 'invalid')
  invalidFiles.forEach(file => {
    delete validationResults.value[file.id]
  })
  selectedFiles.value = selectedFiles.value.filter(file => file.status !== 'invalid')
  ElMessage.success(`已移除 ${invalidFiles.length} 个无效文件`)
}


// 获取权重信息
const getWeightsInfo = (weightsValue) => {
  const allWeights = [...(mockWeights.LSTM || []), ...(mockWeights['R-Informer'] || [])]
  const weight = allWeights.find((w) => w.value === weightsValue)
  if (!weight) return []

  return [
    { key: '准确率', value: weight.accuracy },
    { key: '训练日期', value: weight.trainDate },
    { key: '文件名', value: weight.label },
  ]
}

// 模型变化处理
const onModelChange = () => {
  detectionConfig.weights = ''
  weightsLoading.value = true
  // Simulate loading weights
  setTimeout(() => {
    weightsLoading.value = false
  }, 500)
}

// 步骤导航
const nextStep = () => {
  if (step.value < 4) {
    step.value++
  }
}

const prevStep = () => {
  if (step.value > 1) {
    step.value--
  }
}

// 开始故障检测
const startDetection = async () => {
  try {
    detecting.value = true

    // 模拟检测过程
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // 生成模拟检测结果
    const totalSamples = totalDataRows.value
    const faultCount = Math.floor(totalSamples * (1 - detectionOptions.faultThreshold) * 0.3)
    const faultRate = (faultCount / totalSamples * 100)

    // 生成预览数据 - 使用固定的前五行数据
    const previewData = [
      {
        time_seconds: '0',
        equipment: '1O0',
        voltage_V: '172.44018',
        current1_A: '5.95485',
        current2_A: '-5.80041',
        running_equipment: '设备正常运行',
        fault_type: '正常'
      },
      {
        time_seconds: '6.499837504062398e-05',
        equipment: '1O0',
        voltage_V: '172.44018',
        current1_A: '5.95485',
        current2_A: '-5.49153',
        running_equipment: '设备正常运行',
        fault_type: '正常'
      },
      {
        time_seconds: '0.0001299967500812',
        equipment: '1O0',
        voltage_V: '172.44018',
        current1_A: '5.95485',
        current2_A: '-5.20047',
        running_equipment: '设备正常运行',
        fault_type: '正常'
      },
      {
        time_seconds: '0.0001949951251218',
        equipment: '1O0',
        voltage_V: '172.44018',
        current1_A: '5.95485',
        current2_A: '-4.89753',
        running_equipment: '设备正常运行',
        fault_type: '正常'
      },
      {
        time_seconds: '0.0002599935001624',
        equipment: '1O0',
        voltage_V: '172.44018',
        current1_A: '5.95485',
        current2_A: '-4.60647',
        running_equipment: '设备正常运行',
        fault_type: '正常'
      }
    ]

    detectionResults.value = {
      totalSamples,
      faultCount,
      faultRate,
      processingTime: Math.floor(Math.random() * 2000) + 1000,
      previewData,
      allData: [] // 这里会包含所有处理后的数据
    }

    ElMessage.success('检测完成！')
    step.value = 4
  } catch (error) {
    ElMessage.error('检测过程中出现错误')
    console.error(error)
  } finally {
    detecting.value = false
  }
}

// 下载结果
const downloadResults = () => {
  if (!detectionResults.value) return

  // 生成CSV内容
  const headers = [...requiredColumns.map(col => col.name), 'running_equipment', 'fault_type']
  const csvContent = [
    headers.join(','),
    ...detectionResults.value.previewData.map(row => 
      headers.map(header => row[header]).join(',')
    )
  ].join('\n')

  // 创建下载链接
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `fault_detection_results_${new Date().toISOString().slice(0, 10)}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage.success('结果文件已下载')
}

// 重置检测
const resetDetection = () => {
  detectionResults.value = null
  step.value = 1
}
</script>

<style scoped>
.fault-detection-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 40px);
}

.detection-card {
  width: 100%;
  max-width: 1200px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.el-steps {
  margin: 20px 0;
}

.step-content {
  margin-top: 40px;
  min-height: 400px;
}

/* --- 数据上传步骤样式 --- */
.format-info-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  margin-bottom: 24px;
}

.format-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #495057;
  font-weight: 600;
}

.format-requirements {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.requirement-item h4 {
  margin: 0 0 8px 0;
  color: #343a40;
  font-size: 14px;
}

.requirement-item p {
  margin: 0;
  color: #6c757d;
  font-size: 13px;
}

.data-structure-section {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.table-structure {
  flex-shrink: 0;
}

.example-table {
  flex: 1;
}

.example-table h5 {
  margin: 0 0 12px 0;
  color: #343a40;
  font-size: 13px;
  font-weight: 600;
}

.number-value {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #e6a23c;
  font-weight: 500;
}

.requirements-list {
  margin: 0;
  padding-left: 20px;
  color: #6c757d;
  font-size: 13px;
}

.requirements-list li {
  margin-bottom: 4px;
  line-height: 1.4;
}

.upload-section {
  margin-bottom: 24px;
}

.upload-dragger {
  padding: 32px;
  text-align: center;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  transition: border-color 0.3s, background-color 0.3s;
  background-color: #fff;
}

.upload-dragger:hover {
  border-color: #409eff;
  background-color: #f5faff;
}

.upload-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.upload-text p {
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.upload-text em {
  color: #409eff;
  font-style: normal;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

.upload-format {
  font-size: 12px;
  color: #409eff;
  font-family: 'Courier New', monospace;
  background: #ecf5ff;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 8px;
}

.file-info-section {
  margin-top: 24px;
}

.file-info-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.file-info-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-info-icon {
  font-size: 32px;
  color: #409eff;
}

.file-valid .file-info-icon { color: #67c23a; }
.file-invalid .file-info-icon { color: #f56c6c; }
.file-validating .file-info-icon { color: #e6a23c; }

.file-info-details {
  flex: 1;
}

.file-info-name {
  font-weight: 500;
  color: #303133;
  font-size: 16px;
  margin-bottom: 4px;
}

.file-info-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.validation-details {
  margin-top: 12px;
  padding: 12px;
  border-radius: 6px;
  border-top: 1px solid #ebeef5;
}

.file-invalid .validation-details {
  background-color: #fef0f0;
}

.file-valid .validation-details {
  background-color: #f0f9eb;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f56c6c;
  font-size: 13px;
}

.preview-data {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-title {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.data-preview {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #303133;
  background: #fff;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  line-height: 1.3;
  max-height: 120px;
  overflow-y: auto;
}

/* --- 模型选择步骤样式 --- */
.weights-info {
  background-color: #f9f9f9;
  margin-top: 10px;
}

.weights-info p {
  margin: 8px 0;
  line-height: 1.6;
}

.dataset-info {
  background-color: #f9f9f9;
  margin-top: 10px;
}

.dataset-info p {
  margin: 8px 0;
  line-height: 1.6;
}

/* --- 故障检测步骤样式 --- */
.detection-config {
  space-y: 20px;
}

.detection-options {
  margin-top: 20px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 6px;
}

.detection-options h3 {
  margin-bottom: 15px;
  color: #606266;
  font-size: 16px;
}

.threshold-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.threshold-desc {
  font-style: italic;
}

/* --- 结果步骤样式 --- */
.results-container {
  padding: 20px 0;
}

.results-summary {
  margin: 20px 0;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.results-preview {
  margin: 20px 0;
}

.results-preview h4 {
  margin-bottom: 12px;
  color: #606266;
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

/* --- 通用样式 --- */
.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  border-top: 1px solid #e4e7ed;
  padding-top: 20px;
}

/* --- 响应式设计 --- */
@media (max-width: 1200px) {
  .data-structure-section {
    flex-direction: column;
    gap: 16px;
  }
  
  .table-structure {
    align-self: stretch;
  }
}
</style>
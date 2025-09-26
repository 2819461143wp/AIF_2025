<template>
  <div class="model-predict-container">
    <el-card class="predict-card">
      <template #header>
        <div class="card-header">
          <span>故障预测</span>
        </div>
      </template>

      <el-steps :active="step - 1" finish-status="success" simple>
        <el-step title="选择数据集" />
        <el-step title="选择模型和权重" />
        <el-step title="开始预测" />
      </el-steps>

      <div class="step-content">
        <transition name="el-fade-in" mode="out-in">
          <div :key="step">
            <!-- Step 1: Dataset Selection -->
            <el-form
              v-if="step === 1"
              ref="formStep1"
              :model="predictConfig"
              label-width="140px"
              label-position="right"
            >
              <el-form-item label="选择数据集:" prop="dataset">
                <el-select
                  v-model="predictConfig.dataset"
                  placeholder="请选择一个数据集"
                  style="width: 100%"
                >
                  <el-option label="Dataset_A" value="Dataset_A" />
                  <el-option label="Dataset_B" value="Dataset_B" />
                  <el-option label="Dataset_C" value="Dataset_C" />
                </el-select>
              </el-form-item>
              <el-form-item label="数据集描述:">
                <el-card v-if="predictConfig.dataset" class="dataset-info">
                  <p><strong>数据集:</strong> {{ predictConfig.dataset }}</p>
                  <p>
                    <strong>特征数量:</strong> {{ getDatasetInfo(predictConfig.dataset).features }}
                  </p>
                  <p>
                    <strong>样本数量:</strong> {{ getDatasetInfo(predictConfig.dataset).samples }}
                  </p>
                  <p>
                    <strong>描述:</strong> {{ getDatasetInfo(predictConfig.dataset).description }}
                  </p>
                </el-card>
              </el-form-item>
            </el-form>

            <!-- Step 2: Model and Weights Selection -->
            <el-form
              v-if="step === 2"
              :model="predictConfig"
              label-width="140px"
              label-position="right"
            >
              <el-form-item label="选择模型:" prop="model">
                <el-select
                  v-model="predictConfig.model"
                  placeholder="请选择一个模型"
                  style="width: 100%"
                  @change="onModelChange"
                >
                  <el-option label="LSTM" value="LSTM" />
                  <el-option label="R-Informer" value="R-Informer" />
                </el-select>
              </el-form-item>

              <el-form-item v-if="predictConfig.model" label="选择权重文件:" prop="weights">
                <el-select
                  v-model="predictConfig.weights"
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

              <el-form-item v-if="predictConfig.weights" label="权重信息:">
                <el-card class="weights-info">
                  <div v-for="info in getWeightsInfo(predictConfig.weights)" :key="info.key">
                    <p>
                      <strong>{{ info.key }}:</strong> {{ info.value }}
                    </p>
                  </div>
                </el-card>
              </el-form-item>
            </el-form>

            <!-- Step 3: Prediction Configuration -->
            <div v-if="step === 3" class="prediction-config">
              <el-descriptions title="确认预测信息" :column="1" border>
                <el-descriptions-item label="数据集">{{
                  predictConfig.dataset
                }}</el-descriptions-item>
                <el-descriptions-item label="模型类型">{{
                  predictConfig.model
                }}</el-descriptions-item>
                <el-descriptions-item label="权重文件">{{
                  predictConfig.weights
                }}</el-descriptions-item>
              </el-descriptions>

              <div class="prediction-options">
                <h3>预测选项</h3>
                <el-form :model="predictionOptions" label-width="140px">
                  <el-form-item label="输出格式:">
                    <el-radio-group v-model="predictionOptions.outputFormat">
                      <el-radio label="json">JSON格式</el-radio>
                      <el-radio label="csv">CSV文件</el-radio>
                      <el-radio label="excel">Excel文件</el-radio>
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item label="是否显示置信度:">
                    <el-switch v-model="predictionOptions.showConfidence" />
                  </el-form-item>

                  <el-form-item label="批处理大小:">
                    <el-input-number
                      v-model="predictionOptions.batchSize"
                      :min="1"
                      :max="1000"
                      controls-position="right"
                      style="width: 200px"
                    />
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <div class="navigation-buttons">
        <el-button v-if="step > 1" @click="prevStep">上一步</el-button>
        <el-button v-if="step < 3" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-if="step === 3" type="success" @click="startPrediction" :loading="predicting">
          {{ predicting ? '预测中...' : '开始预测' }}
        </el-button>
      </div>
    </el-card>

    <!-- Prediction Results Dialog -->
    <el-dialog
      v-model="showResults"
      title="预测结果"
      width="80%"
      center
      :close-on-click-modal="false"
    >
      <div v-if="predictionResults" class="results-container">
        <el-alert
          title="预测完成"
          type="success"
          :description="`成功预测了 ${predictionResults.totalSamples} 个样本`"
          show-icon
          :closable="false"
        />

        <div class="results-summary">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-statistic
                title="预测时间"
                :value="predictionResults.predictionTime"
                suffix="ms"
              />
            </el-col>
            <el-col :span="6">
              <el-statistic
                title="平均置信度"
                :value="predictionResults.avgConfidence"
                suffix="%"
                :precision="2"
              />
            </el-col>
            <el-col :span="6">
              <el-statistic title="处理样本数" :value="predictionResults.totalSamples" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="故障样本数" :value="predictionResults.faultCount" />
            </el-col>
          </el-row>
        </div>

        <!-- 故障类型统计 -->
        <div class="fault-statistics">
          <h3>故障类型统计</h3>
          <el-row :gutter="20">
            <el-col :span="4" v-for="(count, type) in predictionResults.faultTypeStats" :key="type">
              <el-card class="fault-type-card">
                <div class="fault-type-content">
                  <div class="fault-type-name">{{ getFaultTypeName(type) }}</div>
                  <div class="fault-type-count">{{ count }}</div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 详细结果表格 -->
        <div class="detailed-results">
          <h3>详细预测结果</h3>
          <el-table
            :data="predictionResults.detailedResults"
            style="width: 100%"
            max-height="400"
            stripe
            border
          >
            <el-table-column prop="timestamp" label="时间戳" width="180" />
            <el-table-column prop="equipment" label="设备" width="80" />
            <el-table-column prop="voltage" label="电压值" width="100" />
            <el-table-column prop="current" label="电流值" width="100" />
            <el-table-column prop="power" label="功率值" width="100" />
            <el-table-column prop="temperature" label="温度值" width="100" />
            <el-table-column prop="confidence" label="置信度" width="100" />
            <el-table-column prop="faultTypes" label="故障类型" width="150">
              <template #default="scope">
                <el-tag
                  v-for="fault in scope.row.faultTypes"
                  :key="fault"
                  :type="getFaultTagType(fault)"
                  class="fault-tag"
                >
                  {{ getFaultTypeName(fault) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="results-actions">
          <el-button type="primary" @click="downloadResults">下载结果</el-button>
          <el-button @click="viewDetails">查看详细结果</el-button>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showResults = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const step = ref(1)
const weightsLoading = ref(false)
const predicting = ref(false)
const showResults = ref(false)

const predictConfig = reactive({
  dataset: '',
  model: '',
  weights: '',
})

const predictionOptions = reactive({
  outputFormat: 'json',
  showConfidence: true,
  batchSize: 64,
})

const predictionResults = ref(null)

// Mock data for available weights
const mockWeights = {
  LSTM: [
    {
      label: 'my_lstm_weights_v1.0',
      value: 'lstm_v1_0',
      accuracy: '95.2%',
      trainDate: '2024-08-10',
    },
    { label: 'lstm_best_model', value: 'lstm_best', accuracy: '96.8%', trainDate: '2024-08-12' },
    {
      label: 'lstm_checkpoint_100',
      value: 'lstm_cp100',
      accuracy: '94.5%',
      trainDate: '2024-08-08',
    },
  ],
  'R-Informer': [
    {
      label: 'rinformer_final_v2.1',
      value: 'rinformer_v2_1',
      accuracy: '97.1%',
      trainDate: '2024-08-14',
    },
    {
      label: 'rinformer_best_performance',
      value: 'rinformer_best',
      accuracy: '98.3%',
      trainDate: '2024-08-13',
    },
    {
      label: 'rinformer_stable',
      value: 'rinformer_stable',
      accuracy: '96.9%',
      trainDate: '2024-08-11',
    },
  ],
}

const availableWeights = computed(() => {
  if (!predictConfig.model) return []
  return mockWeights[predictConfig.model] || []
})

const getDatasetInfo = (dataset) => {
  const datasetInfoMap = {
    Dataset_A: {
      features: 13,
      samples: 10000,
      description: '包含多种传感器数据的综合数据集',
    },
    Dataset_B: {
      features: 8,
      samples: 8500,
      description: '专注于特定场景的优化数据集',
    },
    Dataset_C: {
      features: 15,
      samples: 12000,
      description: '扩展特征的增强数据集',
    },
  }
  return datasetInfoMap[dataset] || {}
}

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

const onModelChange = () => {
  predictConfig.weights = ''
  weightsLoading.value = true
  // Simulate loading weights
  setTimeout(() => {
    weightsLoading.value = false
  }, 500)
}

const nextStep = () => {
  if (step.value === 1) {
    if (!predictConfig.dataset) {
      ElMessage.warning('请选择一个数据集！')
      return
    }
  }

  if (step.value === 2) {
    if (!predictConfig.model) {
      ElMessage.warning('请选择一个模型！')
      return
    }
    if (!predictConfig.weights) {
      ElMessage.warning('请选择权重文件！')
      return
    }
  }

  if (step.value < 3) {
    step.value++
  }
}

const prevStep = () => {
  if (step.value > 1) {
    step.value--
  }
}

const startPrediction = async () => {
  try {
    predicting.value = true

    const config = {
      ...predictConfig,
      ...predictionOptions,
    }

    console.log('开始预测，配置如下:')
    console.log(config)

    // Simulate prediction process
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Mock prediction results based on the provided data format
    const mockData = [
      '0.3369515762105947,O0,4012,172.61596,4012,5.96079,4022,5.99049,0,',
      '0.3370165745856354,O0,4010,172.44018,4010,5.95485,4040,6.04395,0,',
      '0.337081572960676,O0,4012,172.61596,4012,5.96079,4056,6.09147,O0,过压',
      '0.3371465713357166,O0,4008,172.2644,4008,5.94891,4068,6.12711,O0,过压',
      '0.3372115697107572,O0,4016,172.96751999999998,4016,5.97267,4078,6.15681,O0,过压',
      '0.3372765680857978,O0,4006,172.08862,4006,5.94297,4086,6.18057,O0,过压',
      '0.3373415664608384,O0,4028,174.0222,4028,6.00831,4092,6.19839,O0,过压',
      '0.3374065648358791,O0,3992,170.85816,3992,5.90139,0,-5.95485,O0,短路、过压',
      '0.3374715632109197,O0,106,-170.68238,106,-5.64003,0,-5.95485,O0,漏电、欠压'
    ]

    // Parse mock data and generate detailed results
    const detailedResults = mockData.map((line, index) => {
      const parts = line.split(',')
      const timestamp = new Date(Date.now() - (mockData.length - index) * 60000).toLocaleString()
      const equipment = parts[1] || 'O0'
      const voltage = parseFloat(parts[2]) || 0
      const current = parseFloat(parts[3]) || 0
      const power = parseFloat(parts[4]) || 0
      const temperature = parseFloat(parts[5]) || 0
      const confidence = (Math.random() * 20 + 80).toFixed(2)
      
      // Extract fault types
      const faultTypes = parts[10] ? parts[10].split('、') : []
      
      return {
        timestamp,
        equipment,
        voltage: voltage.toFixed(2),
        current: current.toFixed(2),
        power: power.toFixed(2),
        temperature: temperature.toFixed(2),
        confidence: `${confidence}%`,
        faultTypes,
        status: faultTypes.length > 0 ? '故障' : '正常'
      }
    })

    // Calculate fault type statistics
    const faultTypeStats = {
      overvoltage: 0,    // 过压
      undervoltage: 0,  // 欠压
      overload: 0,      // 过载
      shortcircuit: 0,  // 短路
      leakage: 0        // 漏电
    }

    let faultCount = 0
    detailedResults.forEach(result => {
      if (result.faultTypes.length > 0) {
        faultCount++
        result.faultTypes.forEach(fault => {
          switch (fault) {
            case '过压':
              faultTypeStats.overvoltage++
              break
            case '欠压':
              faultTypeStats.undervoltage++
              break
            case '过载':
              faultTypeStats.overload++
              break
            case '短路':
              faultTypeStats.shortcircuit++
              break
            case '漏电':
              faultTypeStats.leakage++
              break
          }
        })
      }
    })

    predictionResults.value = {
      totalSamples: detailedResults.length,
      predictionTime: Math.floor(Math.random() * 2000) + 1000,
      avgConfidence: Math.random() * 20 + 80,
      faultCount,
      faultTypeStats,
      detailedResults,
      results: [] // This would contain actual prediction data
    }

    ElMessage.success('预测完成！')
    showResults.value = true
  } catch (error) {
    ElMessage.error('预测过程中出现错误')
    console.error(error)
  } finally {
    predicting.value = false
  }
}

// 获取故障类型的中文名称
const getFaultTypeName = (type) => {
  const faultTypeMap = {
    overvoltage: '过压',
    undervoltage: '欠压',
    overload: '过载',
    shortcircuit: '短路',
    leakage: '漏电'
  }
  return faultTypeMap[type] || type
}

// 获取故障标签的样式类型
const getFaultTagType = (fault) => {
  const faultTagMap = {
    '过压': 'danger',
    '欠压': 'warning',
    '过载': 'danger',
    '短路': 'danger',
    '漏电': 'warning'
  }
  return faultTagMap[fault] || 'info'
}

const downloadResults = () => {
  ElMessage.success(`正在下载${predictionOptions.outputFormat.toUpperCase()}格式的结果文件...`)
  // Implement actual download logic here
}

const viewDetails = () => {
  ElMessage.info('跳转到详细结果页面...')
  // Implement navigation to detailed results page
}
</script>

<style scoped>
.model-predict-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 40px);
}

.predict-card {
  width: 100%;
  max-width: 900px;
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
  min-height: 300px;
}

.dataset-info,
.weights-info {
  background-color: #f9f9f9;
  margin-top: 10px;
}

.dataset-info p,
.weights-info p {
  margin: 8px 0;
  line-height: 1.6;
}

.prediction-config {
  space-y: 20px;
}

.prediction-options {
  margin-top: 20px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 6px;
}

.prediction-options h3 {
  margin-bottom: 15px;
  color: #606266;
  font-size: 16px;
}

.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  border-top: 1px solid #e4e7ed;
  padding-top: 20px;
}

.results-container {
  padding: 20px 0;
}

.results-summary {
  margin: 20px 0;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.fault-statistics {
  margin: 20px 0;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.fault-statistics h3 {
  margin-bottom: 15px;
  color: #606266;
  font-size: 16px;
}

.fault-type-card {
  text-align: center;
  margin-bottom: 10px;
}

.fault-type-content {
  padding: 10px;
}

.fault-type-name {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.fault-type-count {
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
}

.detailed-results {
  margin: 20px 0;
}

.detailed-results h3 {
  margin-bottom: 15px;
  color: #606266;
  font-size: 16px;
}

.fault-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>

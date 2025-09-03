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
            <el-col :span="8">
              <el-statistic
                title="预测时间"
                :value="predictionResults.predictionTime"
                suffix="ms"
              />
            </el-col>
            <el-col :span="8">
              <el-statistic
                title="平均置信度"
                :value="predictionResults.avgConfidence"
                suffix="%"
                :precision="2"
              />
            </el-col>
            <el-col :span="8">
              <el-statistic title="处理样本数" :value="predictionResults.totalSamples" />
            </el-col>
          </el-row>
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

    // Mock prediction results
    predictionResults.value = {
      totalSamples: Math.floor(Math.random() * 1000) + 500,
      predictionTime: Math.floor(Math.random() * 2000) + 1000,
      avgConfidence: Math.random() * 20 + 80,
      results: [], // This would contain actual prediction data
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
</style>

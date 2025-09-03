<template>
  <div class="model-train-container">
    <el-card class="train-card">
      <template #header>
        <div class="card-header">
          <span>模型训练</span>
        </div>
      </template>

      <el-steps :active="step - 1" finish-status="success" simple>
        <el-step title="基础配置" />
        <el-step title="超参数" />
        <el-step title="确认训练" />
      </el-steps>

      <div class="step-content">
        <transition name="el-fade-in" mode="out-in">
          <div :key="step">
            <!-- Step 1: Basic Config -->
            <el-form v-if="step === 1" ref="formStep1" :model="basicConfig" label-width="140px" label-position="right">
              <el-form-item label="选择数据集:" prop="dataset">
                <el-select v-model="basicConfig.dataset" placeholder="请选择一个数据集" style="width: 100%">
                  <el-option label="Dataset_A" value="Dataset_A" />
                  <el-option label="Dataset_B" value="Dataset_B" />
                  <el-option label="Dataset_C" value="Dataset_C" />
                </el-select>
              </el-form-item>
              <el-form-item label="选择模型:" prop="model">
                <el-select v-model="basicConfig.model" placeholder="请选择一个模型" style="width: 100%">
                  <el-option label="LSTM" value="LSTM" />
                  <el-option label="R-Informer" value="R-Informer" />
                </el-select>
              </el-form-item>
              <el-form-item label="权重文件夹名字:" prop="weightsFolderName">
                <el-input v-model="basicConfig.weightsFolderName" placeholder="例如: my_lstm_weights" />
              </el-form-item>
            </el-form>

            <!-- Step 2: Hyperparameters -->
            <el-form v-if="step === 2" :model="hyperparameters" label-width="140px" label-position="right">
               <h3 class="param-title">{{ basicConfig.model }} 超参数</h3>
               <div v-if="basicConfig.model === 'LSTM'" class="param-grid">
                <el-form-item v-for="(value, key) in hyperparameters.lstm" :key="key" :label="`${key}:`">
                  <el-input-number v-model="hyperparameters.lstm[key]" :step="key.includes('RATE') ? 0.0001 : 1" controls-position="right" style="width: 100%" />
                </el-form-item>
              </div>
              <div v-if="basicConfig.model === 'R-Informer'" class="param-grid">
                 <el-form-item v-for="(value, key) in hyperparameters.rInformer" :key="key" :label="`${key}:`">
                   <el-input v-if="typeof value === 'string'" v-model="hyperparameters.rInformer[key]" />
                   <el-input-number v-else v-model="hyperparameters.rInformer[key]" :step="key.includes('rate') ? 0.0001 : 1" controls-position="right" style="width: 100%" />
                </el-form-item>
              </div>
            </el-form>

            <!-- Step 3: Confirmation -->
            <div v-if="step === 3" class="summary">
              <el-descriptions title="确认训练信息" :column="1" border>
                <el-descriptions-item label="数据集">{{ basicConfig.dataset }}</el-descriptions-item>
                <el-descriptions-item label="模型">{{ basicConfig.model }}</el-descriptions-item>
                <el-descriptions-item label="权重文件夹">{{ basicConfig.weightsFolderName }}</el-descriptions-item>
                <el-descriptions-item label="超参数">
                  <pre>{{ JSON.stringify(basicConfig.model === 'LSTM' ? hyperparameters.lstm : hyperparameters.rInformer, null, 2) }}</pre>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </transition>
      </div>

      <div class="navigation-buttons">
        <el-button v-if="step > 1" @click="prevStep">上一步</el-button>
        <el-button v-if="step < 3" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-if="step === 3" type="success" @click="startTraining">开始训练</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

const step = ref(1);

const basicConfig = reactive({
  dataset: '',
  model: 'LSTM',
  weightsFolderName: '',
});

const hyperparameters = reactive({
  lstm: {
    WINDOW_SIZE: 60,
    HIDDEN_DIM: 128,
    NUM_LAYERS: 2,
    DROPOUT: 0.3,
    BATCH_SIZE: 64,
    EPOCHS: 100,
    LEARNING_RATE: 0.001,
    PATIENCE: 15,
  },
  rInformer: {
    enc_in: 13,
    c_out: 6,
    d_model: 128,
    dropout: 0.3,
    attn: 'prob',
    activation: 'relu',
    batch_size: 256,
    patience: 30,
    learning_rate: 0.0001,
    ksize: 7,
    rnn_type: 'LSTM',
    task_type: 'classification',
    num_classes: 6,
  },
});

const nextStep = () => {
  if (step.value === 1) {
    if (!basicConfig.dataset) {
      ElMessage.warning('请选择一个数据集！');
      return;
    }
    if (!basicConfig.weightsFolderName) {
      ElMessage.warning('请输入权重文件夹名字！');
      return;
    }
  }
  if (step.value < 3) {
    step.value++;
  }
};

const prevStep = () => {
  if (step.value > 1) {
    step.value--;
  }
};

const startTraining = () => {
  const trainingConfig = {
    ...basicConfig,
    hyperparameters: basicConfig.model === 'LSTM' ? { ...hyperparameters.lstm } : { ...hyperparameters.rInformer },
  };

  console.log('开始训练，配置如下:');
  console.log(trainingConfig);
  ElMessage.success(`开始训练模型: ${basicConfig.model}`);
};
</script>

<style scoped>
.model-train-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 40px);
}

.train-card {
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
  min-height: 300px; /* Prevent layout shift */
}

.param-title {
    text-align: center;
    margin-bottom: 20px;
    color: #606266;
}

.param-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px 20px;
}

.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  border-top: 1px solid #e4e7ed;
  padding-top: 20px;
}

.summary pre {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
}
</style>
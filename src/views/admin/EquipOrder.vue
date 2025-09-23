<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 状态管理
const loading = ref(false)
const dialogVisible = ref(false)
const instructionForm = ref({})
const searchKeyword = ref('')
const selectedDevice = ref('')
const instructionType = ref('maintenance') // 'maintenance' | 'optimization'

// 设备列表
const devices = ref([])
const instructions = ref([])

// 表单数据
const formData = ref({
  deviceId: '',
  type: 'maintenance',
  title: '',
  description: '',
  priority: 'medium',
  targetDate: '',
  parameters: [],
  assignedTo: '',
  attachments: []
})

// 优先级选项
const priorityOptions = [
  { label: '低', value: 'low', type: 'info' },
  { label: '中', value: 'medium', type: 'warning' },
  { label: '高', value: 'high', type: 'danger' },
  { label: '紧急', value: 'urgent', type: 'danger' }
]

// 维修人员列表
const technicians = ref([
  { id: '1', name: '张技师', specialty: '机械维修' },
  { id: '2', name: '李工程师', specialty: '电气维修' },
  { id: '3', name: '王技师', specialty: '自动化调试' },
  { id: '4', name: '赵工程师', specialty: '能效优化' }
])

// 设备参数模板
const parameterTemplates = ref({
  current: { name: '电流', unit: 'A', type: 'number' },
  voltage: { name: '电压', unit: 'V', type: 'number' },
  power: { name: '功率', unit: 'W', type: 'number' },
  frequency: { name: '频率', unit: 'Hz', type: 'number' },
  currentVector: { name: '电流矢量和', unit: 'A', type: 'number' },
  waveformDistortion: { name: '波形畸变率', unit: '%', type: 'number' }
})

// 过滤后的设备列表
const filteredDevices = computed(() => {
  if (!searchKeyword.value) return devices.value
  return devices.value.filter(device =>
    device.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    device.location.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 过滤后的指令列表
const filteredInstructions = computed(() => {
  let result = instructions.value
  
  if (selectedDevice.value) {
    result = result.filter(instruction => instruction.deviceId === selectedDevice.value)
  }
  
  if (instructionType.value) {
    result = result.filter(instruction => instruction.type === instructionType.value)
  }
  
  return result
})

// 初始化数据
const initData = () => {
  // 模拟设备数据
  devices.value = [
    {
      id: '1',
      name: 'Citiiaqua DL-500',
      type: '电力负载设备',
      brand: 'Citiiaqua',
      model: 'DL-500',
      location: '负载区-01',
      status: 'running',
      maxPower: 13,
      voltage: 127,
      frequency: 60,
      comments: ''
    },
    {
      id: '2',
      name: 'Asus AD2037020',
      type: '电力负载设备',
      brand: 'Asus',
      model: 'AD2037020',
      location: '负载区-02',
      status: 'running',
      maxPower: 38.1,
      voltage: '110-240',
      frequency: '50-60',
      comments: 'connected on a phone Asus X008D with 42% battery percentage at the beginning of the acquisition session.'
    },
    {
      id: '3',
      name: 'Bosch Furadeira de Impacto',
      type: '电力负载设备',
      brand: 'Bosch',
      model: 'Furadeira de Impacto 2 velocidades 350W (0,47CV) 0 603 147 547',
      location: '负载区-03',
      status: 'running',
      maxPower: 350,
      voltage: 127,
      frequency: 60,
      comments: 'control speed on position 2 (170W, after the transient)'
    },
    {
      id: '4',
      name: 'Pelonis NYLA-7',
      type: '电力负载设备',
      brand: 'Pelonis',
      model: 'NYLA-7',
      location: '负载区-04',
      status: 'running',
      maxPower: 1500,
      voltage: 127,
      frequency: 60,
      comments: 'power control on position 1 (518W)'
    },
    {
      id: '5',
      name: 'Sony PCG-61112L',
      type: '电力负载设备',
      brand: 'Sony',
      model: 'PCG-61112L',
      location: '负载区-05',
      status: 'running',
      maxPower: 92,
      voltage: 127,
      frequency: 60,
      comments: 'Laptop with 94% battery percentage at the beginning of the acquisition session.'
    },
    {
      id: '6',
      name: 'Osram Centra A CL 100',
      type: '电力负载设备',
      brand: 'Osram',
      model: 'Centra A CL 100',
      location: '负载区-06',
      status: 'running',
      maxPower: 100,
      voltage: 127,
      frequency: 60,
      comments: ''
    },
    {
      id: '7',
      name: 'Weller WLC100',
      type: '电力负载设备',
      brand: 'Weller',
      model: 'WLC100',
      location: '负载区-07',
      status: 'running',
      maxPower: 40,
      voltage: 127,
      frequency: 60,
      comments: 'power control on the maximum power'
    },
    {
      id: '8',
      name: 'Toyo Ts-153',
      type: '电力负载设备',
      brand: 'Toyo',
      model: 'Ts-153',
      location: '负载区-08',
      status: 'running',
      maxPower: 23,
      voltage: 127,
      frequency: 60,
      comments: ''
    }
  ]

  // 模拟指令数据
  instructions.value = [
    {
      id: '1',
      deviceId: '1',
      type: 'maintenance',
      title: '漏电检测检修',
      description: '检测到电流矢量和不为零，可能存在漏电风险，需要检查线路绝缘',
      priority: 'high',
      status: 'pending',
      assignedTo: '1',
      targetDate: '2024-08-25',
      createTime: '2024-08-20 09:00:00',
      createBy: 'admin'
    },
    {
      id: '2',
      deviceId: '2',
      type: 'maintenance',
      title: '短路检测处理',
      description: '检测到电流骤升和波形畸变，疑似短路故障，需要立即检修',
      priority: 'urgent',
      status: 'in_progress',
      assignedTo: '4',
      targetDate: '2024-08-30',
      parameters: [
        { name: '电流', currentValue: '15.2', targetValue: '5.8', unit: 'A' },
        { name: '波形畸变率', currentValue: '25%', targetValue: '5%', unit: '%' }
      ],
      createTime: '2024-08-19 14:30:00',
      createBy: 'admin'
    },
    {
      id: '3',
      deviceId: '3',
      type: 'maintenance',
      title: '过载检测处理',
      description: '设备持续超额定功率运行，存在过载风险，需要检查负载情况',
      priority: 'high',
      status: 'pending',
      assignedTo: '2',
      targetDate: '2024-09-01',
      createTime: '2024-08-21 10:15:00',
      createBy: 'admin'
    },
    {
      id: '4',
      deviceId: '4',
      type: 'maintenance',
      title: '过压/欠压检测',
      description: '检测到电压超出安全阈值范围，需要检查供电系统稳定性',
      priority: 'medium',
      status: 'pending',
      assignedTo: '3',
      targetDate: '2024-08-28',
      createTime: '2024-08-18 16:20:00',
      createBy: 'admin'
    },
    {
      id: '5',
      deviceId: '5',
      type: 'maintenance',
      title: '设备状态检测',
      description: '设备突然关闭，需要检测设备启动/停止/待机状态及控制电路',
      priority: 'medium',
      status: 'pending',
      assignedTo: '1',
      targetDate: '2024-08-29',
      createTime: '2024-08-22 11:30:00',
      createBy: 'admin'
    }
  ]
}

// 打开新建指令对话框
const openCreateDialog = () => {
  formData.value = {
    deviceId: '',
    type: 'maintenance',
    title: '',
    description: '',
    priority: 'medium',
    targetDate: '',
    parameters: [],
    assignedTo: '',
    attachments: []
  }
  dialogVisible.value = true
}

// 添加参数
const addParameter = () => {
  formData.value.parameters.push({
    name: '',
    currentValue: '',
    targetValue: '',
    unit: '',
    note: ''
  })
}

// 删除参数
const removeParameter = (index) => {
  formData.value.parameters.splice(index, 1)
}

// 保存指令
const saveInstruction = async () => {
  if (!formData.value.deviceId) {
    ElMessage.error('请选择设备')
    return
  }
  if (!formData.value.title.trim()) {
    ElMessage.error('请输入指令标题')
    return
  }
  if (!formData.value.assignedTo) {
    ElMessage.error('请选择执行人员')
    return
  }

  loading.value = true
  try {
    const newInstruction = {
      ...formData.value,
      id: Date.now().toString(),
      status: 'pending',
      createTime: new Date().toLocaleString(),
      createBy: 'admin'
    }
    instructions.value.unshift(newInstruction)
    ElMessage.success('指令下达成功')
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
  }
}

// 取消指令
const cancelInstruction = async (instruction) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消指令"${instruction.title}"吗？`,
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = instructions.value.findIndex(item => item.id === instruction.id)
    if (index !== -1) {
      instructions.value[index].status = 'cancelled'
      ElMessage.success('指令已取消')
    }
  } catch {
    // 用户取消
  }
}

// 获取设备名称
const getDeviceName = (deviceId) => {
  const device = devices.value.find(d => d.id === deviceId)
  return device ? device.name : deviceId
}

// 获取技师名称
const getTechnicianName = (techId) => {
  const tech = technicians.value.find(t => t.id === techId)
  return tech ? tech.name : techId
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return statusMap[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待执行',
    in_progress: '执行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

// 组件挂载时初始化数据
onMounted(() => {
  initData()
})
</script>

<template>
  <div class="device-instructions">
    <!-- 头部操作区 -->
    <div class="header-section">
      <div class="header-left">
        <h2>设备指令下达</h2>
        <p class="subtitle">下达设备维修和优化指令</p>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">
          下达新指令
        </el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索设备名称或位置"
        style="width: 200px"
        :prefix-icon="Search"
        clearable
      />
      <el-select
        v-model="selectedDevice"
        placeholder="筛选设备"
        style="width: 200px"
        clearable
      >
        <el-option
          v-for="device in devices"
          :key="device.id"
          :label="device.name"
          :value="device.id"
        />
      </el-select>
      <el-select
        v-model="instructionType"
        placeholder="指令类型"
        style="width: 150px"
      >
        <el-option label="全部" value="" />
        <el-option label="维修指令" value="maintenance" />
        <el-option label="优化指令" value="optimization" />
      </el-select>
    </div>

    <!-- 指令列表 -->
    <div class="instructions-list">
      <el-card
        v-for="instruction in filteredInstructions"
        :key="instruction.id"
        class="instruction-card"
        shadow="hover"
      >
        <div class="instruction-header">
          <div class="instruction-info">
            <h3 class="instruction-title">{{ instruction.title }}</h3>
            <div class="instruction-meta">
              <el-tag :type="instruction.type === 'maintenance' ? 'warning' : 'success'" size="small">
                {{ instruction.type === 'maintenance' ? '维修指令' : '优化指令' }}
              </el-tag>
              <el-tag :type="getStatusType(instruction.status)" size="small">
                {{ getStatusText(instruction.status) }}
              </el-tag>
              <span class="priority-tag">
                <el-tag 
                  :type="priorityOptions.find(p => p.value === instruction.priority)?.type"
                  size="small"
                >
                  {{ priorityOptions.find(p => p.value === instruction.priority)?.label }}优先级
                </el-tag>
              </span>
            </div>
          </div>
          <div class="instruction-actions">
            <el-button
              v-if="instruction.status === 'pending'"
              type="danger"
              size="small"
              @click="cancelInstruction(instruction)"
            >
              取消指令
            </el-button>
          </div>
        </div>

        <div class="instruction-content">
          <div class="content-row">
            <div class="content-item">
              <label>目标设备:</label>
              <span>{{ getDeviceName(instruction.deviceId) }}</span>
            </div>
            <div class="content-item">
              <label>执行人员:</label>
              <span>{{ getTechnicianName(instruction.assignedTo) }}</span>
            </div>
            <div class="content-item">
              <label>目标完成时间:</label>
              <span>{{ instruction.targetDate }}</span>
            </div>
          </div>

          <div class="content-row">
            <div class="content-item full-width">
              <label>指令描述:</label>
              <p class="description">{{ instruction.description }}</p>
            </div>
          </div>

          <!-- 参数调整（优化指令） -->
          <div v-if="instruction.type === 'optimization' && instruction.parameters?.length" class="parameters-section">
            <h4>参数调整</h4>
            <div class="parameters-grid">
              <div
                v-for="param in instruction.parameters"
                :key="param.name"
                class="parameter-item"
              >
                <div class="param-name">{{ param.name }}</div>
                <div class="param-values">
                  <span class="current-value">{{ param.currentValue }}{{ param.unit }}</span>
                  <el-icon><ArrowRight /></el-icon>
                  <span class="target-value">{{ param.targetValue }}{{ param.unit }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="instruction-footer">
            <div class="create-info">
              <el-text size="small" type="info">
                创建时间: {{ instruction.createTime }} | 创建人: {{ instruction.createBy }}
              </el-text>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredInstructions.length === 0" class="empty-state">
      <el-empty description="暂无指令数据">
        <el-button type="primary" @click="openCreateDialog">下达第一个指令</el-button>
      </el-empty>
    </div>

    <!-- 新建指令对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="下达新指令"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="指令类型" required>
          <el-radio-group v-model="formData.type">
            <el-radio value="maintenance">设备维修</el-radio>
            <el-radio value="optimization">能效优化</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="目标设备" required>
          <el-select v-model="formData.deviceId" placeholder="选择设备" style="width: 100%">
            <el-option
              v-for="device in devices"
              :key="device.id"
              :label="`${device.name} (${device.location})`"
              :value="device.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="指令标题" required>
          <el-input
            v-model="formData.title"
            placeholder="请输入指令标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="指令描述" required>
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请详细描述指令内容"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="优先级">
          <el-select v-model="formData.priority" style="width: 200px">
            <el-option
              v-for="option in priorityOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="目标完成时间">
          <el-date-picker
            v-model="formData.targetDate"
            type="date"
            placeholder="选择目标完成时间"
            style="width: 200px"
            :disabled-date="(time) => time.getTime() < Date.now() - 8.64e7"
          />
        </el-form-item>

        <el-form-item label="执行人员" required>
          <el-select v-model="formData.assignedTo" placeholder="选择执行人员" style="width: 200px">
            <el-option
              v-for="tech in technicians"
              :key="tech.id"
              :label="`${tech.name} (${tech.specialty})`"
              :value="tech.id"
            />
          </el-select>
        </el-form-item>

        <!-- 参数设置（优化指令） -->
        <el-form-item v-if="formData.type === 'optimization'" label="参数调整">
          <div class="parameters-config">
            <div
              v-for="(param, index) in formData.parameters"
              :key="index"
              class="parameter-config"
            >
              <el-input
                v-model="param.name"
                placeholder="参数名称"
                style="width: 120px"
              />
              <el-input
                v-model="param.currentValue"
                placeholder="当前值"
                style="width: 100px"
              />
              <span>→</span>
              <el-input
                v-model="param.targetValue"
                placeholder="目标值"
                style="width: 100px"
              />
              <el-input
                v-model="param.unit"
                placeholder="单位"
                style="width: 80px"
              />
              <el-button type="danger" text @click="removeParameter(index)">
                删除
              </el-button>
            </div>
            <el-button type="primary" text @click="addParameter">
              添加参数
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="loading" @click="saveInstruction">
            下达指令
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.device-instructions {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #f5f7fa;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-left h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.subtitle {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.instructions-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.instruction-card {
  transition: all 0.3s;
}

.instruction-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.instruction-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.instruction-title {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.instruction-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.instruction-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.content-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
}

.content-item.full-width {
  flex: 1;
  min-width: 100%;
  flex-direction: column;
  align-items: flex-start;
}

.content-item label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.description {
  margin: 4px 0 0 0;
  color: #303133;
  line-height: 1.5;
}

.parameters-section {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.parameters-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
}

.parameters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.parameter-item {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}

.param-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.param-values {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-value {
  color: #f56c6c;
  font-weight: 500;
}

.target-value {
  color: #67c23a;
  font-weight: 500;
}

.instruction-footer {
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.parameters-config {
  width: 100%;
}

.parameter-config {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .filter-section {
    flex-direction: column;
    gap: 12px;
  }

  .content-row {
    flex-direction: column;
    gap: 8px;
  }

  .content-item {
    min-width: auto;
  }

  .parameters-grid {
    grid-template-columns: 1fr;
  }
}
</style>
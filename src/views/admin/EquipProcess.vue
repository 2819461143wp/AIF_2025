<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 状态管理
const loading = ref(false)
const activeTab = ref('pending')
const searchKeyword = ref('')
const selectedDevice = ref('')

// 数据
const workOrders = ref([])
const devices = ref([])
const instructions = ref([])

// 表单数据
const reportForm = ref({
  instructionId: '',
  status: '',
  workHours: '',
  materials: [],
  images: [],
  description: '',
  issues: '',
  suggestions: '',
})

// 物料使用表单
const materialForm = ref({
  name: '',
  quantity: '',
  unit: '',
  cost: '',
})

// 工作状态选项
const statusOptions = [
  { label: '进行中', value: 'in_progress', type: 'primary' },
  { label: '已完成', value: 'completed', type: 'success' },
  { label: '需要支援', value: 'need_help', type: 'warning' },
  { label: '暂停', value: 'paused', type: 'info' },
]

// 过滤待执行的指令
const pendingInstructions = computed(() => {
  return instructions.value.filter(
    (instruction) => instruction.status === 'pending' || instruction.status === 'in_progress',
  )
})

// 过滤工单
const filteredWorkOrders = computed(() => {
  let result = workOrders.value

  // 根据选项卡筛选
  if (activeTab.value === 'pending') {
    result = result.filter(
      (order) => order.status === 'in_progress' || order.status === 'need_help',
    )
  } else if (activeTab.value === 'completed') {
    result = result.filter((order) => order.status === 'completed')
  }

  // 根据设备筛选
  if (selectedDevice.value) {
    result = result.filter((order) => {
      const instruction = instructions.value.find((inst) => inst.id === order.instructionId)
      return instruction?.deviceId === selectedDevice.value
    })
  }

  // 根据关键词搜索
  if (searchKeyword.value) {
    result = result.filter((order) => {
      const instruction = instructions.value.find((inst) => inst.id === order.instructionId)
      return (
        instruction?.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        order.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
      )
    })
  }

  return result
})

// 初始化数据
const initData = () => {
  // 设备数据
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

  // 指令数据
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
      createTime: '2024-08-19 14:30:00',
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
    }
  ]

  // 工单数据
  workOrders.value = [
    {
      id: '1',
      instructionId: '2',
      status: 'in_progress',
      workHours: 4,
      materials: [
        { name: '绝缘胶带', quantity: 2, unit: '卷', cost: 25 },
        { name: '保险丝', quantity: 5, unit: '个', cost: 40 },
      ],
      description: '已完成短路故障点定位，正在进行线路修复',
      issues: '发现部分线路老化严重，需要更换',
      suggestions: '建议全面检查线路绝缘状况',
      images: [],
      reportTime: '2024-08-20 14:30:00',
      reportBy: '赵工程师',
    },
  ]
}

// 提交工单报告
const submitReport = async () => {
  if (!reportForm.value.instructionId) {
    ElMessage.error('请选择对应的指令')
    return
  }
  if (!reportForm.value.description.trim()) {
    ElMessage.error('请填写工作描述')
    return
  }

  loading.value = true
  try {
    const newReport = {
      id: Date.now().toString(),
      ...reportForm.value,
      reportTime: new Date().toLocaleString(),
      reportBy: '当前用户',
    }
    workOrders.value.unshift(newReport)

    // 更新指令状态
    const instruction = instructions.value.find(
      (inst) => inst.id === reportForm.value.instructionId,
    )
    if (instruction) {
      instruction.status = reportForm.value.status === 'completed' ? 'completed' : 'in_progress'
    }

    ElMessage.success('工单提交成功')
    resetForm()
  } catch (error) {
    ElMessage.error('提交失败')
  } finally {
    loading.value = false
  }
}

// 添加物料
const addMaterial = () => {
  if (!materialForm.value.name || !materialForm.value.quantity) {
    ElMessage.error('请填写物料名称和数量')
    return
  }

  reportForm.value.materials.push({
    ...materialForm.value,
    quantity: Number(materialForm.value.quantity),
    cost: Number(materialForm.value.cost) || 0,
  })

  materialForm.value = {
    name: '',
    quantity: '',
    unit: '',
    cost: '',
  }
}

// 删除物料
const removeMaterial = (index) => {
  reportForm.value.materials.splice(index, 1)
}

// 重置表单
const resetForm = () => {
  reportForm.value = {
    instructionId: '',
    status: '',
    workHours: '',
    materials: [],
    images: [],
    description: '',
    issues: '',
    suggestions: '',
  }
}

// 获取指令信息
const getInstruction = (instructionId) => {
  return instructions.value.find((inst) => inst.id === instructionId)
}

// 获取设备信息
const getDevice = (deviceId) => {
  return devices.value.find((dev) => dev.id === deviceId)
}

// 获取状态信息
const getStatusInfo = (status) => {
  return statusOptions.find((opt) => opt.value === status) || { label: status, type: 'default' }
}

// 计算总成本
const getTotalCost = (materials) => {
  return materials.reduce((total, material) => total + (material.cost || 0), 0)
}

// 组件挂载时初始化数据
onMounted(() => {
  initData()
})
</script>

<template>
  <div class="work-order-report">
    <!-- 头部操作区 -->
    <div class="header-section">
      <div class="header-left">
        <h2>工单上报</h2>
        <p class="subtitle">上报工作进度和完成情况</p>
      </div>
    </div>

    <!-- 选项卡 -->
    <el-tabs v-model="activeTab" class="report-tabs">
      <el-tab-pane label="工作上报" name="report">
        <!-- 工单上报表单 -->
        <div class="report-form-section">
          <el-card class="form-card">
            <template #header>
              <h3>新建工单报告</h3>
            </template>

            <el-form :model="reportForm" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="对应指令" required>
                    <el-select
                      v-model="reportForm.instructionId"
                      placeholder="选择要报告的指令"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="instruction in pendingInstructions"
                        :key="instruction.id"
                        :label="instruction.title"
                        :value="instruction.id"
                      >
                        <div class="instruction-option">
                          <span>{{ instruction.title }}</span>
                          <el-tag
                            size="small"
                            :type="instruction.type === 'maintenance' ? 'warning' : 'success'"
                          >
                            {{ instruction.type === 'maintenance' ? '维修' : '优化' }}
                          </el-tag>
                        </div>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="工作状态" required>
                    <el-select v-model="reportForm.status" placeholder="选择工作状态">
                      <el-option
                        v-for="option in statusOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="工作时长(小时)">
                    <el-input-number
                      v-model="reportForm.workHours"
                      :min="0"
                      :max="24"
                      :precision="1"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="工作描述" required>
                <el-input
                  v-model="reportForm.description"
                  type="textarea"
                  placeholder="详细描述本次工作内容和进展"
                  :rows="4"
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="遇到的问题">
                <el-input
                  v-model="reportForm.issues"
                  type="textarea"
                  placeholder="描述工作中遇到的问题或困难"
                  :rows="3"
                  maxlength="300"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="建议或意见">
                <el-input
                  v-model="reportForm.suggestions"
                  type="textarea"
                  placeholder="对后续工作的建议或改进意见"
                  :rows="3"
                  maxlength="300"
                  show-word-limit
                />
              </el-form-item>

              <!-- 物料使用 -->
              <el-form-item label="使用物料">
                <div class="materials-section">
                  <div class="material-input">
                    <el-input
                      v-model="materialForm.name"
                      placeholder="物料名称"
                      style="width: 150px"
                    />
                    <el-input-number
                      v-model="materialForm.quantity"
                      placeholder="数量"
                      :min="0"
                      style="width: 100px"
                    />
                    <el-input v-model="materialForm.unit" placeholder="单位" style="width: 80px" />
                    <el-input-number
                      v-model="materialForm.cost"
                      placeholder="成本"
                      :min="0"
                      :precision="2"
                      style="width: 100px"
                    />
                    <el-button type="primary" @click="addMaterial">添加</el-button>
                  </div>

                  <div v-if="reportForm.materials.length > 0" class="materials-list">
                    <el-table :data="reportForm.materials" size="small">
                      <el-table-column prop="name" label="物料名称" />
                      <el-table-column prop="quantity" label="数量" width="80" />
                      <el-table-column prop="unit" label="单位" width="80" />
                      <el-table-column prop="cost" label="成本(元)" width="100">
                        <template #default="{ row }">
                          {{ row.cost ? row.cost.toFixed(2) : '-' }}
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="80">
                        <template #default="{ $index }">
                          <el-button
                            type="danger"
                            size="small"
                            text
                            @click="removeMaterial($index)"
                          >
                            删除
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                    <div class="total-cost">
                      总成本: {{ getTotalCost(reportForm.materials).toFixed(2) }} 元
                    </div>
                  </div>
                </div>
              </el-form-item>

              <!-- 图片上传 -->
              <el-form-item label="现场照片">
                <el-upload
                  class="upload-demo"
                  action="#"
                  list-type="picture-card"
                  :auto-upload="false"
                  multiple
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
                <div class="upload-tip">支持jpg、png格式，单张不超过5MB</div>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" :loading="loading" @click="submitReport">
                  提交报告
                </el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="进行中工单" name="pending">
        <!-- 筛选区域 -->
        <div class="filter-section">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索指令标题或工作描述"
            style="width: 250px"
            :prefix-icon="Search"
            clearable
          />
          <el-select v-model="selectedDevice" placeholder="筛选设备" style="width: 200px" clearable>
            <el-option
              v-for="device in devices"
              :key="device.id"
              :label="device.name"
              :value="device.id"
            />
          </el-select>
        </div>

        <!-- 工单列表 -->
        <div class="work-orders-list">
          <el-card
            v-for="order in filteredWorkOrders"
            :key="order.id"
            class="work-order-card"
            shadow="hover"
          >
            <div class="order-header">
              <div class="order-info">
                <h3 class="order-title">
                  {{ getInstruction(order.instructionId)?.title }}
                </h3>
                <div class="order-meta">
                  <el-tag
                    :type="
                      getInstruction(order.instructionId)?.type === 'maintenance'
                        ? 'warning'
                        : 'success'
                    "
                    size="small"
                  >
                    {{
                      getInstruction(order.instructionId)?.type === 'maintenance'
                        ? '维修工单'
                        : '优化工单'
                    }}
                  </el-tag>
                  <el-tag :type="getStatusInfo(order.status).type" size="small">
                    {{ getStatusInfo(order.status).label }}
                  </el-tag>
                  <span class="work-hours">工时: {{ order.workHours }}小时</span>
                </div>
              </div>
            </div>

            <div class="order-content">
              <div class="device-info">
                <el-icon><Monitor /></el-icon>
                <span
                  >设备: {{ getDevice(getInstruction(order.instructionId)?.deviceId)?.name }}</span
                >
              </div>

              <div class="work-description">
                <h4>工作描述</h4>
                <p>{{ order.description }}</p>
              </div>

              <div v-if="order.issues" class="issues-section">
                <h4>遇到的问题</h4>
                <p class="issues">{{ order.issues }}</p>
              </div>

              <div v-if="order.suggestions" class="suggestions-section">
                <h4>建议意见</h4>
                <p class="suggestions">{{ order.suggestions }}</p>
              </div>

              <div v-if="order.materials.length > 0" class="materials-used">
                <h4>使用物料</h4>
                <div class="materials-grid">
                  <div
                    v-for="material in order.materials"
                    :key="material.name"
                    class="material-item"
                  >
                    <span class="material-name">{{ material.name }}</span>
                    <span class="material-quantity"
                      >{{ material.quantity }}{{ material.unit }}</span
                    >
                    <span class="material-cost">¥{{ material.cost.toFixed(2) }}</span>
                  </div>
                </div>
                <div class="total-cost">
                  总成本: ¥{{ getTotalCost(order.materials).toFixed(2) }}
                </div>
              </div>

              <div class="order-footer">
                <el-text size="small" type="info">
                  上报时间: {{ order.reportTime }} | 上报人: {{ order.reportBy }}
                </el-text>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredWorkOrders.length === 0" class="empty-state">
          <el-empty description="暂无工单数据" />
        </div>
      </el-tab-pane>

      <el-tab-pane label="已完成工单" name="completed">
        <!-- 已完成工单内容，类似进行中工单 -->
        <div class="filter-section">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索指令标题或工作描述"
            style="width: 250px"
            :prefix-icon="Search"
            clearable
          />
          <el-select v-model="selectedDevice" placeholder="筛选设备" style="width: 200px" clearable>
            <el-option
              v-for="device in devices"
              :key="device.id"
              :label="device.name"
              :value="device.id"
            />
          </el-select>
        </div>

        <div class="work-orders-list">
          <el-card
            v-for="order in filteredWorkOrders"
            :key="order.id"
            class="work-order-card completed"
            shadow="hover"
          >
            <!-- 与进行中工单类似的结构 -->
            <div class="order-header">
              <div class="order-info">
                <h3 class="order-title">
                  {{ getInstruction(order.instructionId)?.title }}
                </h3>
                <div class="order-meta">
                  <el-tag type="success" size="small">已完成</el-tag>
                  <span class="work-hours">工时: {{ order.workHours }}小时</span>
                </div>
              </div>
            </div>
            <!-- 其他内容结构相同 -->
          </el-card>
        </div>

        <div v-if="filteredWorkOrders.length === 0" class="empty-state">
          <el-empty description="暂无已完成工单" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.work-order-report {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #f5f7fa;
}

.header-section {
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-section h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.subtitle {
  margin: 5px 0 0 0;
  color: #909399;
  font-size: 14px;
}

.report-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.report-tabs .el-tabs__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.report-tabs .el-tab-pane) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-card {
  margin-bottom: 20px;
}

.instruction-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.materials-section {
  width: 100%;
}

.material-input {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.materials-list {
  margin-top: 16px;
}

.total-cost {
  margin-top: 8px;
  text-align: right;
  font-weight: 500;
  color: #409eff;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
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

.work-orders-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.work-order-card {
  transition: all 0.3s;
}

.work-order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.work-order-card.completed {
  border-left: 4px solid #67c23a;
}

.order-header {
  margin-bottom: 16px;
}

.order-title {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.order-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.work-hours {
  color: #606266;
  font-size: 14px;
}

.order-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-weight: 500;
}

.work-description h4,
.issues-section h4,
.suggestions-section h4,
.materials-used h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.work-description p {
  margin: 0;
  color: #606266;
  line-height: 1.5;
}

.issues {
  margin: 0;
  color: #f56c6c;
  line-height: 1.5;
}

.suggestions {
  margin: 0;
  color: #409eff;
  line-height: 1.5;
}

.materials-used {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.materials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.material-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.material-name {
  font-weight: 500;
  color: #303133;
}

.material-quantity {
  color: #606266;
}

.material-cost {
  color: #67c23a;
  font-weight: 500;
}

.order-footer {
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .material-input {
    flex-direction: column;
    align-items: stretch;
  }

  .materials-grid {
    grid-template-columns: 1fr;
  }

  .filter-section {
    flex-direction: column;
    gap: 12px;
  }
}
</style>

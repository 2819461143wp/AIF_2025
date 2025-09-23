<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 状态管理
const loading = ref(false)
const searchKeyword = ref('')
const selectedDevice = ref('')
const selectedStatus = ref('')
const selectedType = ref('')
const selectedPriority = ref('')
const dateRange = ref([])

// 数据
const workOrders = ref([])
const instructions = ref([])
const devices = ref([])
const technicians = ref([])
const statistics = ref({})

// 详情对话框
const detailDialogVisible = ref(false)
const selectedWorkOrder = ref({})

// 状态选项
const statusOptions = [
  { label: '待执行', value: 'pending', type: 'warning' },
  { label: '执行中', value: 'in_progress', type: 'primary' },
  { label: '已完成', value: 'completed', type: 'success' },
  { label: '需要支援', value: 'need_help', type: 'danger' },
  { label: '已暂停', value: 'paused', type: 'info' },
  { label: '已取消', value: 'cancelled', type: 'info' },
]

// 优先级选项
const priorityOptions = [
  { label: '低', value: 'low', type: 'info' },
  { label: '中', value: 'medium', type: 'warning' },
  { label: '高', value: 'high', type: 'danger' },
  { label: '紧急', value: 'urgent', type: 'danger' },
]

// 类型选项
const typeOptions = [
  { label: '维修工单', value: 'maintenance', type: 'warning' },
  { label: '优化工单', value: 'optimization', type: 'success' },
]

// 过滤后的工单列表
const filteredWorkOrders = computed(() => {
  let result = workOrders.value

  // 设备筛选
  if (selectedDevice.value) {
    result = result.filter((order) => {
      const instruction = instructions.value.find((inst) => inst.id === order.instructionId)
      return instruction?.deviceId === selectedDevice.value
    })
  }

  // 状态筛选
  if (selectedStatus.value) {
    result = result.filter((order) => order.status === selectedStatus.value)
  }

  // 类型筛选
  if (selectedType.value) {
    result = result.filter((order) => {
      const instruction = instructions.value.find((inst) => inst.id === order.instructionId)
      return instruction?.type === selectedType.value
    })
  }

  // 优先级筛选
  if (selectedPriority.value) {
    result = result.filter((order) => {
      const instruction = instructions.value.find((inst) => inst.id === order.instructionId)
      return instruction?.priority === selectedPriority.value
    })
  }

  // 关键词搜索
  if (searchKeyword.value) {
    result = result.filter((order) => {
      const instruction = instructions.value.find((inst) => inst.id === order.instructionId)
      const device = devices.value.find((dev) => dev.id === instruction?.deviceId)
      return (
        instruction?.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        order.description.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        device?.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
      )
    })
  }

  // 时间范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    result = result.filter((order) => {
      const reportTime = new Date(order.reportTime)
      return reportTime >= startDate && reportTime <= endDate
    })
  }

  return result
})

// 统计数据
const statisticsData = computed(() => {
  const total = workOrders.value.length
  const pending = workOrders.value.filter((order) => order.status === 'pending').length
  const inProgress = workOrders.value.filter((order) => order.status === 'in_progress').length
  const completed = workOrders.value.filter((order) => order.status === 'completed').length
  const needHelp = workOrders.value.filter((order) => order.status === 'need_help').length

  const maintenanceOrders = workOrders.value.filter((order) => {
    const instruction = instructions.value.find((inst) => inst.id === order.instructionId)
    return instruction?.type === 'maintenance'
  }).length

  const optimizationOrders = workOrders.value.filter((order) => {
    const instruction = instructions.value.find((inst) => inst.id === order.instructionId)
    return instruction?.type === 'optimization'
  }).length

  const totalHours = workOrders.value.reduce((sum, order) => sum + (order.workHours || 0), 0)
  const totalCost = workOrders.value.reduce((sum, order) => {
    return sum + (order.materials?.reduce((matSum, mat) => matSum + (mat.cost || 0), 0) || 0)
  }, 0)

  return {
    total,
    pending,
    inProgress,
    completed,
    needHelp,
    maintenanceOrders,
    optimizationOrders,
    totalHours,
    totalCost,
    completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
  }
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

  // 技师数据
  technicians.value = [
    { id: '1', name: '张技师', specialty: '机械维修' },
    { id: '2', name: '李工程师', specialty: '电气维修' },
    { id: '3', name: '王技师', specialty: '自动化调试' },
    { id: '4', name: '赵工程师', specialty: '能效优化' },
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
      status: 'completed',
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
      status: 'need_help',
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
      instructionId: '1',
      status: 'completed',
      workHours: 6,
      materials: [
        { name: '绝缘测试仪', quantity: 1, unit: '台', cost: 200 },
        { name: '绝缘胶带', quantity: 3, unit: '卷', cost: 45 },
      ],
      description: '已完成漏电检测和线路绝缘修复，设备运行正常',
      issues: '发现部分线路绝缘老化',
      suggestions: '建议定期进行绝缘检测',
      images: [],
      reportTime: '2024-08-22 16:30:00',
      reportBy: '张技师',
    },
    {
      id: '2',
      instructionId: '2',
      status: 'in_progress',
      workHours: 4,
      materials: [{ name: '保险丝', quantity: 5, unit: '个', cost: 40 }],
      description: '已完成短路故障点定位，正在进行线路修复',
      issues: '发现多处线路老化严重',
      suggestions: '建议全面更换老化线路',
      images: [],
      reportTime: '2024-08-23 14:30:00',
      reportBy: '赵工程师',
    },
    {
      id: '3',
      instructionId: '3',
      status: 'pending',
      workHours: 0,
      materials: [],
      description: '',
      issues: '',
      suggestions: '',
      images: [],
      reportTime: '',
      reportBy: '',
    },
    {
      id: '4',
      instructionId: '4',
      status: 'need_help',
      workHours: 2,
      materials: [],
      description: '电压检测完成，发现供电系统存在不稳定问题',
      issues: '电压波动超出安全范围，需要专业电力工程师支援',
      suggestions: '建议安装稳压设备',
      images: [],
      reportTime: '2024-08-21 11:45:00',
      reportBy: '王技师',
    },
    {
      id: '5',
      instructionId: '5',
      status: 'pending',
      workHours: 0,
      materials: [],
      description: '',
      issues: '',
      suggestions: '',
      images: [],
      reportTime: '',
      reportBy: '',
    }
  ]
}

// 查看工单详情
const viewWorkOrderDetail = (workOrder) => {
  selectedWorkOrder.value = {
    ...workOrder,
    instruction: instructions.value.find((inst) => inst.id === workOrder.instructionId),
    device: devices.value.find((dev) => {
      const instruction = instructions.value.find((inst) => inst.id === workOrder.instructionId)
      return dev.id === instruction?.deviceId
    }),
    technician: technicians.value.find((tech) => {
      const instruction = instructions.value.find((inst) => inst.id === workOrder.instructionId)
      return tech.id === instruction?.assignedTo
    }),
  }
  detailDialogVisible.value = true
}

// 导出工单数据
const exportWorkOrders = () => {
  ElMessage.success('导出功能开发中...')
}

// 获取状态信息
const getStatusInfo = (status) => {
  return statusOptions.find((opt) => opt.value === status) || { label: status, type: 'default' }
}

// 获取优先级信息
const getPriorityInfo = (priority) => {
  return (
    priorityOptions.find((opt) => opt.value === priority) || { label: priority, type: 'default' }
  )
}

// 获取类型信息
const getTypeInfo = (type) => {
  return typeOptions.find((opt) => opt.value === type) || { label: type, type: 'default' }
}

// 获取设备信息
const getDevice = (deviceId) => {
  return devices.value.find((dev) => dev.id === deviceId)
}

// 获取指令信息
const getInstruction = (instructionId) => {
  return instructions.value.find((inst) => inst.id === instructionId)
}

// 获取技师信息
const getTechnician = (techId) => {
  return technicians.value.find((tech) => tech.id === techId)
}

// 计算材料总成本
const getTotalCost = (materials) => {
  return materials?.reduce((total, material) => total + (material.cost || 0), 0) || 0
}

// 清空筛选条件
const clearFilters = () => {
  searchKeyword.value = ''
  selectedDevice.value = ''
  selectedStatus.value = ''
  selectedType.value = ''
  selectedPriority.value = ''
  dateRange.value = []
}

// 组件挂载时初始化数据
onMounted(() => {
  initData()
})
</script>

<template>
  <div class="work-order-overview">
    <!-- 头部操作区 -->
    <div class="header-section">
      <div class="header-left">
        <h2>工单总览</h2>
        <p class="subtitle">查看和管理所有设备工单</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="exportWorkOrders">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="statistics-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ statisticsData.total }}</div>
              <div class="stat-label">总工单数</div>
            </div>
            <div class="stat-icon total">
              <el-icon><Document /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ statisticsData.inProgress }}</div>
              <div class="stat-label">进行中</div>
            </div>
            <div class="stat-icon progress">
              <el-icon><Loading /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ statisticsData.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
            <div class="stat-icon completed">
              <el-icon><CircleCheck /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ statisticsData.completionRate }}%</div>
              <div class="stat-label">完成率</div>
            </div>
            <div class="stat-icon rate">
              <el-icon><TrendCharts /></el-icon>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ statisticsData.totalHours }}</div>
              <div class="stat-label">总工时(小时)</div>
            </div>
            <div class="stat-icon hours">
              <el-icon><Clock /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ statisticsData.maintenanceOrders }}</div>
              <div class="stat-label">维修工单</div>
            </div>
            <div class="stat-icon maintenance">
              <el-icon><Tools /></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">¥{{ statisticsData.totalCost.toFixed(0) }}</div>
              <div class="stat-label">总成本</div>
            </div>
            <div class="stat-icon cost">
              <el-icon><Money /></el-icon>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索工单标题、描述或设备"
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
        <el-select v-model="selectedStatus" placeholder="筛选状态" style="width: 150px" clearable>
          <el-option
            v-for="status in statusOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
        <el-select v-model="selectedType" placeholder="筛选类型" style="width: 150px" clearable>
          <el-option
            v-for="type in typeOptions"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </div>
      <div class="filter-row">
        <el-select
          v-model="selectedPriority"
          placeholder="筛选优先级"
          style="width: 150px"
          clearable
        >
          <el-option
            v-for="priority in priorityOptions"
            :key="priority.value"
            :label="priority.label"
            :value="priority.value"
          />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 300px"
        />
        <el-button @click="clearFilters">清空筛选</el-button>
      </div>
    </div>

    <!-- 工单列表 -->
    <div class="work-orders-list">
      <el-card
        v-for="workOrder in filteredWorkOrders"
        :key="workOrder.id"
        class="work-order-card"
        shadow="hover"
        @click="viewWorkOrderDetail(workOrder)"
      >
        <div class="order-header">
          <div class="order-info">
            <h3 class="order-title">
              {{ getInstruction(workOrder.instructionId)?.title }}
            </h3>
            <div class="order-meta">
              <el-tag
                :type="getTypeInfo(getInstruction(workOrder.instructionId)?.type).type"
                size="small"
              >
                {{ getTypeInfo(getInstruction(workOrder.instructionId)?.type).label }}
              </el-tag>
              <el-tag :type="getStatusInfo(workOrder.status).type" size="small">
                {{ getStatusInfo(workOrder.status).label }}
              </el-tag>
              <el-tag
                :type="getPriorityInfo(getInstruction(workOrder.instructionId)?.priority).type"
                size="small"
              >
                {{ getPriorityInfo(getInstruction(workOrder.instructionId)?.priority).label }}优先级
              </el-tag>
            </div>
          </div>
          <div class="order-actions">
            <el-button type="primary" size="small" text> 查看详情 </el-button>
          </div>
        </div>

        <div class="order-content">
          <div class="content-row">
            <div class="content-item">
              <el-icon><Monitor /></el-icon>
              <span>{{ getDevice(getInstruction(workOrder.instructionId)?.deviceId)?.name }}</span>
            </div>
            <div class="content-item">
              <el-icon><User /></el-icon>
              <span>{{
                getTechnician(getInstruction(workOrder.instructionId)?.assignedTo)?.name
              }}</span>
            </div>
            <div class="content-item">
              <el-icon><Clock /></el-icon>
              <span>{{ workOrder.workHours || 0 }}小时</span>
            </div>
            <div class="content-item">
              <el-icon><Money /></el-icon>
              <span>¥{{ getTotalCost(workOrder.materials).toFixed(2) }}</span>
            </div>
          </div>

          <div v-if="workOrder.description" class="work-description">
            <p>{{ workOrder.description }}</p>
          </div>

          <div v-if="workOrder.issues" class="issues-section">
            <el-text type="danger" size="small">
              <el-icon><Warning /></el-icon>
              {{ workOrder.issues }}
            </el-text>
          </div>

          <div class="order-footer">
            <div class="time-info">
              <el-text size="small" type="info">
                目标完成: {{ getInstruction(workOrder.instructionId)?.targetDate }}
              </el-text>
              <el-text v-if="workOrder.reportTime" size="small" type="info">
                最后更新: {{ workOrder.reportTime }}
              </el-text>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredWorkOrders.length === 0" class="empty-state">
      <el-empty description="暂无工单数据" />
    </div>

    <!-- 工单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="工单详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedWorkOrder.instruction" class="detail-content">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3>基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="工单类型">
              <el-tag :type="getTypeInfo(selectedWorkOrder.instruction.type).type">
                {{ getTypeInfo(selectedWorkOrder.instruction.type).label }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="工单状态">
              <el-tag :type="getStatusInfo(selectedWorkOrder.status).type">
                {{ getStatusInfo(selectedWorkOrder.status).label }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="优先级">
              <el-tag :type="getPriorityInfo(selectedWorkOrder.instruction.priority).type">
                {{ getPriorityInfo(selectedWorkOrder.instruction.priority).label }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="工作时长">
              {{ selectedWorkOrder.workHours || 0 }}小时
            </el-descriptions-item>
            <el-descriptions-item label="设备名称">
              {{ selectedWorkOrder.device?.name }}
            </el-descriptions-item>
            <el-descriptions-item label="设备位置">
              {{ selectedWorkOrder.device?.location }}
            </el-descriptions-item>
            <el-descriptions-item label="执行人员">
              {{ selectedWorkOrder.technician?.name }}
            </el-descriptions-item>
            <el-descriptions-item label="专业领域">
              {{ selectedWorkOrder.technician?.specialty }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 工作内容 -->
        <div class="detail-section">
          <h3>工作内容</h3>
          <div class="content-block">
            <h4>指令描述</h4>
            <p>{{ selectedWorkOrder.instruction.description }}</p>
          </div>
          <div v-if="selectedWorkOrder.description" class="content-block">
            <h4>工作描述</h4>
            <p>{{ selectedWorkOrder.description }}</p>
          </div>
          <div v-if="selectedWorkOrder.issues" class="content-block">
            <h4>遇到的问题</h4>
            <p class="issues-text">{{ selectedWorkOrder.issues }}</p>
          </div>
          <div v-if="selectedWorkOrder.suggestions" class="content-block">
            <h4>建议意见</h4>
            <p class="suggestions-text">{{ selectedWorkOrder.suggestions }}</p>
          </div>
        </div>

        <!-- 使用物料 -->
        <div v-if="selectedWorkOrder.materials?.length" class="detail-section">
          <h3>使用物料</h3>
          <el-table :data="selectedWorkOrder.materials" style="width: 100%">
            <el-table-column prop="name" label="物料名称" />
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="cost" label="成本(元)" width="120">
              <template #default="{ row }"> ¥{{ row.cost?.toFixed(2) || '0.00' }} </template>
            </el-table-column>
          </el-table>
          <div class="total-cost">
            总成本: ¥{{ getTotalCost(selectedWorkOrder.materials).toFixed(2) }}
          </div>
        </div>

        <!-- 时间信息 -->
        <div class="detail-section">
          <h3>时间信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="指令创建时间">
              {{ selectedWorkOrder.instruction.createTime }}
            </el-descriptions-item>
            <el-descriptions-item label="目标完成时间">
              {{ selectedWorkOrder.instruction.targetDate }}
            </el-descriptions-item>
            <el-descriptions-item label="最后上报时间">
              {{ selectedWorkOrder.reportTime || '暂无' }}
            </el-descriptions-item>
            <el-descriptions-item label="上报人员">
              {{ selectedWorkOrder.reportBy || '暂无' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.work-order-overview {
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

.statistics-section {
  margin-bottom: 20px;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

:deep(.stat-card .el-card__body) {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-label {
  margin-top: 8px;
  color: #909399;
  font-size: 14px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.stat-icon.progress {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
.stat-icon.completed {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
.stat-icon.rate {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}
.stat-icon.hours {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}
.stat-icon.maintenance {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}
.stat-icon.cost {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.filter-section {
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.filter-row:last-child {
  margin-bottom: 0;
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
  cursor: pointer;
}

.work-order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.order-content {
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
  gap: 6px;
  color: #606266;
  font-size: 14px;
}

.work-description p {
  margin: 0;
  color: #606266;
  line-height: 1.5;
}

.issues-section {
  padding: 8px 12px;
  background: #fef0f0;
  border-left: 4px solid #f56c6c;
  border-radius: 4px;
}

.order-footer {
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.time-info {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.detail-content {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 18px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.content-block {
  margin-bottom: 16px;
}

.content-block h4 {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
  font-weight: 600;
}

.content-block p {
  margin: 0;
  color: #303133;
  line-height: 1.6;
}

.issues-text {
  color: #f56c6c !important;
}

.suggestions-text {
  color: #409eff !important;
}

.total-cost {
  margin-top: 12px;
  text-align: right;
  font-weight: 600;
  color: #409eff;
  font-size: 16px;
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

  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .content-row {
    flex-direction: column;
    gap: 8px;
  }

  .time-info {
    flex-direction: column;
    gap: 8px;
  }

  :deep(.el-descriptions) {
    display: block;
  }
}
</style>

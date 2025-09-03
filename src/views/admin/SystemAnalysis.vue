<template>
  <div class="system-analysis">
    <!-- 头部标题 -->
    <div class="header">
      <h1>电力负载设备故障诊断监控大屏</h1>
      <div class="time">{{ currentTime }}</div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 负载设备状态监控 -->
      <div class="device-status-section">
        <h3>负载设备实时状态监控</h3>
        <div class="device-grid">
          <div
            v-for="device in deviceStatus"
            :key="device.id"
            :class="['device-item', device.status]"
            @click="showDeviceDetail(device)"
          >
            <div class="device-id">{{ device.id }}</div>
            <div class="device-params">
              <div>{{ device.voltage }}V</div>
              <div>{{ device.current }}A</div>
              <div>{{ device.power }}W</div>
            </div>
            <div class="device-status-indicator">{{ device.statusText }}</div>
          </div>
        </div>
      </div>

      <!-- 底部信息面板 -->
      <div class="bottom-panels">
        <!-- 电路参数监控 -->
        <div class="circuit-monitor">
          <h3>电路参数实时监控</h3>
          <div class="circuit-params">
            <div class="param-item">
              <div class="param-label">总电压</div>
              <div class="param-value" :class="getVoltageClass(circuitParams.totalVoltage)">
                {{ circuitParams.totalVoltage }}V
              </div>
            </div>
            <div class="param-item">
              <div class="param-label">零线电流</div>
              <div class="param-value" :class="getCurrentClass(circuitParams.neutralCurrent)">
                {{ circuitParams.neutralCurrent }}A
              </div>
            </div>
            <div class="param-item">
              <div class="param-label">火线电流</div>
              <div class="param-value">{{ circuitParams.liveCurrent }}A</div>
            </div>
            <div class="param-item">
              <div class="param-label">电流矢量和</div>
              <div class="param-value" :class="getLeakageClass(circuitParams.currentVectorSum)">
                {{ circuitParams.currentVectorSum }}A
              </div>
            </div>
            <div class="param-item">
              <div class="param-label">系统频率</div>
              <div class="param-value">{{ circuitParams.frequency }}Hz</div>
            </div>
            <div class="param-item">
              <div class="param-label">功率因数</div>
              <div class="param-value">{{ circuitParams.powerFactor }}</div>
            </div>
          </div>
        </div>

        <!-- 设备运行统计 -->
        <div class="device-stats">
          <h3>设备运行统计</h3>
          <div class="stats-grid">
            <div class="stats-item running">
              <div class="stats-icon">🟢</div>
              <div class="stats-content">
                <div class="stats-label">运行设备</div>
                <div class="stats-value">{{ runningDevices }}台</div>
              </div>
            </div>
            <div class="stats-item stopped">
              <div class="stats-icon">⚫</div>
              <div class="stats-content">
                <div class="stats-label">关闭设备</div>
                <div class="stats-value">{{ stoppedDevices }}台</div>
              </div>
            </div>
            <div class="stats-item leakage">
              <div class="stats-icon">⚡</div>
              <div class="stats-content">
                <div class="stats-label">漏电故障</div>
                <div class="stats-value">{{ leakageDevices }}台</div>
              </div>
            </div>
            <div class="stats-item short-circuit">
              <div class="stats-icon">🔥</div>
              <div class="stats-content">
                <div class="stats-label">短路故障</div>
                <div class="stats-value">{{ shortCircuitDevices }}台</div>
              </div>
            </div>
            <div class="stats-item overload">
              <div class="stats-icon">⚠️</div>
              <div class="stats-content">
                <div class="stats-label">过载故障</div>
                <div class="stats-value">{{ overloadDevices }}台</div>
              </div>
            </div>
            <div class="stats-item voltage-fault">
              <div class="stats-icon">🔴</div>
              <div class="stats-content">
                <div class="stats-label">电压故障</div>
                <div class="stats-value">{{ voltageFaultDevices }}台</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

// 响应式数据
const currentTime = ref('')
const totalDevices = ref(28) // A0-Z0 + A1, B1

// 电路参数
const circuitParams = ref({
  totalVoltage: 220.5,
  neutralCurrent: 0.8,  // 零线电流，理想情况下应该接近0
  liveCurrent: 85.2,    // 火线电流
  currentVectorSum: 0.8, // 电流矢量和，用于漏电检测
  frequency: 50.0,
  powerFactor: 0.85
})

// 生成设备列表 A0-Z0 + A1, B1
const generateDeviceList = () => {
  const devices = []
  
  // A0-Z0 (26个设备)
  for (let i = 0; i < 26; i++) {
    const deviceId = String.fromCharCode(65 + i) + '0' // A0, B0, C0...Z0
    devices.push(createDevice(deviceId))
  }
  
  // A1, B1
  devices.push(createDevice('A1'))
  devices.push(createDevice('B1'))
  
  return devices
}

// 创建设备对象
const createDevice = (id) => {
  // 只有三种状态：运行、关闭、故障
  const statusTypes = [
    'running',     // 运行
    'stopped',     // 关闭
    'leakage',     // 漏电故障
    'short-circuit', // 短路故障
    'overload',    // 过载故障
    'voltage-fault' // 电压故障(过压/欠压)
  ]
  
  const status = statusTypes[Math.floor(Math.random() * statusTypes.length)]
  
  return {
    id,
    voltage: status === 'stopped' ? 0 : (220 + (Math.random() - 0.5) * 20).toFixed(1),
    current: status === 'stopped' ? 0 : (Math.random() * 20 + 5).toFixed(1),
    power: status === 'stopped' ? 0 : (Math.random() * 3000 + 500).toFixed(0),
    status,
    statusText: getStatusText(status)
  }
}

const getStatusText = (status) => {
  const statusMap = {
    running: '运行',
    stopped: '关闭',
    leakage: '漏电故障',
    'short-circuit': '短路故障',
    overload: '过载故障',
    'voltage-fault': '电压故障'
  }
  return statusMap[status] || '未知'
}

// 设备状态数据
const deviceStatus = ref(generateDeviceList())

// 计算各类型设备数量
const runningDevices = computed(() => 
  deviceStatus.value.filter(device => device.status === 'running').length
)

const stoppedDevices = computed(() => 
  deviceStatus.value.filter(device => device.status === 'stopped').length
)

const leakageDevices = computed(() => 
  deviceStatus.value.filter(device => device.status === 'leakage').length
)

const shortCircuitDevices = computed(() => 
  deviceStatus.value.filter(device => device.status === 'short-circuit').length
)

const overloadDevices = computed(() => 
  deviceStatus.value.filter(device => device.status === 'overload').length
)

const voltageFaultDevices = computed(() => 
  deviceStatus.value.filter(device => device.status === 'voltage-fault').length
)

// 获取电压状态样式
const getVoltageClass = (voltage) => {
  if (voltage > 240 || voltage < 200) return 'fault'
  if (voltage > 230 || voltage < 210) return 'warning'
  return 'normal'
}

// 获取电流状态样式
const getCurrentClass = (current) => {
  if (current > 1.0) return 'fault'
  if (current > 0.5) return 'warning'
  return 'normal'
}

// 获取漏电状态样式
const getLeakageClass = (vectorSum) => {
  if (vectorSum > 0.5) return 'fault'
  if (vectorSum > 0.2) return 'warning'
  return 'normal'
}

// 显示设备详情
const showDeviceDetail = (device) => {
  console.log('设备详情:', device)
}

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN')
}

// 定时器
let timer = null

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.system-analysis {
  background: #f5f5f5;
  min-height: 100vh;
  color: #333;
  padding: 15px;
  font-family: 'Microsoft YaHei', sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-size: 2.2rem;
  background: linear-gradient(45deg, #1976d2, #4caf50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.time {
  font-size: 1.2rem;
  color: #1976d2;
  font-weight: 600;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.device-status-section {
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-top: 4px solid #1976d2;
}

.device-status-section h3 {
  margin: 0 0 20px 0;
  color: #1976d2;
  font-size: 1.3rem;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  max-height: 600px;
  overflow-y: auto;
}

.device-item {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 10px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.device-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* 运行状态 - 蓝色 */
.device-item.running {
  border-color: #2196f3;
  background: #e3f2fd;
}

/* 关闭状态 - 灰色 */
.device-item.stopped {
  border-color: #9e9e9e;
  background: #f5f5f5;
  color: #666;
}

/* 漏电故障 - 橙色 */
.device-item.leakage {
  border-color: #ff9800;
  background: #fff3e0;
  animation: pulse 2s infinite;
}

/* 短路故障 - 红色 */
.device-item.short-circuit {
  border-color: #f44336;
  background: #ffebee;
  animation: pulse 2s infinite;
}

/* 过载故障 - 紫色 */
.device-item.overload {
  border-color: #9c27b0;
  background: #f3e5f5;
  animation: pulse 2s infinite;
}

/* 电压故障 - 深红色 */
.device-item.voltage-fault {
  border-color: #d32f2f;
  background: #ffcdd2;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

.device-id {
  font-weight: bold;
  margin-bottom: 6px;
  color: #333;
  font-size: 0.9rem;
}

.device-params {
  font-size: 0.7rem;
  color: #666;
  margin-bottom: 6px;
  line-height: 1.2;
}

.device-params div {
  margin-bottom: 2px;
}

.device-status-indicator {
  font-size: 0.75rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.bottom-panels {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.circuit-monitor,
.device-stats {
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-top: 4px solid #1976d2;
}

.circuit-monitor h3,
.device-stats h3 {
  margin: 0 0 20px 0;
  color: #1976d2;
  font-size: 1.3rem;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
}

.circuit-params {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.param-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
}

.param-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.param-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: #1976d2;
}

.param-value.normal {
  color: #4caf50;
}

.param-value.warning {
  color: #ff9800;
}

.param-value.fault {
  color: #f44336;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.stats-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.stats-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stats-icon {
  font-size: 1.2rem;
  margin-right: 10px;
}

.stats-content {
  flex: 1;
}

.stats-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 2px;
  font-weight: 500;
}

.stats-value {
  font-size: 1.1rem;
  font-weight: bold;
}

.stats-item.running .stats-value {
  color: #2196f3;
}

.stats-item.stopped .stats-value {
  color: #666;
}

.stats-item.leakage .stats-value {
  color: #ff9800;
}

.stats-item.short-circuit .stats-value {
  color: #f44336;
}

.stats-item.overload .stats-value {
  color: #9c27b0;
}

.stats-item.voltage-fault .stats-value {
  color: #d32f2f;
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .device-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 1400px) {
  .device-grid {
    grid-template-columns: repeat(5, 1fr);
  }
  
  .circuit-params {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1200px) {
  .bottom-panels {
    grid-template-columns: 1fr;
  }
  
  .device-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .circuit-params {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .device-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .circuit-params {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .header h1 {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .device-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .circuit-params {
    grid-template-columns: 1fr;
  }
}
</style>
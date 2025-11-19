<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userStore } from '@/stores/user'

const router = useRouter()
const user = userStore()

// 响应式状态
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)

const handleLogin = async (e) => {
  e.preventDefault()
  loading.value = true
  try {
    const response = await axios.post('/api/user/login', {
      username: username.value,
      password: password.value,
    })
    if (response.status === 200) {
      // 从响应中获取用户信息
      const userData = response.data
      console.log('登录成功，用户数据:', userData)
      // 调用 userStore 的 login 方法保存用户信息
      user.login(userData)
      ElMessage.success('登录成功')
      // 使用 location.href 替代 router.push，跳转并刷新页面
      // window.location.href = '/admin/system/analysis'
      router.push('/admin/system/analysis')
      console.log(userData)
      console.log(user.userId)
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请检查用户名或密码')
  } finally {
    loading.value = false
  }
}

// 忘记密码处理
const handleForgotPassword = () => {
  // TODO: 实现忘记密码逻辑
  ElMessage.info('忘记密码功能暂未开放')
}
</script>

<template>
  <div class="login-container">
    <!-- 装饰性背景元素 -->
    <div class="bg-decoration">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
      <div class="floating-shape shape-5"></div>
    </div>

    <!-- 左侧装饰区域 -->
    <div class="decoration-section">
      <div class="welcome-content">
        <div class="icon-group">
          <div class="feature-icon">
            <i class="el-icon-monitor"></i>
            <span>智能监控</span>
          </div>
          <div class="feature-icon">
            <i class="el-icon-data-analysis"></i>
            <span>数据分析</span>
          </div>
          <div class="feature-icon">
            <i class="el-icon-setting"></i>
            <span>设备管理</span>
          </div>
        </div>
        <div class="welcome-text">
          <h2>欢迎使用云芯电鉴平台</h2>
          <p>专业的电力设备全生命周期智能管理解决方案</p>
        </div>
      </div>
    </div>

    <!-- 右侧登录卡片 -->
    <div class="login-card">
      <div class="card-header">
        <div class="logo-section">
          <div class="logo-wrapper">
            <img src="../assets/img/logo.png" alt="Logo" class="logo-img" />
            <div class="logo-glow"></div>
          </div>
          <h1 class="system-title">云芯电鉴</h1>
          <p class="system-subtitle">电力设备全生命周期管理平台</p>
        </div>
      </div>

      <div class="card-body">
        <el-form @submit.prevent="handleLogin" class="login-form">
          <div class="input-group">
            <el-form-item>
              <el-input
                v-model="username"
                placeholder="请输入用户名"
                size="large"
                prefix-icon="User"
                clearable
                class="custom-input"
              />
            </el-form-item>

            <el-form-item>
              <el-input
                v-model="password"
                type="password"
                placeholder="请输入密码"
                size="large"
                prefix-icon="Lock"
                show-password
                class="custom-input"
                @keyup.enter="handleLogin"
              />
            </el-form-item>
          </div>

          <div class="options-row">
            <el-checkbox v-model="rememberMe" class="custom-checkbox">记住我</el-checkbox>
            <el-link type="primary" @click="handleForgotPassword" class="forgot-link"
              >忘记密码?</el-link
            >
          </div>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
            >
              <span v-if="!loading">登录系统</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="card-footer">
        <div class="security-info">
          <i class="el-icon-lock"></i>
          <span>您的数据受到SSL加密保护</span>
        </div>
        <div class="footer">
          <p>© {{ new Date().getFullYear() }} 电力设备智能分析平台 | 版本 2.1.5</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: white;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(118, 75, 162, 0.1) 0%, transparent 50%),
    linear-gradient(
      45deg,
      rgba(102, 126, 234, 0.05) 0%,
      rgba(255, 255, 255, 1) 50%,
      rgba(118, 75, 162, 0.05) 100%
    );
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* 背景装饰元素 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 60px;
  height: 60px;
  top: 20%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 30%;
  left: 5%;
  animation-delay: 4s;
}

.shape-4 {
  width: 40px;
  height: 40px;
  top: 60%;
  right: 25%;
  animation-delay: 1s;
}

.shape-5 {
  width: 120px;
  height: 120px;
  bottom: 10%;
  right: 10%;
  animation-delay: 3s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px);
    opacity: 1;
  }
}

/* 装饰区域 */
.decoration-section {
  display: flex;
  flex: 1;
  max-width: 500px;
  justify-content: center;
  align-items: center;
  margin-right: 60px;
  z-index: 2;
  position: relative;
}

.welcome-content {
  text-align: center;
  color: #667eea;
}

.icon-group {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
}

.feature-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
}

.feature-icon:hover {
  transform: translateY(-5px);
  background: rgba(102, 126, 234, 0.15);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
}

.feature-icon i {
  font-size: 32px;
  margin-bottom: 8px;
  color: #667eea;
}

.feature-icon span {
  font-size: 14px;
  font-weight: 500;
  color: #5a6cb8;
}

.welcome-text h2 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-text p {
  font-size: 18px;
  color: #6b7280;
  line-height: 1.6;
}

/* 登录卡片 */
.login-card {
  width: 480px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.5);
  overflow: hidden;
  transition: all 0.3s ease;
  animation: slideInRight 0.8s ease-out;
  z-index: 2;
  position: relative;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 25px 80px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.6);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.card-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.logo-section {
  position: relative;
  z-index: 1;
}

.logo-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.logo-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  animation: logoRotate 8s linear infinite;
  position: relative;
  z-index: 1;
}

.logo-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes logoRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.system-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.system-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

.card-body {
  padding: 40px;
  background: white;
}

.login-form {
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 25px;
}

.custom-input {
  margin-bottom: 20px;
}

.custom-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: rgba(248, 250, 252, 0.8);
}

.custom-input :deep(.el-input__wrapper:focus) {
  border-color: #667eea;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.25);
  background: white;
}

.custom-input :deep(.el-input__inner) {
  padding: 16px 40px 16px 16px;
  font-size: 16px;
  color: #374151;
}

.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.custom-checkbox :deep(.el-checkbox__label) {
  color: #6b7280;
  font-weight: 500;
}

.forgot-link {
  font-weight: 500;
  text-decoration: none;
  color: #667eea !important;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-button {
  width: 100%;
  font-size: 18px;
  font-weight: 600;
  padding: 16px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.login-button:hover::before {
  left: 100%;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.card-footer {
  padding: 20px 40px 30px;
  background: rgba(248, 250, 252, 0.8);
}

.security-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: #10b981;
  font-size: 14px;
  font-weight: 500;
}

.security-info i {
  margin-right: 8px;
  font-size: 16px;
}

.footer {
  text-align: center;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.footer p {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .decoration-section {
    display: none;
  }

  .login-container {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .login-container {
    padding: 10px;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  .card-header {
    padding: 30px 20px;
  }

  .card-body {
    padding: 30px 20px;
  }

  .system-title {
    font-size: 28px;
  }

  .welcome-text h2 {
    font-size: 28px;
  }

  .icon-group {
    flex-direction: column;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .card-header {
    padding: 25px 15px;
  }

  .card-body {
    padding: 25px 15px;
  }

  .card-footer {
    padding: 15px;
  }

  .system-title {
    font-size: 24px;
  }

  .logo-img {
    width: 60px;
    height: 60px;
  }
}
</style>

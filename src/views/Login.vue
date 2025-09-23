<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式状态
const username = ref('')
const password = ref('')
const rememberMe = ref(false)

// 登录方法
const handleLogin = async (e) => {
  e.preventDefault()
  try {
    const response = await axios.post('/api/user/login', {
      username: username.value,
      password: password.value,
    })
    if (response.status === 200) {
      alert('登录成功')
      // 使用 location.href 替代 router.push，跳转并刷新页面
      window.location.href = '/admin/system/analysis'
    }
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请检查用户名或密码')
  }
}

// 忘记密码处理
const handleForgotPassword = () => {
  // TODO: 实现忘记密码逻辑
}
</script>

<template>
  <!-- 背景装饰元素 -->
  <div class="background-elements">
    <div class="circle circle-1"></div>
    <div class="circle circle-2"></div>
    <div class="circle circle-3"></div>
    <div class="line line-1"></div>
    <div class="line line-2"></div>
    <div class="line line-3"></div>
  </div>

  <!-- 登录卡片 -->
  <div class="login-card">
    <div class="logo">
      <i class="fas fa-microchip logo-icon"></i>
      <div class="logo-text">智能工业分析</div>
    </div>

    <h2 class="welcome-text">欢迎回来</h2>
    <p class="subtitle">电气故障智能诊断系统</p>

    <form @submit="handleLogin">
      <div class="form-group">
        <label class="form-label">用户名</label>
        <div class="input-with-icon">
          <i class="fas fa-user input-icon"></i>
          <input v-model="username" type="text" class="form-input" placeholder="请输入用户名" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">密码</label>
        <div class="input-with-icon">
          <i class="fas fa-lock input-icon"></i>
          <input v-model="password" type="password" class="form-input" placeholder="请输入密码" />
        </div>
      </div>

      <div class="remember-forgot">
        <div class="remember-me">
          <input v-model="rememberMe" type="checkbox" id="remember" />
          <label for="remember">记住我</label>
        </div>
        <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">忘记密码?</a>
      </div>

      <button type="submit" class="login-btn">登录系统</button>
    </form>

    <div class="footer">
      <p>© {{ new Date().getFullYear() }} 工业设备智能分析平台 | 版本 2.1.5</p>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

:root {
  --primary: #001529;
  --secondary: #1890ff;
  --accent: #13c2c2;
  --light: #f0f2f5;
  --dark: #06152a;
  --gray: #8c8c8c;
  --card-bg: rgba(255, 255, 255, 0.08);
}

body {
  background: linear-gradient(135deg, var(--dark), var(--primary));
  min-height: 100vh;
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  color: var(--light);
  overflow: hidden;
  position: relative;
}

/* 背景装饰元素 */
.background-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, var(--secondary), transparent);
  opacity: 0.1;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: 15%;
  right: 20%;
  background: linear-gradient(135deg, var(--accent), transparent);
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 60%;
  left: 30%;
  background: linear-gradient(225deg, #13c2c2, transparent);
}

.line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(24, 144, 255, 0.2), transparent);
  height: 1px;
  width: 100%;
}

.line-1 {
  top: 20%;
  transform: rotate(-15deg);
}

.line-2 {
  top: 45%;
  transform: rotate(10deg);
}

.line-3 {
  top: 70%;
  transform: rotate(-5deg);
}

/* 登录卡片 */
.login-card {
  width: 420px;
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 50px 40px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 10;
  text-align: center; /* 改为center让内容居中 */
  margin: auto; /* 添加auto margin确保在flex容器中完全居中 */
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
}

.logo-icon {
  font-size: 40px;
  margin-right: 15px;
  color: var(--accent);
  text-shadow: 0 0 15px rgba(19, 194, 194, 0.4);
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(to right, #f0f2f5, var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-text {
  font-size: 24px;
  margin-bottom: 10px;
  font-weight: 500;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 40px;
  font-size: 16px;
}

/* 表单样式 */
.form-group {
  margin-bottom: 25px;
  position: relative;
  width: 100%;
  max-width: 340px; /* 限制表单组件最大宽度 */
  margin-left: auto; /* 让表单水平居中 */
  margin-right: auto;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  text-align: left;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--accent);
  font-size: 18px;
}

.form-input {
  width: 100%;
  padding: 14px 14px 14px 45px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
  outline: none;
  color: white;
}

.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(19, 194, 194, 0.2);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.remember-forgot {
  max-width: 340px; /* 与表单同宽 */
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 30px;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input {
  margin-right: 8px;
  accent-color: var(--accent);
}

.remember-me label {
  color: rgba(255, 255, 255, 0.7);
}

.forgot-password {
  color: var(--accent);
  text-decoration: none;
  transition: all 0.3s;
  font-size: 14px;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--secondary), var(--accent));
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(24, 144, 255, 0.3);
  letter-spacing: 1px;
  display: block; /* 设置为块级元素 */
  max-width: 340px; /* 与表单同宽 */
  margin-left: auto;
  margin-right: auto;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.5);
}

.footer {
  text-align: center;
  margin-top: 30px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-card {
    width: 90%;
    padding: 40px 25px;
  }

  .logo-text {
    font-size: 24px;
  }

  .welcome-text {
    font-size: 20px;
  }
}

/* 动画效果 */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.logo-icon {
  animation: float 3s ease-in-out infinite;
}

.circle-1 {
  animation: float 8s ease-in-out infinite;
}

.circle-2 {
  animation: float 6s ease-in-out infinite;
  animation-delay: 1s;
}

.circle-3 {
  animation: float 7s ease-in-out infinite;
  animation-delay: 2s;
}
</style>

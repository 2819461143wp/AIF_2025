<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
const router = useRouter()
const isCollapse = ref(false)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<template>
  <div class="admin-container">
    <div class="menu-container">
      <el-aside class="el-aside" :class="{ 'is-collapsed': isCollapse }">
        <el-menu
          router
          unique-opened
          :collapse="isCollapse"
          :default-active="router.currentRoute.value.path"
          class="el-menu"
        >
          <!-- Logo区域 -->
          <div class="logo-container">
            <img src="/src/assets/img/logo.png" alt="Logo" />
            <h1 v-show="!isCollapse" style="font-size: 16px; font-weight: 500; margin: 0">
              电力设备故障诊断平台
            </h1>
            <el-icon class="collapse-btn" @click="toggleCollapse">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </div>
          <!-- 系统管理 -->

          <el-menu-item index="/admin/system/analysis">
            <el-icon><HomeFilled /></el-icon>
            <span>数据看板</span>
          </el-menu-item>
          <el-sub-menu index="/admin/user">
            <template #title>
              <el-icon><UserFilled /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/admin/system/role">
              <el-icon><User /></el-icon>
              <span>角色管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/user/update">
              <el-icon><Edit /></el-icon>
              <span>用户信息修改</span>
            </el-menu-item>
            <el-menu-item index="/admin/user/insert">
              <el-icon><Upload /></el-icon>
              <span>用户批量创建</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- <el-sub-menu index="/admin/post">
            <template #title>
              <el-icon><Memo /></el-icon>
              <span>贴子管理</span>
            </template>
            <el-menu-item index="/admin/post/audit">
              <el-icon><DocumentChecked /></el-icon>
              <span>贴子审核</span>
            </el-menu-item>
            <el-menu-item index="/admin/post/list">
              <el-icon><List /></el-icon>
              <span>贴子列表</span>
            </el-menu-item>
          </el-sub-menu> -->
          <el-menu-item index="/admin/model">
            <el-icon><Platform /></el-icon>
            <span>故障检测</span>
          </el-menu-item>
          <el-sub-menu index="/admin/equip">
            <template #title>
              <el-icon><BellFilled /></el-icon>
              <span>设备生命周期管理</span>
            </template>
            <el-menu-item index="/admin/equip/order">
              <el-icon><Position /></el-icon>
              <span>指令下达</span>
            </el-menu-item>
            <el-menu-item index="/admin/equip/process">
              <el-icon><DocumentChecked /></el-icon>
              <span>工单上报</span>
            </el-menu-item>
            <el-menu-item index="/admin/equip/list">
              <el-icon><Memo /></el-icon>
              <span>工单总览</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
    </div>
    <div class="main-container" :class="{ 'is-collapsed': isCollapse }">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  width: 100%;
}
.main-container {
  margin-left: 220px;
  padding: 16px;
  flex: 1;
  transition: all 0.3s;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #f5f7fa;
}

.main-container.is-collapsed {
  margin-left: 64px;
}

.content-container {
  justify-content: center;
  align-items: center;
  height: 100%;
  flex-direction: column;
  width: 100%; /* 设置宽度为父容器的100% */
  box-sizing: border-box;
}

.logo-container {
  height: 64px;
  padding: 16px;
  display: flex;
  align-items: center;
  background-color: #002140;
  overflow: hidden;
}

.logo-container img {
  width: 32px;
  height: 32px;
  margin-right: 12px;
  transition: all 0.3s;
}

.logo-container h1 {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  flex: 1;
  opacity: 1;
  transition: all 0.3s;
}

.logo-container .collapse-btn {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  transition: all 0.3s;
  padding: 4px;
  border-radius: 4px;
}

.logo-container .collapse-btn:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  transition: all 0.3s;
  background-color: #001529;
}
/* 添加侧边栏样式 */
.el-aside {
  position: fixed;
  top: 0;
  left: 0;
  width: 220px !important;
  transition: all 0.3s;
  background-color: #001529;
  z-index: 1000;
  height: 100vh;
}

.el-aside.is-collapsed {
  width: 64px !important;
}

.el-aside .el-menu {
  border-right: none;
  height: 100%;
}
</style>

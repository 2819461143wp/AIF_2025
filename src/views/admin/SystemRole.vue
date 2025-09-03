<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 状态管理
const loading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref('create') // 'create' | 'edit'
const currentGroup = ref({})
const searchKeyword = ref('')

// 表格数据
const groups = ref([])
const users = ref([])

// 表单数据
const groupForm = ref({
  id: '',
  name: '',
  description: '',
  permissions: [],
  userIds: [],
})

// 权限列表配置
const permissionList = [
  { id: 'user_view', name: '用户查看', category: '用户管理' },
  { id: 'user_create', name: '用户创建', category: '用户管理' },
  { id: 'user_edit', name: '用户编辑', category: '用户管理' },
  { id: 'user_delete', name: '用户删除', category: '用户管理' },
  { id: 'data_view', name: '数据查看', category: '数据管理' },
  { id: 'data_upload', name: '数据上传', category: '数据管理' },
  { id: 'data_download', name: '数据下载', category: '数据管理' },
  { id: 'data_delete', name: '数据删除', category: '数据管理' },
  { id: 'device_view', name: '设备查看', category: '设备管理' },
  { id: 'device_control', name: '设备控制', category: '设备管理' },
  { id: 'device_config', name: '设备配置', category: '设备管理' },
  { id: 'report_view', name: '报表查看', category: '报表管理' },
  { id: 'report_create', name: '报表创建', category: '报表管理' },
  { id: 'report_export', name: '报表导出', category: '报表管理' },
  { id: 'system_config', name: '系统配置', category: '系统管理' },
  { id: 'system_monitor', name: '系统监控', category: '系统管理' },
  { id: 'role_manage', name: '角色管理', category: '系统管理' },
]

// 按分类分组的权限
const permissionsByCategory = computed(() => {
  const grouped = {}
  permissionList.forEach((permission) => {
    if (!grouped[permission.category]) {
      grouped[permission.category] = []
    }
    grouped[permission.category].push(permission)
  })
  return grouped
})

// 过滤后的组别列表
const filteredGroups = computed(() => {
  if (!searchKeyword.value) return groups.value
  return groups.value.filter(
    (group) =>
      group.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      group.description.toLowerCase().includes(searchKeyword.value.toLowerCase()),
  )
})

// 获取用户选项（未分配的用户）
const availableUsers = computed(() => {
  const assignedUserIds = new Set()
  groups.value.forEach((group) => {
    group.userIds.forEach((userId) => assignedUserIds.add(userId))
  })
  return users.value.filter((user) => !assignedUserIds.has(user.id))
})

// 初始化数据
const initData = () => {
  // 模拟用户数据
  users.value = [
    { id: '1', username: 'admin', role: 'admin', email: 'admin@example.com' },
    { id: '2', username: 'user1', role: 'user', email: 'user1@example.com' },
    { id: '3', username: 'user2', role: 'user', email: 'user2@example.com' },
    { id: '4', username: 'manager1', role: 'manager', email: 'manager1@example.com' },
    { id: '5', username: 'operator1', role: 'operator', email: 'operator1@example.com' },
    { id: '6', username: 'analyst1', role: 'analyst', email: 'analyst1@example.com' },
    { id: '7', username: 'viewer1', role: 'viewer', email: 'viewer1@example.com' },
    { id: '8', username: 'tech1', role: 'technician', email: 'tech1@example.com' },
  ]

  // 模拟组别数据
  groups.value = [
    {
      id: '1',
      name: '超级管理员',
      description: '拥有系统全部权限',
      permissions: permissionList.map((p) => p.id),
      userIds: ['1'],
      createTime: '2024-01-01 10:00:00',
      updateTime: '2024-01-01 10:00:00',
    },
    {
      id: '2',
      name: '数据管理员',
      description: '负责数据的上传、下载和管理',
      permissions: ['data_view', 'data_upload', 'data_download', 'data_delete', 'report_view'],
      userIds: ['4'],
      createTime: '2024-01-02 10:00:00',
      updateTime: '2024-01-02 10:00:00',
    },
    {
      id: '3',
      name: '设备操作员',
      description: '负责设备的日常操作和监控',
      permissions: ['device_view', 'device_control', 'data_view'],
      userIds: ['5'],
      createTime: '2024-01-03 10:00:00',
      updateTime: '2024-01-03 10:00:00',
    },
    {
      id: '4',
      name: '数据分析师',
      description: '负责数据分析和报表生成',
      permissions: ['data_view', 'data_download', 'report_view', 'report_create', 'report_export'],
      userIds: ['6'],
      createTime: '2024-01-04 10:00:00',
      updateTime: '2024-01-04 10:00:00',
    },
    {
      id: '5',
      name: '普通查看员',
      description: '只能查看基础数据和报表',
      permissions: ['data_view', 'report_view', 'device_view'],
      userIds: ['7'],
      createTime: '2024-01-05 10:00:00',
      updateTime: '2024-01-05 10:00:00',
    },
  ]
}

// 获取权限名称
const getPermissionName = (permissionId) => {
  const permission = permissionList.find((p) => p.id === permissionId)
  return permission ? permission.name : permissionId
}

// 获取用户名称
const getUserName = (userId) => {
  const user = users.value.find((u) => u.id === userId)
  return user ? user.username : userId
}

// 获取组别中的用户列表
const getGroupUsers = (userIds) => {
  return users.value.filter((user) => userIds.includes(user.id))
}

// 打开新建对话框
const openCreateDialog = () => {
  dialogType.value = 'create'
  groupForm.value = {
    id: '',
    name: '',
    description: '',
    permissions: [],
    userIds: [],
  }
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (group) => {
  dialogType.value = 'edit'
  groupForm.value = {
    ...group,
    permissions: [...group.permissions],
    userIds: [...group.userIds],
  }
  currentGroup.value = group
  dialogVisible.value = true
}

// 保存组别
const saveGroup = async () => {
  if (!groupForm.value.name.trim()) {
    ElMessage.error('请输入组别名称')
    return
  }

  loading.value = true
  try {
    if (dialogType.value === 'create') {
      // 创建新组别
      const newGroup = {
        ...groupForm.value,
        id: Date.now().toString(),
        createTime: new Date().toLocaleString(),
        updateTime: new Date().toLocaleString(),
      }
      groups.value.push(newGroup)
      ElMessage.success('创建成功')
    } else {
      // 编辑组别
      const index = groups.value.findIndex((g) => g.id === currentGroup.value.id)
      if (index !== -1) {
        groups.value[index] = {
          ...groupForm.value,
          updateTime: new Date().toLocaleString(),
        }
        ElMessage.success('修改成功')
      }
    }
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
  }
}

// 删除组别
const deleteGroup = async (group) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除组别"${group.name}"吗？删除后该组别下的用户将失去相应权限。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    const index = groups.value.findIndex((g) => g.id === group.id)
    if (index !== -1) {
      groups.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

// 权限全选/取消全选
const handlePermissionCheckAll = (category, checked) => {
  const categoryPermissions = permissionsByCategory.value[category].map((p) => p.id)
  if (checked) {
    // 添加该分类下的所有权限
    categoryPermissions.forEach((permissionId) => {
      if (!groupForm.value.permissions.includes(permissionId)) {
        groupForm.value.permissions.push(permissionId)
      }
    })
  } else {
    // 移除该分类下的所有权限
    groupForm.value.permissions = groupForm.value.permissions.filter(
      (permissionId) => !categoryPermissions.includes(permissionId),
    )
  }
}

// 检查分类是否全选
const isCategoryFullChecked = (category) => {
  const categoryPermissions = permissionsByCategory.value[category].map((p) => p.id)
  return categoryPermissions.every((permissionId) =>
    groupForm.value.permissions.includes(permissionId),
  )
}

// 检查分类是否部分选中
const isCategoryIndeterminate = (category) => {
  const categoryPermissions = permissionsByCategory.value[category].map((p) => p.id)
  const checkedCount = categoryPermissions.filter((permissionId) =>
    groupForm.value.permissions.includes(permissionId),
  ).length
  return checkedCount > 0 && checkedCount < categoryPermissions.length
}

// 获取权限标签类型
const getPermissionTagType = (permissionId) => {
  const typeMap = {
    user_: 'primary',
    data_: 'success',
    device_: 'warning',
    report_: 'info',
    system_: 'danger',
    role_: 'danger',
  }

  for (const [prefix, type] of Object.entries(typeMap)) {
    if (permissionId.startsWith(prefix)) {
      return type
    }
  }
  return 'default'
}

// 从组别中移除用户
const removeUserFromGroup = (group, userId) => {
  const index = group.userIds.indexOf(userId)
  if (index !== -1) {
    group.userIds.splice(index, 1)
    ElMessage.success('移除成功')
  }
}

// 组件挂载时初始化数据
onMounted(() => {
  initData()
})
</script>

<template>
  <div class="role-management">
    <!-- 头部操作区 -->
    <div class="header-section">
      <div class="header-left">
        <h2>角色组别管理</h2>
        <p class="subtitle">管理系统角色组别和权限分配</p>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索组别名称或描述"
          style="width: 200px; margin-right: 12px"
          :prefix-icon="Search"
          clearable
        />
        <el-button type="primary" :icon="Plus" @click="openCreateDialog"> 新建组别 </el-button>
      </div>
    </div>

    <!-- 组别列表 -->
    <div class="groups-grid">
      <el-card v-for="group in filteredGroups" :key="group.id" class="group-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="group-info">
              <h3 class="group-name">{{ group.name }}</h3>
              <p class="group-description">{{ group.description }}</p>
            </div>
            <div class="group-actions">
              <el-button type="primary" size="small" :icon="Edit" @click="openEditDialog(group)">
                编辑
              </el-button>
              <el-button type="danger" size="small" :icon="Delete" @click="deleteGroup(group)">
                删除
              </el-button>
            </div>
          </div>
        </template>

        <div class="card-content">
          <!-- 权限列表 -->
          <div class="permissions-section">
            <h4>
              <el-icon><key /></el-icon> 权限列表
            </h4>
            <div class="permissions-tags">
              <el-tag
                v-for="permissionId in group.permissions"
                :key="permissionId"
                :type="getPermissionTagType(permissionId)"
                size="small"
                class="permission-tag"
              >
                {{ getPermissionName(permissionId) }}
              </el-tag>
              <el-tag v-if="group.permissions.length === 0" type="info" size="small">
                暂无权限
              </el-tag>
            </div>
          </div>

          <!-- 用户列表 -->
          <div class="users-section">
            <h4>
              <el-icon><Users /></el-icon> 组别成员 ({{ group.userIds.length }}人)
            </h4>
            <div class="users-list">
              <div v-for="user in getGroupUsers(group.userIds)" :key="user.id" class="user-item">
                <el-avatar :size="24" class="user-avatar">
                  {{ user.username.charAt(0).toUpperCase() }}
                </el-avatar>
                <span class="user-name">{{ user.username }}</span>
                <el-tag size="small" :type="user.role === 'admin' ? 'danger' : 'default'">
                  {{ user.role }}
                </el-tag>
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click="removeUserFromGroup(group, user.id)"
                >
                  移除
                </el-button>
              </div>
              <div v-if="group.userIds.length === 0" class="empty-users">
                <el-empty description="暂无成员" :image-size="60" />
              </div>
            </div>
          </div>

          <!-- 创建时间 -->
          <div class="group-meta">
            <el-text size="small" type="info"> 创建时间: {{ group.createTime }} </el-text>
            <el-text size="small" type="info"> 更新时间: {{ group.updateTime }} </el-text>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredGroups.length === 0" class="empty-state">
      <el-empty description="暂无组别数据">
        <el-button type="primary" @click="openCreateDialog">创建第一个组别</el-button>
      </el-empty>
    </div>

    <!-- 新建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '新建组别' : '编辑组别'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="groupForm" label-width="100px">
        <!-- 基本信息 -->
        <el-form-item label="组别名称" required>
          <el-input
            v-model="groupForm.name"
            placeholder="请输入组别名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="组别描述">
          <el-input
            v-model="groupForm.description"
            type="textarea"
            placeholder="请输入组别描述"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <!-- 权限配置 -->
        <el-form-item label="权限配置">
          <div class="permissions-config">
            <div
              v-for="(permissions, category) in permissionsByCategory"
              :key="category"
              class="permission-category"
            >
              <div class="category-header">
                <el-checkbox
                  :model-value="isCategoryFullChecked(category)"
                  :indeterminate="isCategoryIndeterminate(category)"
                  @change="(checked) => handlePermissionCheckAll(category, checked)"
                >
                  <strong>{{ category }}</strong>
                </el-checkbox>
              </div>
              <div class="category-permissions">
                <el-checkbox-group v-model="groupForm.permissions">
                  <el-checkbox
                    v-for="permission in permissions"
                    :key="permission.id"
                    :value="permission.id"
                    class="permission-checkbox"
                  >
                    {{ permission.name }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- 用户分配 -->
        <el-form-item label="分配用户">
          <el-select
            v-model="groupForm.userIds"
            multiple
            placeholder="选择要分配到此组别的用户"
            style="width: 100%"
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="`${user.username} (${user.email})`"
              :value="user.id"
            >
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>{{ user.username }}</span>
                <el-tag size="small" :type="user.role === 'admin' ? 'danger' : 'default'">
                  {{ user.role }}
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="loading" @click="saveGroup">
            {{ dialogType === 'create' ? '创建' : '保存' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.role-management {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #f5f7fa;
}

/* 头部区域 */
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

.header-right {
  display: flex;
  align-items: center;
}

/* 组别网格 */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  flex: 1;
  align-content: start;
}

.group-card {
  height: fit-content;
  transition: all 0.3s;
}

.group-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.group-info {
  flex: 1;
}

.group-name {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.group-description {
  margin: 8px 0 0 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.group-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 卡片内容 */
.card-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.permissions-section h4,
.users-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.permissions-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.permission-tag {
  margin: 0;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.user-avatar {
  background: #409eff;
}

.user-name {
  flex: 1;
  font-weight: 500;
  color: #303133;
}

.empty-users {
  text-align: center;
  padding: 20px;
}

.group-meta {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 对话框内容 */
.permissions-config {
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
  background: #fafafa;
}

.permission-category {
  margin-bottom: 20px;
  background: white;
  border-radius: 6px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.permission-category:last-child {
  margin-bottom: 0;
}

.category-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.category-permissions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px 16px;
  padding: 0;
}

.permission-checkbox {
  margin: 0;
  white-space: nowrap;
}

:deep(.permission-checkbox .el-checkbox__label) {
  font-size: 14px;
  color: #606266;
}

:deep(.permission-checkbox.is-checked .el-checkbox__label) {
  color: #409eff;
  font-weight: 500;
}

/* 分类标题样式优化 */
:deep(.category-header .el-checkbox) {
  margin-bottom: 0;
}

:deep(.category-header .el-checkbox__label) {
  font-size: 16px;
  color: #303133;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .groups-grid {
    grid-template-columns: 1fr;
  }

  .header-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-right {
    justify-content: flex-end;
  }

  .category-permissions {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .permissions-config {
    padding: 12px;
  }

  .permission-category {
    padding: 12px;
  }
}
</style>

# 部门管理（dpt.vue）页面设计说明（Desktop First）

## 1) Layout

* 采用“上下分区 + 卡片容器”的桌面端布局：顶部为查询/操作区，中部为表格区，底部为分页区。

* 主要使用 Flex/Space（Naive UI 的 `NSpace`）组织按钮与表单项；表格区域自适应高度，分页固定在卡片底部。

* 响应式策略：桌面优先；当窗口变窄时，查询表单从多列折行为单列堆叠，操作按钮换行显示。

## 2) Meta Information

* Title：部门管理

* Description：部门信息维护与分页查询

* Open Graph：

  * og:title = 部门管理

  * og:description = 部门信息维护与分页查询

## 3) Global Styles（建议与全局保持一致）

* 背景色：应用默认背景（浅灰）+ 内容卡片白底

* 字体：系统默认字体；标题 18–20px，正文 14px，辅助信息 12px

* 主色：沿用 Naive UI 主题色

* 交互态：

  * Primary 按钮 hover 提升明度

  * Danger 操作（删除）保持红色系，并强制二次确认

  * 链接型操作用于“编辑/删除”等行内动作

## 4) Page Structure

* 顶部：页面标题 + 关键操作（新增、批量删除）

* 查询区：条件输入（关键字等）+ 查询/重置

* 表格区：可多选数据表格 + 行内操作（编辑/删除）

* 底部：分页器（页码、每页条数、总条数提示）

## 5) Sections & Components

### A. 页面容器

* `NCard`

  * Header：

    * 左侧：标题“部门管理”

    * 右侧：`新增`（Primary）、`批量删除`（Danger，disabled：未选择任何行）

### B. 查询区（Query Panel）

* `NForm`（inline/网格布局，随窗口宽度折行）

  * 表单项：

    * 关键字输入（例如：部门名称/编码，具体字段以接口支持为准）

  * 操作：

    * `查询`：触发 `dptApi.getDepartmentList({ ...query, page, pageSize })`

    * `重置`：清空条件并回到第一页重新查询

### C. 列表区（Table）

* `NDataTable`

  * 多选：开启 selection 列，用于批量删除

  * 列：

    * 基础字段列：由后端返回的部门字段决定（至少展示能区分部门的名称类字段）

    * 操作列：`编辑`、`删除`

  * 状态：

    * loading：查询中展示骨架/加载态

    * empty：无数据时展示空状态文案（支持“清空条件/重新查询”引导）

    * error：请求失败 toast/alert 提示，保留上次数据（如有）

### D. 新增/编辑弹窗（Create/Edit Modal）

* `NModal` + `NForm`

  * 标题：新增部门 / 编辑部门

  * 数据来源：

    * 新增：空表单

    * 编辑：可先调用 `dptApi.getDepartmentById(id)` 回填，或用表格行数据回填（以实现选择为准）

  * 校验：仅做必要校验（例如名称必填；其余字段按后端约束）

  * 按钮：

    * 取消：关闭弹窗，不提交

    * 保存：

      * 新增：`dptApi.createDepartment(form)`

      * 编辑：`dptApi.updateDepartment({ ...form, id })`

    * 成功：关闭弹窗 + 刷新列表；失败：保留弹窗并提示错误

### E. 单条删除确认（Row Delete Confirm）

* 行内 `删除` 使用 `NPopconfirm` / 对话框

  * 确认后调用：`dptApi.removeDepartment(id)`

  * 成功后：刷新当前分页（必要时处理“删除后本页无数据则回退页码”）

### F. 批量删除确认（Batch Delete Confirm）

* 点击“批量删除”后弹出确认框

  * 入参：选中 id 列表，调用 `dptApi.removeDepartments({ ids })`（请求体字段以后端为准）

  * 成功后：清空 selection + 刷新列表

### G. 分页器（Pagination）

* `NPagination`

  * 交互：切换页码/每页条数触发重新查询

  * 参数：`page`、`pageSize` 与查询条件一起传给 `getDepartmentList`

## 6) Interaction & Feedback

* 所有写操作（新增/编辑/删除/批量删除）成功：toast 提示 + 刷新列表。

* 失败：toast 错误提示（展示后端 message），不丢失用户已输入内容。

* 危险操作：必须二次确认。


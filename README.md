# 职业介绍信息管理系统

基于Node.js + Express + MySQL实现的职业介绍信息管理系统，用于管理职业分类、职业信息、用人单位、求职者及匹配关系。

## 功能特点

- **职业分类管理**：对职业类型进行分类管理
- **职业信息管理**：管理职业号、职业类型号、用人单位、需求人数、已聘人数等信息
- **用人单位管理**：管理用人单位基本信息
- **求职者管理**：管理求职者信息，包含聘用状态标志
- **求职匹配管理**：管理求职者和职业的匹配关系
- **费用管理**：管理用人单位和求职人员交费情况
- **自动化处理**：通过触发器实现求职成功时自动修改相应职业的已聘人数和求职者聘用状态
- **数据限制**：限制已聘人数不超过需求人数，限制求职者性别必须为'男'或'女'
- **数据统计**：存储过程查询各种职业的需求数和已聘用数

## 技术栈

- **前端**：HTML、Bootstrap 5、JavaScript
- **后端**：Node.js、Express
- **数据库**：MySQL
- **模板引擎**：EJS

## 安装与配置

### 前提条件

- Node.js (>=14.x)
- MySQL (>=8.0)

### 安装步骤

1. 克隆项目到本地

```bash
git clone https://github.com/yourusername/job-management-system.git
cd job-management-system
```

2. 安装依赖

```bash
npm install
```

3. 创建`.env`文件并设置环境变量

```
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_DATABASE=job_management
PORT=3000
```

4. 初始化数据库

```bash
# 使用MySQL命令行工具登录
mysql -u your_mysql_user -p

# 运行SQL脚本
source config/db_init.sql  （需输入脚本的绝对路径执行）
```

5. 启动应用

```bash
npm start
# 或者开发模式
npm run dev
```

6. 访问应用：打开浏览器，访问 http://localhost:3000

## 数据库结构

系统包含以下几个主要数据表：

1. **job_category** - 职业分类表
2. **employer** - 用人单位表
3. **job** - 职业信息表
4. **job_seeker** - 求职者表
5. **job_application** - 求职申请表（求职者与职业的匹配）
6. **employer_payment** - 用人单位费用表
7. **seeker_payment** - 求职者费用表

## 系统截图
![image](https://github.com/user-attachments/assets/e187fb3a-6e73-4462-be55-a57c0b101c02)

![image](https://github.com/user-attachments/assets/21470a3a-9abe-465e-aed7-77dd0c0d120f)

![image](https://github.com/user-attachments/assets/26329e70-dd19-4697-b57c-235f061329c3)



## 作者

wwtnp

## 许可证

MIT 

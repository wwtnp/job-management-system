const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const expressLayouts = require('express-ejs-layouts');

// 加载环境变量
dotenv.config();

// 导入路由
const jobCategoryRoutes = require('./routes/jobCategory');
const jobRoutes = require('./routes/job');
const employerRoutes = require('./routes/employer');
const jobSeekerRoutes = require('./routes/jobSeeker');
const jobApplicationRoutes = require('./routes/jobApplication');
const employerPaymentRoutes = require('./routes/employerPayment');
const seekerPaymentRoutes = require('./routes/seekerPayment');

// 创建Express应用
const app = express();

// 配置视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// 配置中间件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 路由中间件
app.use('/job-categories', jobCategoryRoutes);
app.use('/jobs', jobRoutes);
app.use('/employers', employerRoutes);
app.use('/job-seekers', jobSeekerRoutes);
app.use('/job-applications', jobApplicationRoutes);
app.use('/employer-payments', employerPaymentRoutes);
app.use('/seeker-payments', seekerPaymentRoutes);

// 首页路由
app.get('/', async (req, res) => {
  try {
    // 这里可以获取一些统计数据用于显示在仪表盘
    const { Job, JobSeeker, Employer, JobApplication } = require('./models/db');
    const pool = require('./config/database');
    
    const [jobCount] = await pool.query('SELECT COUNT(*) as count FROM job');
    const [seekerCount] = await pool.query('SELECT COUNT(*) as count FROM job_seeker');
    const [employerCount] = await pool.query('SELECT COUNT(*) as count FROM employer');
    const [applicationCount] = await pool.query('SELECT COUNT(*) as count FROM job_application');
    const [successfulMatches] = await pool.query('SELECT COUNT(*) as count FROM job_application WHERE status = ?', [1]);
    
    // 获取最近的职位信息
    const [recentJobs] = await pool.query(`
      SELECT j.*, jc.category_name, e.name as employer_name 
      FROM job j
      JOIN job_category jc ON j.category_id = jc.category_id
      JOIN employer e ON j.employer_id = e.employer_id
      ORDER BY j.post_date DESC
      LIMIT 5
    `);
    
    // 获取最近的求职申请
    const [recentApplications] = await pool.query(`
      SELECT ja.*, j.title as job_title, js.name as seeker_name 
      FROM job_application ja
      JOIN job j ON ja.job_id = j.job_id
      JOIN job_seeker js ON ja.seeker_id = js.seeker_id
      ORDER BY ja.application_date DESC
      LIMIT 5
    `);
    
    // 渲染首页视图
    res.render('dashboard', {
      stats: {
        jobCount: jobCount[0].count,
        seekerCount: seekerCount[0].count,
        employerCount: employerCount[0].count,
        applicationCount: applicationCount[0].count,
        successfulMatches: successfulMatches[0].count
      },
      recentJobs,
      recentApplications
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).render('error', { 
      message: '加载仪表盘时出错', 
      error: process.env.NODE_ENV === 'development' ? error : {} 
    });
  }
});

// 错误处理中间件
app.use((req, res, next) => {
  res.status(404).render('error', { 
    message: '页面未找到',
    error: { status: 404 } 
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', { 
    message: err.message || '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err : {} 
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器已启动，运行在 http://localhost:${PORT}`);
}); 
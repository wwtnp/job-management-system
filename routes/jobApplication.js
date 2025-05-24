const express = require('express');
const router = express.Router();
const { JobApplication, Job, JobSeeker } = require('../models/db');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// 获取所有求职申请
router.get('/', async (req, res) => {
  try {
    const applications = await JobApplication.getAll();
    res.render('job-applications/index', { applications });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).send('服务器错误');
  }
});

// 显示新增求职申请表单
router.get('/add', async (req, res) => {
  try {
    const jobs = await Job.getAll();
    const seekers = await JobSeeker.getAll();
    res.render('job-applications/add', { jobs, seekers });
  } catch (error) {
    console.error('Error fetching data for application form:', error);
    res.status(500).send('服务器错误');
  }
});

// 处理新增求职申请
router.post('/add', [
  body('job_id').isInt().withMessage('必须选择职位'),
  body('seeker_id').isInt().withMessage('必须选择求职者'),
], async (req, res) => {
  try {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const jobs = await Job.getAll();
      const seekers = await JobSeeker.getAll();
      return res.render('job-applications/add', { 
        errors: errors.array(),
        formData: req.body,
        jobs,
        seekers
      });
    }

    // 检查所选职位是否已满
    const job = await Job.getById(req.body.job_id);
    if (job.hired_number >= job.required_number) {
      const jobs = await Job.getAll();
      const seekers = await JobSeeker.getAll();
      return res.render('job-applications/add', { 
        customError: '该职位已招满，无法申请',
        formData: req.body,
        jobs,
        seekers
      });
    }

    // 检查求职者是否已申请过该职位
    const [existingApplications] = await pool.query(
      'SELECT * FROM job_application WHERE job_id = ? AND seeker_id = ?',
      [req.body.job_id, req.body.seeker_id]
    );
    
    if (existingApplications.length > 0) {
      const jobs = await Job.getAll();
      const seekers = await JobSeeker.getAll();
      return res.render('job-applications/add', { 
        customError: '该求职者已经申请过此职位',
        formData: req.body,
        jobs,
        seekers
      });
    }

    await JobApplication.create({
      job_id: req.body.job_id,
      seeker_id: req.body.seeker_id,
      remarks: req.body.remarks
    });
    
    res.redirect('/job-applications');
  } catch (error) {
    console.error('Error creating job application:', error);
    res.status(500).send('服务器错误');
  }
});

// 显示求职申请详情
router.get('/view/:id', async (req, res) => {
  try {
    const application = await JobApplication.getById(req.params.id);
    if (!application) {
      return res.status(404).send('申请不存在');
    }
    
    res.render('job-applications/view', { application });
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).send('服务器错误');
  }
});

// 显示编辑求职申请表单
router.get('/edit/:id', async (req, res) => {
  try {
    const application = await JobApplication.getById(req.params.id);
    if (!application) {
      return res.status(404).send('申请不存在');
    }
    
    res.render('job-applications/edit', { application });
  } catch (error) {
    console.error('Error fetching application for edit:', error);
    res.status(500).send('服务器错误');
  }
});

// 处理编辑求职申请
router.post('/edit/:id', [
  body('status').isIn(['0', '1', '2']).withMessage('无效的状态值'),
], async (req, res) => {
  // 验证请求
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    try {
      const application = await JobApplication.getById(req.params.id);
      return res.render('job-applications/edit', { 
        errors: errors.array(),
        application
      });
    } catch (error) {
      return res.status(500).send('服务器错误');
    }
  }

  try {
    // 如果要将状态更新为"已匹配"(1)，需要检查职位名额
    if (req.body.status === '1') {
      // 获取申请信息
      const application = await JobApplication.getById(req.params.id);
      
      // 如果当前状态不是已匹配，但新状态是已匹配，需要检查职位名额
      if (application.status !== 1) {
        // 获取职位信息
        const job = await Job.getById(application.job_id);
        
        // 检查是否还有名额
        if (job.hired_number >= job.required_number) {
          const updatedApplication = await JobApplication.getById(req.params.id);
          return res.render('job-applications/edit', { 
            customError: '该职位已招满，无法匹配',
            application: updatedApplication
          });
        }
      }
    }

    const result = await JobApplication.update(req.params.id, {
      status: parseInt(req.body.status),
      remarks: req.body.remarks
    });
    
    if (result === 0) {
      return res.status(404).send('申请不存在');
    }
    
    res.redirect('/job-applications');
  } catch (error) {
    console.error('Error updating job application:', error);
    res.status(500).send('服务器错误');
  }
});

// 删除求职申请
router.post('/delete/:id', async (req, res) => {
  try {
    const result = await JobApplication.delete(req.params.id);
    
    if (result === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '申请不存在' 
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting job application:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误' 
    });
  }
});

module.exports = router; 
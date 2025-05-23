const express = require('express');
const router = express.Router();
const { Job, JobCategory, Employer, JobApplication } = require('../models/db');
const { body, validationResult } = require('express-validator');

// 获取所有职业信息
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.getAll();
    res.render('jobs/index', { jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).send('服务器错误');
  }
});

// 显示新增职业信息表单
router.get('/add', async (req, res) => {
  try {
    const categories = await JobCategory.getAll();
    const employers = await Employer.getAll();
    res.render('jobs/add', { categories, employers });
  } catch (error) {
    console.error('Error fetching data for job form:', error);
    res.status(500).send('服务器错误');
  }
});

// 处理新增职业信息
router.post('/add', [
  body('title').notEmpty().withMessage('职位名称不能为空'),
  body('category_id').isInt().withMessage('必须选择职业类别'),
  body('employer_id').isInt().withMessage('必须选择用人单位'),
  body('required_number').isInt({ min: 1 }).withMessage('需求人数必须大于0'),
], async (req, res) => {
  try {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const categories = await JobCategory.getAll();
      const employers = await Employer.getAll();
      return res.render('jobs/add', { 
        errors: errors.array(),
        formData: req.body,
        categories,
        employers
      });
    }

    await Job.create({
      title: req.body.title,
      category_id: req.body.category_id,
      employer_id: req.body.employer_id,
      description: req.body.description,
      required_number: req.body.required_number,
      salary: req.body.salary,
      location: req.body.location,
      remarks: req.body.remarks
    });
    
    res.redirect('/jobs');
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).send('服务器错误');
  }
});

// 显示职业详情
router.get('/view/:id', async (req, res) => {
  try {
    const job = await Job.getById(req.params.id);
    if (!job) {
      return res.status(404).send('职位不存在');
    }
    
    // 获取该职位的所有申请者
    const applications = await JobApplication.getByJobId(req.params.id);
    res.render('jobs/view', { job, applications });
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).send('服务器错误');
  }
});

// 显示编辑职业信息表单
router.get('/edit/:id', async (req, res) => {
  try {
    const job = await Job.getById(req.params.id);
    if (!job) {
      return res.status(404).send('职位不存在');
    }
    
    const categories = await JobCategory.getAll();
    const employers = await Employer.getAll();
    
    res.render('jobs/edit', { job, categories, employers });
  } catch (error) {
    console.error('Error fetching job for edit:', error);
    res.status(500).send('服务器错误');
  }
});

// 处理编辑职业信息
router.post('/edit/:id', [
  body('title').notEmpty().withMessage('职位名称不能为空'),
  body('category_id').isInt().withMessage('必须选择职业类别'),
  body('employer_id').isInt().withMessage('必须选择用人单位'),
  body('required_number').isInt({ min: 1 }).withMessage('需求人数必须大于0'),
], async (req, res) => {
  try {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const categories = await JobCategory.getAll();
      const employers = await Employer.getAll();
      return res.render('jobs/edit', { 
        errors: errors.array(),
        job: { 
          job_id: req.params.id,
          ...req.body 
        },
        categories,
        employers
      });
    }

    const result = await Job.update(req.params.id, {
      title: req.body.title,
      category_id: req.body.category_id,
      employer_id: req.body.employer_id,
      description: req.body.description,
      required_number: req.body.required_number,
      salary: req.body.salary,
      location: req.body.location,
      remarks: req.body.remarks,
      status: req.body.status
    });
    
    if (result === 0) {
      return res.status(404).send('职位不存在');
    }
    
    res.redirect('/jobs');
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).send('服务器错误');
  }
});

// 删除职业信息
router.post('/delete/:id', async (req, res) => {
  try {
    const result = await Job.delete(req.params.id);
    
    if (result === 0) {
      return res.status(404).json({ success: false, message: '职位不存在' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取职业统计信息
router.get('/statistics', async (req, res) => {
  try {
    const statistics = await Job.getStatistics();
    res.render('jobs/statistics', { statistics });
  } catch (error) {
    console.error('Error fetching job statistics:', error);
    res.status(500).send('服务器错误');
  }
});

module.exports = router; 
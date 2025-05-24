const express = require('express');
const router = express.Router();
const { JobSeeker, JobApplication, SeekerPayment } = require('../models/db');
const { body, validationResult } = require('express-validator');

// 获取所有求职者
router.get('/', async (req, res) => {
  try {
    const seekers = await JobSeeker.getAll();
    res.render('job-seekers/index', { seekers });
  } catch (error) {
    console.error('Error fetching job seekers:', error);
    res.status(500).send('服务器错误');
  }
});

// 显示新增求职者表单
router.get('/add', (req, res) => {
  res.render('job-seekers/add');
});

// 处理新增求职者
router.post('/add', [
  body('name').notEmpty().withMessage('姓名不能为空'),
  body('gender').isIn(['男', '女']).withMessage('性别必须为"男"或"女"'),
  body('phone').notEmpty().withMessage('联系电话不能为空'),
  body('email').optional().isEmail().withMessage('请输入有效的邮箱地址'),
], async (req, res) => {
  // 验证请求
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('job-seekers/add', { 
      errors: errors.array(),
      formData: req.body 
    });
  }

  try {
    await JobSeeker.create({
      name: req.body.name,
      gender: req.body.gender === '男' ? 'M' : 'F',
      birth_date: req.body.birth_date,
      education: req.body.education,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      skills: req.body.skills,
      resume_path: req.body.resume_path || null
    });
    
    res.redirect('/job-seekers');
  } catch (error) {
    console.error('Error creating job seeker:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).send('服务器错误: ' + error.message);
  }
});

// 显示求职者详情
router.get('/view/:id', async (req, res) => {
  try {
    const seeker = await JobSeeker.getById(req.params.id);
    if (!seeker) {
      return res.status(404).send('求职者不存在');
    }
    
    // 获取该求职者的所有申请
    const applications = await JobApplication.getBySeekerId(req.params.id);
    
    // 获取该求职者的缴费记录
    const payments = await SeekerPayment.getBySeekerId(req.params.id);
    
    res.render('job-seekers/view', { seeker, applications, payments });
  } catch (error) {
    console.error('Error fetching job seeker details:', error);
    res.status(500).send('服务器错误');
  }
});

// 显示编辑求职者表单
router.get('/edit/:id', async (req, res) => {
  try {
    const seeker = await JobSeeker.getById(req.params.id);
    if (!seeker) {
      return res.status(404).send('求职者不存在');
    }
    
    res.render('job-seekers/edit', { seeker });
  } catch (error) {
    console.error('Error fetching job seeker:', error);
    res.status(500).send('服务器错误');
  }
});

// 处理编辑求职者
router.post('/edit/:id', [
  body('name').notEmpty().withMessage('姓名不能为空'),
  body('gender').isIn(['男', '女']).withMessage('性别必须为"男"或"女"'),
  body('phone').notEmpty().withMessage('联系电话不能为空'),
  body('email').optional().isEmail().withMessage('请输入有效的邮箱地址'),
], async (req, res) => {
  // 验证请求
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('job-seekers/edit', { 
      errors: errors.array(),
      seeker: { 
        seeker_id: req.params.id,
        ...req.body 
      }
    });
  }

  try {
    const result = await JobSeeker.update(req.params.id, {
      name: req.body.name,
      gender: req.body.gender === '男' ? 'M' : 'F',
      birth_date: req.body.birth_date,
      education: req.body.education,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      skills: req.body.skills,
      resume_path: req.body.resume_path,
      hired_status: req.body.hired_status
    });
    
    if (result === 0) {
      return res.status(404).send('求职者不存在');
    }
    
    res.redirect('/job-seekers');
  } catch (error) {
    console.error('Error updating job seeker:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).send('服务器错误: ' + error.message);
  }
});

// 删除求职者
router.post('/delete/:id', async (req, res) => {
  try {
    const result = await JobSeeker.delete(req.params.id);
    
    if (result === 0) {
      return res.status(404).json({ success: false, message: '求职者不存在' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting job seeker:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(400).json({ 
        success: false, 
        message: '该求职者已有申请记录或缴费记录，无法删除'
      });
    }
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 显示添加缴费记录表单
router.get('/:id/payments/add', async (req, res) => {
  try {
    const seeker = await JobSeeker.getById(req.params.id);
    if (!seeker) {
      return res.status(404).send('求职者不存在');
    }
    
    res.render('job-seekers/add-payment', { seeker });
  } catch (error) {
    console.error('Error fetching job seeker:', error);
    res.status(500).send('服务器错误');
  }
});

// 处理添加缴费记录
router.post('/:id/payments/add', [
  body('amount').isFloat({ min: 0.01 }).withMessage('缴费金额必须大于0'),
  body('payment_method').notEmpty().withMessage('请选择缴费方式'),
], async (req, res) => {
  // 验证请求
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    try {
      const seeker = await JobSeeker.getById(req.params.id);
      return res.render('job-seekers/add-payment', { 
        errors: errors.array(),
        seeker,
        formData: req.body 
      });
    } catch (error) {
      return res.status(500).send('服务器错误');
    }
  }

  try {
    await SeekerPayment.create({
      seeker_id: req.params.id,
      amount: req.body.amount,
      payment_method: req.body.payment_method,
      description: req.body.description
    });
    
    res.redirect(`/job-seekers/view/${req.params.id}`);
  } catch (error) {
    console.error('Error creating payment record:', error);
    res.status(500).send('服务器错误');
  }
});

module.exports = router; 
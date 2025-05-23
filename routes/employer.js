const express = require('express');
const router = express.Router();
const { Employer, Job, EmployerPayment } = require('../models/db');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// 获取所有用人单位
router.get('/', async (req, res) => {
  try {
    const employers = await Employer.getAll();
    res.render('employers/index', { employers });
  } catch (error) {
    console.error('Error fetching employers:', error);
    res.status(500).send('服务器错误');
  }
});

// 显示新增用人单位表单
router.get('/add', (req, res) => {
  res.render('employers/add');
});

// 处理新增用人单位
router.post('/add', [
  body('name').notEmpty().withMessage('单位名称不能为空'),
  body('phone').notEmpty().withMessage('联系电话不能为空'),
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
], async (req, res) => {
  // 验证请求
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('employers/add', { 
      errors: errors.array(),
      formData: req.body 
    });
  }

  try {
    await Employer.create({
      name: req.body.name,
      contact_person: req.body.contact_person,
      phone: req.body.phone,
      address: req.body.address,
      email: req.body.email
    });
    
    res.redirect('/employers');
  } catch (error) {
    console.error('Error creating employer:', error);
    res.status(500).send('服务器错误');
  }
});

// 显示用人单位详情
router.get('/view/:id', async (req, res) => {
  try {
    const employer = await Employer.getById(req.params.id);
    if (!employer) {
      return res.status(404).send('用人单位不存在');
    }
    
    // 获取该单位发布的所有职位
    const [jobs] = await pool.query(
      'SELECT * FROM job WHERE employer_id = ?', 
      [req.params.id]
    );
    
    // 获取该单位的缴费记录
    const payments = await EmployerPayment.getByEmployerId(req.params.id);
    
    res.render('employers/view', { employer, jobs, payments });
  } catch (error) {
    console.error('Error fetching employer details:', error);
    res.status(500).send('服务器错误');
  }
});

// 显示编辑用人单位表单
router.get('/edit/:id', async (req, res) => {
  try {
    const employer = await Employer.getById(req.params.id);
    if (!employer) {
      return res.status(404).send('用人单位不存在');
    }
    
    res.render('employers/edit', { employer });
  } catch (error) {
    console.error('Error fetching employer:', error);
    res.status(500).send('服务器错误');
  }
});

// 处理编辑用人单位
router.post('/edit/:id', [
  body('name').notEmpty().withMessage('单位名称不能为空'),
  body('phone').notEmpty().withMessage('联系电话不能为空'),
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
], async (req, res) => {
  // 验证请求
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('employers/edit', { 
      errors: errors.array(),
      employer: { 
        employer_id: req.params.id,
        ...req.body 
      }
    });
  }

  try {
    const result = await Employer.update(req.params.id, {
      name: req.body.name,
      contact_person: req.body.contact_person,
      phone: req.body.phone,
      address: req.body.address,
      email: req.body.email
    });
    
    if (result === 0) {
      return res.status(404).send('用人单位不存在');
    }
    
    res.redirect('/employers');
  } catch (error) {
    console.error('Error updating employer:', error);
    res.status(500).send('服务器错误');
  }
});

// 删除用人单位
router.post('/delete/:id', async (req, res) => {
  try {
    const result = await Employer.delete(req.params.id);
    
    if (result === 0) {
      return res.status(404).json({ success: false, message: '用人单位不存在' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting employer:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(400).json({ 
        success: false, 
        message: '该用人单位已发布职位或有缴费记录，无法删除'
      });
    }
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 显示添加缴费记录表单
router.get('/:id/payments/add', async (req, res) => {
  try {
    const employer = await Employer.getById(req.params.id);
    if (!employer) {
      return res.status(404).send('用人单位不存在');
    }
    
    res.render('employers/add-payment', { employer });
  } catch (error) {
    console.error('Error fetching employer:', error);
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
      const employer = await Employer.getById(req.params.id);
      return res.render('employers/add-payment', { 
        errors: errors.array(),
        employer,
        formData: req.body 
      });
    } catch (error) {
      return res.status(500).send('服务器错误');
    }
  }

  try {
    await EmployerPayment.create({
      employer_id: req.params.id,
      amount: req.body.amount,
      payment_method: req.body.payment_method,
      description: req.body.description
    });
    
    res.redirect(`/employers/view/${req.params.id}`);
  } catch (error) {
    console.error('Error creating payment record:', error);
    res.status(500).send('服务器错误');
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const { EmployerPayment, Employer } = require('../models/db');
const { body, validationResult } = require('express-validator');

// 获取所有用人单位缴费记录
router.get('/', async (req, res) => {
  try {
    // 获取所有缴费记录，并关联用人单位信息
    const [payments] = await EmployerPayment.getAllWithEmployerInfo();
    res.render('employer-payments/index', { payments });
  } catch (error) {
    console.error('Error fetching employer payments:', error);
    res.status(500).send('服务器错误');
  }
});

// 显示添加缴费记录表单
router.get('/add', async (req, res) => {
  try {
    const employers = await Employer.getAll();
    res.render('employer-payments/add', { employers });
  } catch (error) {
    console.error('Error fetching employers:', error);
    res.status(500).send('服务器错误');
  }
});

// 处理添加缴费记录
router.post('/add', [
  body('employer_id').isInt().withMessage('必须选择用人单位'),
  body('amount').isFloat({ min: 0.01 }).withMessage('缴费金额必须大于0'),
  body('payment_method').notEmpty().withMessage('请选择缴费方式'),
], async (req, res) => {
  try {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const employers = await Employer.getAll();
      return res.render('employer-payments/add', {
        errors: errors.array(),
        formData: req.body,
        employers
      });
    }

    console.log('正在创建缴费记录:', {
      employer_id: req.body.employer_id,
      amount: req.body.amount,
      payment_method: req.body.payment_method,
      description: req.body.description
    });

    try {
      const paymentId = await EmployerPayment.create({
        employer_id: req.body.employer_id,
        amount: req.body.amount,
        payment_method: req.body.payment_method,
        description: req.body.description
      });
      console.log('缴费记录创建成功，ID:', paymentId);
      res.redirect('/employer-payments');
    } catch (createError) {
      console.error('创建缴费记录时发生错误:', createError);
      throw createError;
    }
    
  } catch (error) {
    console.error('Error creating payment record:', error);
    res.status(500).send('服务器错误: ' + error.message);
  }
});

// 删除缴费记录
router.post('/delete/:id', async (req, res) => {
  try {
    const result = await EmployerPayment.delete(req.params.id);
    
    if (result === 0) {
      return res.status(404).json({ success: false, message: '缴费记录不存在' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const { SeekerPayment, JobSeeker } = require('../models/db');
const { body, validationResult } = require('express-validator');

// 获取所有求职者缴费记录
router.get('/', async (req, res) => {
  try {
    // 获取所有缴费记录，并关联求职者信息
    const [payments] = await SeekerPayment.getAllWithSeekerInfo();
    res.render('seeker-payments/index', { payments });
  } catch (error) {
    console.error('Error fetching seeker payments:', error);
    res.status(500).send('服务器错误');
  }
});

// 显示添加缴费记录表单
router.get('/add', async (req, res) => {
  try {
    const seekers = await JobSeeker.getAll();
    res.render('seeker-payments/add', { seekers });
  } catch (error) {
    console.error('Error fetching job seekers:', error);
    res.status(500).send('服务器错误');
  }
});

// 处理添加缴费记录
router.post('/add', [
  body('seeker_id').isInt().withMessage('必须选择求职者'),
  body('amount').isFloat({ min: 0.01 }).withMessage('缴费金额必须大于0'),
  body('payment_method').notEmpty().withMessage('请选择缴费方式'),
], async (req, res) => {
  try {
    // 验证请求
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const seekers = await JobSeeker.getAll();
      return res.render('seeker-payments/add', {
        errors: errors.array(),
        formData: req.body,
        seekers
      });
    }

    await SeekerPayment.create({
      seeker_id: req.body.seeker_id,
      amount: req.body.amount,
      payment_method: req.body.payment_method,
      description: req.body.description
    });
    
    res.redirect('/seeker-payments');
  } catch (error) {
    console.error('Error creating payment record:', error);
    res.status(500).send('服务器错误');
  }
});

// 删除缴费记录
router.post('/delete/:id', async (req, res) => {
  try {
    const result = await SeekerPayment.delete(req.params.id);
    
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
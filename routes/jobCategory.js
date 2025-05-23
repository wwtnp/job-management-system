const express = require('express');
const router = express.Router();
const { JobCategory } = require('../models/db');
const { body, validationResult } = require('express-validator');

// 获取所有职业分类
router.get('/', async (req, res) => {
  try {
    const categories = await JobCategory.getAll();
    res.render('job-categories/index', { categories });
  } catch (error) {
    console.error('Error fetching job categories:', error);
    res.status(500).send('服务器错误');
  }
});

// 显示新增职业分类表单
router.get('/add', (req, res) => {
  res.render('job-categories/add');
});

// 处理新增职业分类
router.post('/add', [
  body('category_name').notEmpty().withMessage('分类名称不能为空'),
], async (req, res) => {
  // 验证请求
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('job-categories/add', { 
      errors: errors.array(),
      formData: req.body 
    });
  }

  try {
    await JobCategory.create({
      category_name: req.body.category_name,
      description: req.body.description
    });
    
    res.redirect('/job-categories');
  } catch (error) {
    console.error('Error creating job category:', error);
    res.status(500).send('服务器错误');
  }
});

// 显示编辑职业分类表单
router.get('/edit/:id', async (req, res) => {
  try {
    const category = await JobCategory.getById(req.params.id);
    if (!category) {
      return res.status(404).send('分类不存在');
    }
    
    res.render('job-categories/edit', { category });
  } catch (error) {
    console.error('Error fetching job category:', error);
    res.status(500).send('服务器错误');
  }
});

// 处理编辑职业分类
router.post('/edit/:id', [
  body('category_name').notEmpty().withMessage('分类名称不能为空'),
], async (req, res) => {
  // 验证请求
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('job-categories/edit', { 
      errors: errors.array(),
      category: { 
        category_id: req.params.id,
        ...req.body 
      }
    });
  }

  try {
    const result = await JobCategory.update(req.params.id, {
      category_name: req.body.category_name,
      description: req.body.description
    });
    
    if (result === 0) {
      return res.status(404).send('分类不存在');
    }
    
    res.redirect('/job-categories');
  } catch (error) {
    console.error('Error updating job category:', error);
    res.status(500).send('服务器错误');
  }
});

// 删除职业分类
router.post('/delete/:id', async (req, res) => {
  try {
    const result = await JobCategory.delete(req.params.id);
    
    if (result === 0) {
      return res.status(404).json({ success: false, message: '分类不存在' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting job category:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router; 
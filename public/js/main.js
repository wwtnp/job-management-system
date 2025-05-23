// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 为删除按钮添加确认功能
  setupDeleteConfirmation();
  
  // 初始化自动关闭提示消息
  setupAutoCloseAlerts();
  
  // 设置职位申请状态更新处理
  setupApplicationStatusUpdates();
});

// 设置删除确认
function setupDeleteConfirmation() {
  // 获取所有带有 data-delete-url 属性的删除按钮
  const deleteButtons = document.querySelectorAll('[data-delete-url]');
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const url = this.getAttribute('data-delete-url');
      const name = this.getAttribute('data-name') || '该记录';
      
      if (confirm(`确定要删除${name}吗？`)) {
        // 发送删除请求
        fetch(url, { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // 删除成功，移除表格行或重新加载页面
            const row = this.closest('tr');
            if (row) {
              row.remove();
            } else {
              window.location.reload();
            }
          } else {
            alert(data.message || '删除失败，请稍后重试');
          }
        })
        .catch(error => {
          console.error('删除请求出错:', error);
          alert('操作失败，请稍后重试');
        });
      }
    });
  });
}

// 设置提示消息自动关闭
function setupAutoCloseAlerts() {
  // 获取所有提示消息
  const alerts = document.querySelectorAll('.alert');
  
  alerts.forEach(alert => {
    // 5秒后自动关闭提示消息
    setTimeout(() => {
      const closeButton = alert.querySelector('.btn-close');
      if (closeButton) {
        closeButton.click();
      }
    }, 5000);
  });
}

// 设置职位申请状态更新
function setupApplicationStatusUpdates() {
  // 获取所有状态更新按钮
  const statusButtons = document.querySelectorAll('[data-status-url]');
  
  statusButtons.forEach(button => {
    button.addEventListener('click', function() {
      const url = this.getAttribute('data-status-url');
      const status = this.getAttribute('data-status');
      const remarks = prompt('请输入备注信息（可选）:') || '';
      
      // 发送更新请求
      fetch(url, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, remarks })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          window.location.reload();
        } else {
          alert(data.message || '更新状态失败，请稍后重试');
        }
      })
      .catch(error => {
        console.error('更新状态请求出错:', error);
        alert('操作失败，请稍后重试');
      });
    });
  });
}

// 表单验证
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return true;
  
  let isValid = true;
  
  // 获取所有必填字段
  const requiredInputs = form.querySelectorAll('[required]');
  requiredInputs.forEach(input => {
    if (!input.value.trim()) {
      isValid = false;
      // 添加错误样式
      input.classList.add('is-invalid');
      // 添加错误消息
      const errorDiv = document.createElement('div');
      errorDiv.className = 'invalid-feedback';
      errorDiv.textContent = '此字段为必填项';
      input.parentNode.appendChild(errorDiv);
    } else {
      input.classList.remove('is-invalid');
      const errorDiv = input.parentNode.querySelector('.invalid-feedback');
      if (errorDiv) {
        errorDiv.remove();
      }
    }
  });
  
  return isValid;
} 
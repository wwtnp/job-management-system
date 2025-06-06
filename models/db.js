const pool = require('../config/database');

// Job Category 职业分类模型
const JobCategory = {
  getAll: async () => {
    const [rows] = await pool.query('SELECT * FROM job_category');
    return rows;
  },
  getById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM job_category WHERE category_id = ?', [id]);
    return rows[0];
  },
  create: async (category) => {
    const [result] = await pool.query(
      'INSERT INTO job_category (category_name, description) VALUES (?, ?)',
      [category.category_name, category.description]
    );
    return result.insertId;
  },
  update: async (id, category) => {
    const [result] = await pool.query(
      'UPDATE job_category SET category_name = ?, description = ? WHERE category_id = ?',
      [category.category_name, category.description, id]
    );
    return result.affectedRows;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM job_category WHERE category_id = ?', [id]);
    return result.affectedRows;
  }
};

// Employer 用人单位模型
const Employer = {
  getAll: async () => {
    const [rows] = await pool.query('SELECT * FROM employer');
    return rows;
  },
  getById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM employer WHERE employer_id = ?', [id]);
    return rows[0];
  },
  create: async (employer) => {
    const [result] = await pool.query(
      'INSERT INTO employer (name, contact_person, phone, address, email) VALUES (?, ?, ?, ?, ?)',
      [employer.name, employer.contact_person, employer.phone, employer.address, employer.email]
    );
    return result.insertId;
  },
  update: async (id, employer) => {
    const [result] = await pool.query(
      'UPDATE employer SET name = ?, contact_person = ?, phone = ?, address = ?, email = ? WHERE employer_id = ?',
      [employer.name, employer.contact_person, employer.phone, employer.address, employer.email, id]
    );
    return result.affectedRows;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM employer WHERE employer_id = ?', [id]);
    return result.affectedRows;
  }
};

// Job 职业信息模型
const Job = {
  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT j.*, jc.category_name, e.name as employer_name 
      FROM job j
      JOIN job_category jc ON j.category_id = jc.category_id
      JOIN employer e ON j.employer_id = e.employer_id
    `);
    return rows;
  },
  getById: async (id) => {
    const [rows] = await pool.query(`
      SELECT j.*, jc.category_name, e.name as employer_name 
      FROM job j
      JOIN job_category jc ON j.category_id = jc.category_id
      JOIN employer e ON j.employer_id = e.employer_id
      WHERE j.job_id = ?
    `, [id]);
    return rows[0];
  },
  create: async (job) => {
    const [result] = await pool.query(
      `INSERT INTO job 
       (category_id, employer_id, title, description, required_number, salary, location, remarks) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        job.category_id, 
        job.employer_id, 
        job.title, 
        job.description, 
        job.required_number, 
        job.salary, 
        job.location, 
        job.remarks
      ]
    );
    return result.insertId;
  },
  update: async (id, job) => {
    const [result] = await pool.query(
      `UPDATE job SET 
       category_id = ?, employer_id = ?, title = ?, description = ?, 
       required_number = ?, salary = ?, location = ?, remarks = ?, status = ? 
       WHERE job_id = ?`,
      [
        job.category_id, 
        job.employer_id, 
        job.title, 
        job.description, 
        job.required_number, 
        job.salary, 
        job.location, 
        job.remarks,
        job.status,
        id
      ]
    );
    return result.affectedRows;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM job WHERE job_id = ?', [id]);
    return result.affectedRows;
  },
  getStatistics: async () => {
    const [rows] = await pool.query('CALL get_job_statistics()');
    return rows[0];
  }
};

// JobSeeker 求职者模型
const JobSeeker = {
  getAll: async () => {
    const [rows] = await pool.query('SELECT * FROM job_seeker');
    return rows;
  },
  getById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM job_seeker WHERE seeker_id = ?', [id]);
    return rows[0];
  },
  create: async (seeker) => {
    // 处理可能为空的字段
    const birth_date = seeker.birth_date || null;
    const education = seeker.education || null;
    const email = seeker.email || null;
    const address = seeker.address || null;
    const skills = seeker.skills || null;
    const resume_path = seeker.resume_path || null;

    const [result] = await pool.query(
      `INSERT INTO job_seeker 
       (name, gender, birth_date, education, phone, email, address, skills, resume_path) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        seeker.name, 
        seeker.gender, 
        birth_date, 
        education, 
        seeker.phone, 
        email, 
        address, 
        skills,
        resume_path
      ]
    );
    return result.insertId;
  },
  update: async (id, seeker) => {
    // 处理可能为空的字段
    const birth_date = seeker.birth_date || null;
    const education = seeker.education || null;
    const email = seeker.email || null;
    const address = seeker.address || null;
    const skills = seeker.skills || null;
    const resume_path = seeker.resume_path || null;
    const hired_status = seeker.hired_status !== undefined ? seeker.hired_status : 0;
    
    const [result] = await pool.query(
      `UPDATE job_seeker SET 
       name = ?, gender = ?, birth_date = ?, education = ?, 
       phone = ?, email = ?, address = ?, skills = ?, resume_path = ?, hired_status = ? 
       WHERE seeker_id = ?`,
      [
        seeker.name, 
        seeker.gender, 
        birth_date, 
        education, 
        seeker.phone, 
        email, 
        address, 
        skills,
        resume_path,
        hired_status,
        id
      ]
    );
    return result.affectedRows;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM job_seeker WHERE seeker_id = ?', [id]);
    return result.affectedRows;
  }
};

// JobApplication 求职申请模型
const JobApplication = {
  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT ja.*, j.title as job_title, js.name as seeker_name 
      FROM job_application ja
      JOIN job j ON ja.job_id = j.job_id
      JOIN job_seeker js ON ja.seeker_id = js.seeker_id
    `);
    return rows;
  },
  getById: async (id) => {
    const [rows] = await pool.query(`
      SELECT ja.*, j.title as job_title, js.name as seeker_name 
      FROM job_application ja
      JOIN job j ON ja.job_id = j.job_id
      JOIN job_seeker js ON ja.seeker_id = js.seeker_id
      WHERE ja.application_id = ?
    `, [id]);
    return rows[0];
  },
  create: async (application) => {
    const [result] = await pool.query(
      'INSERT INTO job_application (job_id, seeker_id, remarks) VALUES (?, ?, ?)',
      [application.job_id, application.seeker_id, application.remarks]
    );
    return result.insertId;
  },
  update: async (id, application) => {
    const [result] = await pool.query(
      'UPDATE job_application SET status = ?, remarks = ? WHERE application_id = ?',
      [application.status, application.remarks, id]
    );
    return result.affectedRows;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM job_application WHERE application_id = ?', [id]);
    return result.affectedRows;
  },
  getByJobId: async (jobId) => {
    const [rows] = await pool.query(`
      SELECT ja.*, js.name as seeker_name, js.hired_status
      FROM job_application ja
      JOIN job_seeker js ON ja.seeker_id = js.seeker_id
      WHERE ja.job_id = ?
    `, [jobId]);
    return rows;
  },
  getBySeekerId: async (seekerId) => {
    const [rows] = await pool.query(`
      SELECT ja.*, j.title as job_title, j.required_number, j.hired_number
      FROM job_application ja
      JOIN job j ON ja.job_id = j.job_id
      WHERE ja.seeker_id = ?
    `, [seekerId]);
    return rows;
  }
};

// EmployerPayment 用人单位费用模型
const EmployerPayment = {
  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT ep.*, e.name as employer_name
      FROM employer_payment ep
      JOIN employer e ON ep.employer_id = e.employer_id
    `);
    return rows;
  },
  getAllWithEmployerInfo: async () => {
    const [rows] = await pool.query(`
      SELECT ep.*, e.name as employer_name
      FROM employer_payment ep
      JOIN employer e ON ep.employer_id = e.employer_id
      ORDER BY ep.payment_date DESC
    `);
    return [rows];
  },
  getById: async (id) => {
    const [rows] = await pool.query(`
      SELECT ep.*, e.name as employer_name
      FROM employer_payment ep
      JOIN employer e ON ep.employer_id = e.employer_id
      WHERE ep.payment_id = ?
    `, [id]);
    return rows[0];
  },
  create: async (payment) => {
    try {
      console.log('EmployerPayment.create 参数:', payment);
      // 确保参数类型正确
      const employer_id = parseInt(payment.employer_id, 10);
      const amount = parseFloat(payment.amount);
      
      // 检查参数有效性
      if (isNaN(employer_id) || employer_id <= 0) {
        throw new Error('无效的用人单位ID');
      }
      if (isNaN(amount) || amount <= 0) {
        throw new Error('无效的缴费金额');
      }
      
      const [result] = await pool.query(
        'INSERT INTO employer_payment (employer_id, amount, payment_method, description) VALUES (?, ?, ?, ?)',
        [employer_id, amount, payment.payment_method, payment.description]
      );
      console.log('插入缴费记录成功，结果:', result);
      return result.insertId;
    } catch (err) {
      console.error('创建缴费记录错误:', err);
      throw err;
    }
  },
  update: async (id, payment) => {
    const [result] = await pool.query(
      'UPDATE employer_payment SET amount = ?, payment_method = ?, description = ? WHERE payment_id = ?',
      [payment.amount, payment.payment_method, payment.description, id]
    );
    return result.affectedRows;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM employer_payment WHERE payment_id = ?', [id]);
    return result.affectedRows;
  },
  getByEmployerId: async (employerId) => {
    const [rows] = await pool.query('SELECT * FROM employer_payment WHERE employer_id = ?', [employerId]);
    return rows;
  }
};

// SeekerPayment 求职者费用模型
const SeekerPayment = {
  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT sp.*, js.name as seeker_name
      FROM seeker_payment sp
      JOIN job_seeker js ON sp.seeker_id = js.seeker_id
    `);
    return rows;
  },
  getAllWithSeekerInfo: async () => {
    const [rows] = await pool.query(`
      SELECT sp.*, js.name as seeker_name, js.phone
      FROM seeker_payment sp
      JOIN job_seeker js ON sp.seeker_id = js.seeker_id
      ORDER BY sp.payment_date DESC
    `);
    return [rows];
  },
  getById: async (id) => {
    const [rows] = await pool.query(`
      SELECT sp.*, js.name as seeker_name
      FROM seeker_payment sp
      JOIN job_seeker js ON sp.seeker_id = js.seeker_id
      WHERE sp.payment_id = ?
    `, [id]);
    return rows[0];
  },
  create: async (payment) => {
    const [result] = await pool.query(
      'INSERT INTO seeker_payment (seeker_id, amount, payment_method, description) VALUES (?, ?, ?, ?)',
      [payment.seeker_id, payment.amount, payment.payment_method, payment.description]
    );
    return result.insertId;
  },
  update: async (id, payment) => {
    const [result] = await pool.query(
      'UPDATE seeker_payment SET amount = ?, payment_method = ?, description = ? WHERE payment_id = ?',
      [payment.amount, payment.payment_method, payment.description, id]
    );
    return result.affectedRows;
  },
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM seeker_payment WHERE payment_id = ?', [id]);
    return result.affectedRows;
  },
  getBySeekerId: async (seekerId) => {
    const [rows] = await pool.query('SELECT * FROM seeker_payment WHERE seeker_id = ?', [seekerId]);
    return rows;
  }
};

module.exports = {
  JobCategory,
  Employer,
  Job,
  JobSeeker,
  JobApplication,
  EmployerPayment,
  SeekerPayment
}; 
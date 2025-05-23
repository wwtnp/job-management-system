-- 创建数据库
CREATE DATABASE job_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE job_management;

-- 职业分类
CREATE TABLE job_category (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(50) NOT NULL,
  description TEXT
);

-- 用人单位
CREATE TABLE employer (
  employer_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(50),
  phone VARCHAR(20),
  address VARCHAR(200),
  email VARCHAR(100),
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 求职者
CREATE TABLE job_seeker (
  seeker_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  gender CHAR(1) NOT NULL DEFAULT 'M', -- 使用M表示男，F表示女
  birth_date DATE,
  education VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  address VARCHAR(200),
  skills TEXT,
  resume_path VARCHAR(255),
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  hired_status TINYINT NOT NULL DEFAULT 0 -- 0=未聘用, 1=聘用成功, 2=聘用失败
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 职业
CREATE TABLE job (
  job_id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NOT NULL,
  employer_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  required_number INT NOT NULL DEFAULT 1,
  hired_number INT NOT NULL DEFAULT 0,
  salary VARCHAR(50),
  location VARCHAR(100),
  post_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'filled', 'closed') NOT NULL DEFAULT 'active',
  remarks TEXT,
  FOREIGN KEY (category_id) REFERENCES job_category(category_id),
  FOREIGN KEY (employer_id) REFERENCES employer(employer_id),
  CHECK (hired_number <= required_number)
);

-- 求职申请
CREATE TABLE job_application (
  application_id INT PRIMARY KEY AUTO_INCREMENT,
  job_id INT NOT NULL,
  seeker_id INT NOT NULL,
  application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TINYINT NOT NULL DEFAULT 0, -- 0=待处理, 1=已匹配, 2=已拒绝
  remarks TEXT,
  FOREIGN KEY (job_id) REFERENCES job(job_id),
  FOREIGN KEY (seeker_id) REFERENCES job_seeker(seeker_id),
  UNIQUE KEY unique_job_seeker (job_id, seeker_id)
);

-- 用人单位付款
CREATE TABLE employer_payment (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  employer_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  payment_method VARCHAR(50),
  description VARCHAR(200),
  FOREIGN KEY (employer_id) REFERENCES employer(employer_id)
);

-- 求职者付款
CREATE TABLE seeker_payment (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  seeker_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  payment_method VARCHAR(50),
  description VARCHAR(200),
  FOREIGN KEY (seeker_id) REFERENCES job_seeker(seeker_id)
);

-- 触发器
DELIMITER //
CREATE TRIGGER update_job_hired_status
AFTER UPDATE ON job_application
FOR EACH ROW
BEGIN
  IF NEW.status = 1 AND OLD.status != 1 THEN -- 1表示已匹配
    UPDATE job 
    SET hired_number = hired_number + 1
    WHERE job_id = NEW.job_id;

    UPDATE job_seeker
    SET hired_status = 1 -- 1表示聘用成功
    WHERE seeker_id = NEW.seeker_id;
  END IF;
END;
//
DELIMITER ;

-- 存储过程
DELIMITER //
CREATE PROCEDURE get_job_statistics()
BEGIN
  SELECT 
    j.job_id, 
    j.title, 
    jc.category_name, 
    e.name AS employer_name,
    j.required_number, 
    j.hired_number,
    (j.required_number - j.hired_number) AS remaining_positions
  FROM job j
  JOIN job_category jc ON j.category_id = jc.category_id
  JOIN employer e ON j.employer_id = e.employer_id
  ORDER BY jc.category_name, j.title;
END;
//
DELIMITER ;

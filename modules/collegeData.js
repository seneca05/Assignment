const Sequelize = require('sequelize');
var sequelize = new Sequelize('pcbvuljq', 'pcbvuljq', '8S7zpyq5FKxRkzl8Q5Ml8HpFFmZg81Qf', {
  host: 'drona.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});


const Student = sequelize.define('Student', {
  studentNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressProvince: Sequelize.STRING,
  TA: Sequelize.BOOLEAN,
  status: Sequelize.STRING
});

// Define Course model
const Course = sequelize.define('Course', {
  courseId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  courseCode: Sequelize.STRING,
  courseDescription: Sequelize.STRING
});

// Establish the hasMany relationship
Course.hasMany(Student, { foreignKey: 'course' });

// Sync the models with the database
sequelize.sync()
  .then(() => {
    console.log('Models synchronized with the database');
  })
  .catch((err) => {
    console.error('Error synchronizing models:', err);
  });


class Data {
  constructor(students, courses) {
    this.students = students;
    this.courses = courses;
  }
}

let dataCollection = null;

function initialize() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("Unable to sync the database");
      });
  });
}

function getAllStudents() {
  return new Promise((resolve, reject) => {
    Student.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("No results returned");
      });
  });
}

function getStudentsByCourse(course) {
  return new Promise((resolve, reject) => {
    Student.findAll({
      where: {
        course: course
      }
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("No results returned");
      });
  });
}

function getStudentByNum(num) {
  return new Promise((resolve, reject) => {
    Student.findOne({
      where: {
        studentNum: num
      }
    })
      .then((data) => {
        if (data) {
          resolve(data);
        } else {
          reject("No results returned");
        }
      })
      .catch((err) => {
        reject("No results returned");
      });
  });
}

function getCourses() {
  return new Promise((resolve, reject) => {
    Course.findAll()
      .then((data) => {
        if (data && data.length > 0) {
          resolve(data);
        } else {
          reject("No results returned");
        }
      })
      .catch((err) => {
        reject("No results returned");
      });
  });
}

function getCourseById(id) {
  return new Promise((resolve, reject) => {
    Course.findOne({
      where: {
        courseId: id
      }
    })
      .then((data) => {
        if (data) {
          resolve(data);
        } else {
          reject("No results returned");
        }
      })
      .catch((err) => {
        reject("No results returned");
      });
  });
}

function addStudent(studentData) {
  studentData.TA = studentData.TA ? true : false;
  for (const key in studentData) {
    if (studentData[key] === "") {
      studentData[key] = null;
    }
  }

  return Student.create(studentData)
    .then(() => {
      return Promise.resolve();
    })
    .catch(() => {
      return Promise.reject("Unable to create student");
    });
}

function updateStudent(studentData) {
  studentData.TA = studentData.TA ? true : false;
  for (const key in studentData) {
    if (studentData[key] === "") {
      studentData[key] = null;
    }
  }

  return Student.update(studentData, {
    where: {
      studentNum: studentData.studentNum
    }
  })
  .then(() => {
    return Promise.resolve();
  })
  .catch(() => {
    return Promise.reject("Unable to update student");
  });
}

function addCourse(courseData) {
  return new Promise((resolve, reject) => {
    for (const prop in courseData) {
      if (courseData[prop] === "") {
        courseData[prop] = null;
      }
    }

    Course.create(courseData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("Unable to create course");
      });
  });
}

function updateCourse(courseData) {
  return new Promise((resolve, reject) => {
    for (const prop in courseData) {
      if (courseData[prop] === "") {
        courseData[prop] = null;
      }
    }

    Course.update(courseData, {
      where: {
        courseId: courseData.courseId
      }
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("Unable to update course");
      });
  });
}

function deleteCourseById(id) {
  return new Promise((resolve, reject) => {
    Course.destroy({
      where: {
        courseId: id
      }
    })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject("Unable to delete course");
      });
  });
}

function deleteStudentByNum(studentNum) {
  return new Promise((resolve, reject) => {
    Student.destroy({
      where: { studentNumber: studentNum }
    })
    .then(() => {
      resolve();
    })
    .catch(error => {
      reject(error);
    });
  });
}

module.exports = {
  initialize,
  getAllStudents,
  getStudentsByCourse,
  getStudentByNum,
  getCourses,
  getCourseById,
  addStudent,
  updateStudent,
  addCourse,
  updateCourse,
  deleteCourseById,
  deleteStudentByNum
};
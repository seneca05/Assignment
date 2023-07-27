const fs = require('fs'); // Importing file system for reading and writing files

class Data {
  constructor(students, courses) {
    this.students = students;
    this.courses = courses;
  }
}

let dataCollection = null;

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/students.json', 'utf8', (err, dataFromSomeFile) => {
      if (err) {
        console.log(err);
        reject(err);
        return; // Exit the function
      }

      fs.readFile('./data/courses.json', 'utf8', (err, courseDataFromFile) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        const studentData = JSON.parse(dataFromSomeFile);
        const courseData = JSON.parse(courseDataFromFile);
        dataCollection = new Data(studentData, courseData);
        resolve();
      });
    });
  });
}

function getAllStudents() {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.students.length > 0) {
      resolve(dataCollection.students);
    } else {
      reject("No results returned");
    }
  });
}

function getTAs() {
  return new Promise((resolve, reject) => {
    const TAs = dataCollection.students.filter(student => student.TA);
    if (TAs.length > 0) {
      resolve(TAs);
    } else {
      reject("No results returned");
    }
  });
}

function getCourses() {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.courses.length > 0) {
      resolve(dataCollection.courses);
    } else {
      reject("No results returned");
    }
  });
}

function getStudentsByCourse(course) {
  return new Promise((resolve, reject) => {
    const students = dataCollection.students.filter(student => student.course === course);

    if (students.length === 0) {
      reject("No results returned");
    } else {
      resolve(students);
    }
  });
}

function getStudentByNum(num) {
  return new Promise((resolve, reject) => {
    const student = dataCollection.students.find(student => student.studentNum === num);

    if (!student) {
      reject("No results returned");
    } else {
      resolve(student);
    }
  });
}

function addStudent(studentData) {
  return new Promise((resolve, reject) => {
    const newStudent = {
      studentNum: dataCollection.students.length + 1,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      course: studentData.course,
      TA: studentData.TA === undefined ? false : true
    };

    dataCollection.students.push(newStudent);

    fs.writeFile('./data/students.json', JSON.stringify(dataCollection.students), 'utf8', (err) => {
      if (err) {
        console.log(err);
        reject("Error writing data file");
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  initialize,
  getAllStudents,
  getTAs,
  getCourses,
  getStudentsByCourse,
  getStudentByNum,
  addStudent
};
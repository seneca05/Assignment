// WEB700 – Assignment 05 
// I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
// of this assignment has been copied manually or electronically from any other source 
// (including 3rd party web sites) or distributed to other students. 
//Name: Shiroan Pathmanathan Student ID: 127723229 Date: 24/07/2023
//Online (Cyclic) Link: https://zany-beanie-fawn.cyclic.app

const exphbs = require('express-handlebars');
const express = require("express");
const path = require("path");
const collegeData = require("./modules/collegeData");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware to set the activeRoute variable
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = '/' + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, '') : route.replace(/\/(.*)/, ''));
  next();
});

// Handlebars setup with custom helpers
const hbs = exphbs.create({
  helpers: {
    navLink: function (url, options) {
      return `<li${url == app.locals.activeRoute ? ' class="nav-item active"' : ' class="nav-item"'}><a class="nav-link" href="${url}">${options.fn(this)}</a></li>`;
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3) throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    },
  },
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(express.static("views")); 
app.use(express.urlencoded({ extended: true })); 

app.get("/students", (req, res) => {
  collegeData.getAllStudents()
    .then((data) => {
      if (data.length > 0) {
        res.render("students", { students: data });
      } else {
        res.render("students", { message: "no results" });
      }
    })
    .catch((error) => {
      res.render("students", { message: "An error occurred" });
    });
});


app.use(express.static(path.join(__dirname)));

app.get("/tas", (req, res) => {
  collegeData
    .getTAs()
    .then((tas) => {
      res.json(tas);
    })
    .catch((err) => {
      res.json({ message: "no results" });
    });
});

app.get("/courses", (req, res) => {
  collegeData.getCourses()
    .then((courses) => {
      if (courses.length > 0) {
        res.render("courses", { courses: courses });
      } else {
        res.render("courses", { message: "no results" });
      }
    })
    .catch((error) => {
      res.render("courses", { message: "An error occurred" });
    });
});


app.get("/student/:num", async (req, res) => {
  try {
    const viewData = {};
    
    // Fetch student data
    viewData.student = await collegeData.getStudentByNum(req.params.studentNum);

    // Fetch courses data
    viewData.courses = await collegeData.getCourses();

    // Check if the student has a course, and set "selected" property
    if (viewData.student && viewData.courses) {
      for (const course of viewData.courses) {
        if (course.courseId === viewData.student.course) {
          course.selected = true;
          break; // Found the matching course, no need to check further
        }
      }
    } else {
      viewData.courses = []; // Set courses to empty if there was an issue
    }

    // Render the view with the combined data
    if (viewData.student) {
      res.render("student", { viewData: viewData });
    } else {
      res.status(404).send("Student Not Found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/htmlDemo", (req, res) => {
  res.render("htmlDemo");
});


app.get("/students/add", (req, res) => {
  collegeData.getCourses()
    .then(courses => {
      res.render("addStudent", { courses: courses });
    })
    .catch(() => {
      res.render("addStudent", { courses: [] });
    });
});

app.post("/student/update", (req, res) => {
  collegeData
    .updateStudent(req.body)
    .then(() => {
      res.redirect("/students");
    })
    .catch((err) => {
      res.status(500).send("Unable to Update Student");
    });
});


app.post("/students/add", (req, res) => {
  collegeData
    .addStudent(req.body)
    .then(() => {
      res.redirect("/students");
    })
    .catch((err) => {
      res.status(500).send("Unable to Add Student");
    });
});



app.get("/courses/add", (req, res) => {
  res.render("addCourse");
});

app.post("/courses/add", (req, res) => {
  collegeData
    .addCourse(req.body)
    .then(() => {
      res.redirect("/courses");
    })
    .catch((err) => {
      res.status(500).send("Unable to Add Course");
    });
});

app.post("/course/update", (req, res) => {
  collegeData
    .updateCourse(req.body)
    .then(() => {
      res.redirect("/courses");
    })
    .catch((err) => {
      res.status(500).send("Unable to Update Course");
    });
});

app.get("/student/delete/:studentNum", (req, res) => {
  collegeData.deleteStudentByNum(req.params.studentNum)
    .then(() => {
      res.redirect("/students");
    })
    .catch(() => {
      res.status(500).send("Unable to Remove Student / Student not found");
    });
});


app.get("/course/:id", (req, res) => {
  collegeData
    .getCourseById(parseInt(req.params.id))
    .then((course) => {
      if (!course) {
        res.status(404).send("Course Not Found");
      } else {
        res.render("course", { course: course });
      }
    })
    .catch((err) => {
      res.status(500).send("An error occurred");
    });
});

app.get("/course/delete/:id", (req, res) => {
  collegeData
    .deleteCourseById(parseInt(req.params.id))
    .then(() => {
      res.redirect("/courses");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Course / Course not found");
    });
});


// 404 route
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

collegeData
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("Server listening on port: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.error("Error initializing data:", err);
  });

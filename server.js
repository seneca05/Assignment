// WEB700 – Assignment 05 
// I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
// of this assignment has been copied manually or electronically from any other source 
// (including 3rd party web sites) or distributed to other students. 
//Name: Shiroan Pathmanathan Student ID: 127723229 Date: 24/07/2023
//Online (Cyclic) Link: https://github.com/Shiroan1992/Assignment5.git


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
      res.render("students", { students: data });
    })
    .catch((error) => {
      res.render("students", { message: "no results" });
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
      res.render("courses", { courses: courses });
    })
    .catch((err) => {
      res.render("courses", { message: "no results" });
    });
});

app.get("/student/:num", (req, res) => {
  const studentNum = parseInt(req.params.num);
  collegeData
    .getStudentByNum(studentNum)
    .then((student) => {
      res.json(student);
    })
    .catch((err) => {
      res.json({ message: "no results" });
    });
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
  res.render("addStudent");
});

app.post("/students/add", (req, res) => {
  collegeData
    .addStudent(req.body)
    .then(() => {
      res.redirect("/students");
    })
    .catch((err) => {
      res.status(500).send("Error adding student");
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

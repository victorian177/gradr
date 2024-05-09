const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = 3000;
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

const departments = [
  "Building",
  "Chemical Engineering",
  "Food Science and Engineering",
  "Education",
  "Agricultural and Environmental Engineering",
  "Geology",
  "Botany",
  "Civil Engineering",
  "Surveying and Geoinformatics",
  "Mechanical Engineering and Aerospace Engineering",
  "Material Science and Engineering",
  "Microbiology",
  "Physics and Physics Engineering",
  "Computer Science and Engineering",
  "Postgraduate Computer Science and Engineering",
  "Mathematics",
  "Zoology",
];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  res.render("index");
});

app.post("/grade", async (req, res) => {
  const registration_number = req.body.registration_number;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM student_scores WHERE registration_number = $1",
      [registration_number]
    );
    const student = result.rows[0];
    client.release();

    const { first_name, middle_name, last_name, department } = student;
    res.render("grade", {
      registration_number,
      first_name,
      middle_name,
      last_name,
      department,
    });
  } catch (error) {
    res.redirect("/");
  }
});

app.post("/score", async (req, res) => {
  const { score, registration_number } = req.body;

  try {
    const client = await pool.connect();
    await client.query(
      "UPDATE student_scores SET score = $1 WHERE registration_number = $2",
      [score, registration_number]
    );
    client.release();
  } catch (error) {}

  res.redirect("/");
});

app.get("/register", async (req, res) => {
  res.render("register", { departments });
});

app.post("/new_student", async (req, res) => {
  const {
    registration_number,
    first_name,
    middle_name,
    last_name,
    department,
    score,
  } = req.body;

  try {
    const client = await pool.connect();
    await client.query(
      "INSERT INTO student_scores (registration_number, first_name, middle_name, last_name, department, score) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        registration_number,
        first_name,
        middle_name,
        last_name,
        department,
        score,
      ]
    );
    client.release();
  } catch (error) {}

  res.redirect("/");
});

app.listen(port, () => console.log(`http://localhost:${port}`));

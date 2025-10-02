const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const methodOverride = require("method-override");
const app = express();
const port = 8080;

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "school",
  password: "@nigam1845Chauhan",
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

// let q = "INSERT INTO user (id, username, email, password) VALUES ?";
// let users = [
//   ["1a", "Manish Chauhan", "manishchauhan@gmail.com", "@manish123"],
//   ["2b", "Monu Chauhan", "monuchauhan@gmail.com", "@monu123"],
// ];

let data = [];
for (let i = 1; i <= 100; i++) {
  data.push(getRandomUser());
}

// connection.end();

app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      // console.log(result[0]["count(*)"]);
      // res.send(result[0]["count(*)"]);
      // res.send('success');
      let count = result[0]["count(*)"];
      res.render("home", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("some error in DB");
  }
});

app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      // console.log(result);
      // res.send(result);
      res.render("users", { result });
    });
  } catch (err) {
    console.log(err);
    res.send("some error");
  }
});

app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      // console.log(result);
      res.render("edit", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("some error");
  }
});

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formPass, username: newUsername } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formPass != user.password) {
        res.send('Wrong Password');
      } else {
        let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          // res.send(result);
          res.redirect('/user');
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("some error");
  }
});

app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user/new", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();
  let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("added new user");
      res.redirect("/user");
    });
  } catch (err) {
    res.send("some error occurred");
  }
});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        // res.send("WRONG Password entered!");
        res.json({content: "WRONG Password entered!"});
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; 
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
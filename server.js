const express = require("express");
const bodyparser = require("body-parser");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
dotenv.config();

const serverPort = process.env.PORT;

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//DB CONNECTION
const user = process.env.MY_SQL_USER;
const password = process.env.MY_SQL_PASSWORD;
const port = process.env.MY_SQL_PORT;
const host = process.env.MY_SQL_HOST;
const database = process.env.MY_SQL_DATABASE;

const db = mysql.createConnection({
  host,
  port,
  user,
  password,
  database,
});

db.connect((err) => {
  if (err) {
    console.log("Something went wrong while trying to connect to the DB");
    console.error(err);
  } else {
    console.log("Connected to DB");
  }
});

//SERVER
app.listen(serverPort, () => {
  console.log(`Server is running on port ${serverPort}`);
});

//MySQL Promise function
function queryPromise(sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

//API
app.post("/tickets", async (req, res) => {
  try {
    const title = req.body.title;
    const description = req.body.description;
    var active = req.body.active;

    if (!title || !description) {
      res.json({
        message: "Title and description are mandatory",
      });
      throw new Error("Title and description are mandatory");
    }

    if (!active) {
      active = true;
    }

    const issue = [title, description, active];
    const SQL =
      "INSERT INTO tickets (title, description, active) VALUES (?,?,?)";

    const result = await queryPromise(SQL, issue);

    res.status(201).json({
      id: result.insertId,
      title,
      description,
      active,
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong while trying to insert a ticket",
    });
    console.log(err);
  }
});

app.get("/tickets/search", async (req, res) => {
  try {
    const query = req.query.q;
    const SQL = "SELECT * FROM tickets WHERE description LIKE ?";

    const result = await queryPromise(SQL, [`%${query}%`]);

    if (result.length === 0) {
      res.status(404).json({
        message: "No matching records found",
      });
    } else {
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).json({
      error: "Failed to search the tickets",
    });

    console.log(err);
  }
});

app.get("/tickets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const SQL = "SELECT * FROM tickets WHERE id=?";
    const issue = [id];

    const result = await queryPromise(SQL, issue);

    if (result.length === 0) {
      res.status(404).json({
        message: "Ticket not found",
      });
    } else {
      res.status(201).json(result[0]);
    }
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong while trying to find a ticket",
    });
    console.log(err);
  }
});

app.get("/alltickets", async (req, res) => {
  try {
    const SQL = "SELECT * FROM tickets";
    const result = await queryPromise(SQL, []);

    if (result.lenght === 0) {
      res.status(404).json({
        message: "No tickets are found",
      });
    } else {
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong while trying to find a ticket",
    });
    console.log(err);
  }
});

app.put("/tickets/updateticket/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, active } = req.body;

    const SQL =
      "UPDATE tickets SET title = ?, description = ?, active = ? WHERE id = ?";

    const result = await queryPromise(SQL, [title, description, active, id]);

    if (result.affectedRows === 0) {
      res.status(404).json({
        message: "Did not match any tickets",
      });
    } else {
      res.status(201).json({
        id,
        title,
        description,
        active,
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Failed to update a ticket",
    });
  }
});

app.delete("/tickets/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const SQL = "DELETE FROM tickets WHERE id=?";

    const result = await queryPromise(SQL, [id]);

    if (result.affectedRows === 0) {
      res.status(404).json({
        message: "Unable to find matching ticket",
      });
    } else {
      res.status(201).json({
        message: "Ticket deleted succesfully",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong while trying to delete ticket",
    });
  }
});

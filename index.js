const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const jsonParser = bodyParser.json();

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
    }

    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`);
});

app.post('/insert', jsonParser, function (req, res) {
    const { todo } = req.body;

    if (!todo) {
        return res.status(400).json({
            error: 'Falta información necesaria'
        });
    }

    const stmt = db.prepare(
        'INSERT INTO todos (todo, created_at) VALUES (?, CURRENT_TIMESTAMP)'
    );

    stmt.run(todo, function(err) {
        if (err) {
            return res.status(500).json({
                error: 'Error al guardar la tarea'
            });
        }

        res.status(201).json({
            id: this.lastID,
            todo: todo,
            message: 'Insert was successful'
        });
    });

    stmt.finalize();
});

app.get('/todos', function (req, res) {
    const sql = 'SELECT * FROM todos';

    db.all(sql, [], function (err, rows) {
        if (err) {
            return res.status(500).json({
                error: 'Error al consultar las tareas'
            });
        }

        res.status(200).json(rows);
    });
});

app.get('/', function (req, res) {
    res.status(200).json({
        status: 'ok'
    });
});

app.post('/login', jsonParser, function (req, res) {
    res.status(200).json({
        status: 'ok'
    });
});

if (require.main === module) {
    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`Aplicación corriendo en http://localhost:${port}`);
    });
}

module.exports = { app: app, db };

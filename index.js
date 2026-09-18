const express = require('express');
const { randomUUID } = require('node:crypto');

const { DatabaseSync } = require('node:sqlite');
const database = new DatabaseSync('hormone.db');

const app = express();
const port = 3000;

app.use(express.json());

// Define a route for GET requests
app.get('/injections', (req, res) => {

    var query = 'SELECT * FROM injections';

    for(const item in req.query) {

        if (keyArray.includes(item)) {
            
            if (typeof req.query[item] == 'string') {
                query = `${query} WHERE ${item} = '${req.query[item]}'`
            } else {
                query = `${query} WHERE ${item} = ${req.query[item]}`
            }
        }
    }

    const selectQuery = database.prepare(query);
    res.json({ message: selectQuery.all()});
});

// Define a route for POST requests
app.post('/injections', (req, res) => {

    var values;

    for(const item of keyArray) {

        if (item == 'uuid') {
            values = `'${crypto.randomUUID()}'`
        } else {

            if (typeof req.body[item] == 'string') {
                values = `${values}, '${req.body[item]}'`
            } else if (typeof req.body[item] == 'number') {
                values = `${values}, ${req.body[item]}`
            } else {
                values = `${values}, NULL`
            }
        }
    }

    const insert = database.prepare(`INSERT INTO injections (uuid, time, ester, concentration, dose, site, recipient, vial, notes) VALUES (${values})`);
    
    try {

        insert.all();

    } catch(err) {
        console.warn(err);
    }

    res.json({ message: 'placeholder response'});

    // if(req.body != undefined) {
        
    //     const newUser = req.body;
    //     res.json({ message: 'User created', user: newUser });
    // } else {
    //     res.json({ message: 'No body'});
    // }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


const tables = {
    'injections': `
        CREATE TABLE injections(
            uuid TEXT PRIMARY KEY,
            time INTEGER NOT NULL,
            ester TEXT NOT NULL,
            concentration REAL NOT NULL,
            dose REAL NOT NULL,
            site TEXT,
            recipient TEXT,
            vial TEXT,
            notes TEXT
        ) STRICT
        `,
    // 'tests': `
    //     CREATE TABLE tests(
    //         key INTEGER PRIMARY KEY,
    //         test TEXT
    //     ) STRICT
    //     `,
};

const keyArray = tables['injections'].match(/([a-z]+)(?= )/gm)

for(const item in tables) {

    if (database.prepare(`SELECT name FROM sqlite_schema WHERE  type =\'table\' AND name=\'${item}\'`).get() == undefined ) {
        console.log(`creating missing table "${item}"`)

        database.exec(tables[item]);
    } else {
        console.log(`table "${item}" exists!`)
    }
}


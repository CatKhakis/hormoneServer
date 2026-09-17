const express = require('express');
const { randomUUID } = require('node:crypto');

const { DatabaseSync } = require('node:sqlite');
const database = new DatabaseSync('hormone.db');

const app = express();
const port = 3000;

app.use(express.json());

// Define a route for GET requests
app.get('/injections', (req, res) => {
    res.json({ message: 'Returning list of users' });
});

// Define a route for POST requests
app.post('/injections', (req, res) => {

    // const fields = {
    //     'time': true,
    //     'ester': true,
    //     'concentration': true,
    //     'dose': true,
    //     'site': false,
    //     'recipient': false,
    //     'vial': false,
    //     'notes': false,
    // };

    // for(const item of tables.injections) {
    //     console.log(item)
    // }

    // //console.log(req.body);
    // //console.log(Object.keys(req.body));

    // for(const item in fields) {
    //     if(fields[item] == true) {
    //         console.log(Object.keys(req.body).includes(item))
    //     }
    // }

    // for(const item in req.body) {
    //     console.log(`${item} ${req.body[item]}`);
    // }


    //const insert = database.prepare('INSERT INTO injections (uuid, time) VALUES (?, ?)');

    //insert.run(1, 'hello');
    //insert.close(req.body['time']);

    // const keyArray = tables['injections'].match(/([a-z]+)(?= )/gm)

    // var keys = '';
    // for(const key of keyArray) {
    //     keys = `${keys}${key}, `;
    // }
    // console.log(keys.slice(0, -2));

    const insert = database.prepare('INSERT INTO injections (uuid, time, ester, concentration, dose, site, recipient, vial, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    insert.run(crypto.randomUUID(), req.body['time'], req.body['ester'], req.body['concentration'], req.body['dose'], req.body['site'], req.body['recipient'], req.body['vial'], req.body['notes']);

    if(req.body != undefined) {
        
        const newUser = req.body;
        res.json({ message: 'User created', user: newUser });
    } else {
        res.json({ message: 'No body'});
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

/*
INT
INTEGER
REAL
TEXT
BLOB
ANY
*/

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

for(const item in tables) {

    if (database.prepare(`SELECT name FROM sqlite_schema WHERE  type =\'table\' AND name=\'${item}\'`).get() == undefined ) {
        console.log(`creating missing table "${item}"`)

        database.exec(tables[item]);
    } else {
        console.log(`table "${item}" exists!`)
    }
}


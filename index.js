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
    var filters = [];

    for(const item in req.query) {

        if (keyArray.includes(item)) {

            filters.push(item);
        }
    }

    if (filters.length > 0) {
        query = `${query} WHERE`

        for(const filter in filters) {

            query = `${query} ${filters[filter]} = '${req.query[filters[filter]].match(/[A-Za-z0-9.-]+/m)}'`

            if (filter <= filters.length - 2) {
                query = `${query} AND`
            }
        }
    }

    const selectQuery = database.prepare(query);
    res.json({ message: selectQuery.all()});
});



// Define a route for POST requests
app.post('/injections', (req, res) => {

    var values;
    const uuid = crypto.randomUUID()

    for(const item of keyArray) {

        if (item == 'uuid') {
            values = `'${uuid}'`
        } else {

            if (typeof req.query[item] == 'string') {
                values = `${values}, '${req.query[item].match(/[A-Za-z0-9.-]+/m)}'`
            } else if (typeof req.query[item] == 'number') {
                values = `${values}, ${req.query[item]}`
            } else {
                values = `${values}, NULL`
            }
        }
    }

    const insert = database.prepare(`INSERT INTO injections (uuid, time, ester, concentration, dose, site, recipient, vial, notes) VALUES (${values})`);
    
    try {

        insert.all();
        res.json({ result: database.prepare(`SELECT * FROM injections WHERE uuid = '${uuid}'`).all()});

    } catch(err) {
        console.warn(err);
        res.json({ message: err});
    }
});



// Define a route for PUT requests
app.put('/injections', (req, res) => {


    if(req.query.uuid) {

        const uuid = req.query.uuid.match(/[A-Za-z0-9.-]+/m);
        var query = 'UPDATE injections\nSET';

        var filters = [];

        for(const item in req.query) {

            if (keyArray.includes(item) && item != 'uuid') {

                filters.push(item);
            }
        }

        if (filters.length > 0) {

            for(const filter in filters) {

                query = `${query} ${filters[filter]} = '${req.query[filters[filter]].match(/[A-Za-z0-9.-]+/m)}'`

                if (filter <= filters.length - 2) {
                    query = `${query},\n`
                }
            }
        }

        query = `${query}\nWHERE uuid = '${uuid}'`

        try {

            const selectQuery = database.prepare(query);
            res.json({ message: selectQuery.all()});

        } catch(err) {
            console.warn(err);
            res.json({ message: err});
        }
        
    } else {
        res.json({ message: 'error: no uuid provided'});
    }
});



// Define a route for GET requests
app.delete('/injections', (req, res) => {
    const query = database.prepare(`UPDATE FROM injections where uuid = '${req.query.uuid.match(/[A-Za-z0-9.-]+/m)}'`);
    query.all();

    res.json({ message: 'row deleted', uuid: req.query.uuid});
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


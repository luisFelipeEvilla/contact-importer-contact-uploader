const { Pool } = require('pg');
const { DB_CONFIG } = require('../config');
const pool = new Pool(DB_CONFIG);

pool.connect()
    .then((client, release) => {
        if (client) {
            console.log("Conexión con la base de datos establecida satisfactoriamente");
        }
    })
    .catch(err => {
        console.error(err);
    });

module.exports = pool;
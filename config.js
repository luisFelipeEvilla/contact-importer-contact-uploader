require('dotenv').config();

const DB_CONFIG = {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'pass',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'docker',
    port: process.env.DB_PORT || 5432,
}

const ENCRYPTION_PASSWORD = process.env.ENCRYPTION_PASSWORD  || 'FoCKvdLslUuB4y3EZlKate7XGottHski1LmyqJHvUhs';

const FILES_SAVED_PATH = process.env.FILES_SAVED_PATH || './files';

module.exports = {
    DB_CONFIG,
    FILES_SAVED_PATH,
    ENCRYPTION_PASSWORD
}
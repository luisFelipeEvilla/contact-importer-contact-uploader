const pool = require('./index');

/**
 * get users contact csv files information 
 * @param {int} user_id 
 * @param {int} limit 
 * @param {int} offset 
 * @returns {[files]} returns an files array
 */
 const getFilesCount = async (user_id, limit, offset) => {
    try {
        const query = `SELECT COUNT(*) FROM files WHERE user_id = $1`;
        const params = [user_id];
    
        const files = await pool.query(query,  params);
    
        return files.rows[0].count;
    } catch (error) {
        throw new Error(`Error fetching files ${error}`);
    }
}

/**
 * get users contact csv files information 
 * @param {int} user_id 
 * @param {int} limit 
 * @param {int} offset 
 * @returns {[files]} returns an files array
 */
const getFiles = async (files) => {
    try {
        const query = `SELECT * FROM files WHERE status = $1`;
        const params = ['On Hold'];
    
        const files = await pool.query(query,  params);
    
        return files.rows;
    } catch (error) {
        throw new Error(`Error fetching files ${error}`);
    }
}

/**
 * Create a file
 * @param {{user_id, name}} file 
 * @returns {{file_id, user_id, name, createdAt, status}} file saved 
 */
const createFile = async (file) => {
    try {
        const query = `INSERT INTO files (user_id, saved_name, createdAt, name, status) VALUES($1, $2, $3, $4, $5) RETURNING *`
        const params = [file.user_id, file.saved_name, file.createdAt, file.name, 'On Hold']
    
        const fileSaved = await pool.query(query, params)
    
        return fileSaved.rows[0]
    } catch (error) {
        throw new Error(`File creation error ${error}`);
    }
}


const updateFileStatus = async (file) => {
    try {
        const query = `UPDATE files SET status = $1 WHERE file_id = $2`
        const params = [file.status, file.file_id];
    
        const fileUpdated = await pool.query(query, params)

        return {
            error: null,
            fileUpdated
        };
    } catch (error) {
        throw new Error(`Error updatig file status ${error}`)
    }
}

module.exports = {
    createFile,
    updateFileStatus,
    getFiles,
    getFilesCount
}
const pool = require('./index');
const validator = require('validator').default;
const { encrypt } = require('../utils/encryption');

const getContactsCount = async (user_id) => {
    const query = `SELECT COUNT(*) FROM contacts where user_id = $1`;
    const params = [user_id];

    try {
        const contacts = await pool.query(query, params);

        return contacts.rows[0].count;
    } catch (error) {
        throw new Error(`Error fetching users from data base ${error}`)
    }
}

/**
 * @param {int} user_id 
 * @param {int} offset 
 * @param {int} limit 
 * @returns {[contacts]} return contacts list asociate to the user_id
 */
const getContacts = async (user_id, offset, limit) => {
    const query = `SELECT * FROM contacts where user_id = $1 LIMIT $2 OFFSET $3`;
    const params = [user_id, limit, offset];

    try {
        const contacts = await pool.query(query, params);

        return contacts.rows;
    } catch (error) {
        throw new Error(`Error fetching users from data base ${error}`)
    }
}

/**
 * Save csv contacts file columns format. if user have right now a configuration file,
 * will update this
 * @param {user_id: int} fileStructure 
 * @returns true if successfull
 */
const createFileStructure = async (fileStructure) => {
    const found = await getFileStructure(fileStructure.user_id);

    let query = '';

    if (found) {
        query = `UPDATE file_structure SET (user_id, name_column, birth_date_column, phone_column, 
            address_column, credit_card_column, email_column) = ($1, $2, $3, $4, $5, $6, $7)`;
    } else {
        query = 'INSERT INTO file_structure VALUES($1, $2, $3, $4, $5, $6, $7)';
    }

    const params = [fileStructure.user_id, fileStructure.name, fileStructure.birth_date,
    fileStructure.phone, fileStructure.address, fileStructure.credit_card, fileStructure.email];

    try {
        const result = await pool.query(query, params)

        return true;
    } catch (error) {
        throw new Error(`Error, file_structure creation \n${error}`);
    }
}

/**
 * get User file colums settings
 * @param {int} userId 
 * @returns {{databse_column_name: file_column_name}}
 */
const getFileStructure = async (userId) => {
    const query = 'SELECT * FROM file_structure WHERE user_id = $1'
    const params = [userId]

    try {
        const file_structure = await pool.query(query, params);

        return file_structure.rows[0];
    } catch (error) {
        return false;
    }
}

/**
 * create a new contact 
 * @param {{user_id, name, birth_date, phone, address, credit_card, credit_card_network, email }} contact 
 * @returns {{contact, created: true | false, error: true | null }} returns operations results
 */
const createContact = async (contact) => {
    return new Promise((resolve, reject) => {
        try {
            validateContact(contact).then((validations) => {
                const isValid = Object.values(validations).every(validation => validation == true);

                if (isValid) {
                    console.log(contact);
                    const query = `INSERT INTO contacts(user_id, file_id,name, birth_date, phone, 
                    address, credit_card, credit_card_network, email) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`
                    const params = [contact.user_id,contact.file_id, contact.name, contact.birth_date, contact.phone,
                    contact.address, encrypt(contact.credit_card), contact.credit_card_network, contact.email]

                    pool.query(query, params).then(result => {
                        resolve(contact)
                    });

                } else {
                    resolve({ error: 'invalid fields', validations })
                }
            }).catch(error => resolve({error, validations: null}));
        } catch (error) {
            console.error(error);
            resolve({ error, validations: null })
        }
    })
}

const createContacts = (contacts, acum) => {
    const results = contacts.map(contact => (
        createContact(contact)
    ))

    return results;
}

const getContactByEmail = async (email, user_id) => {
    const query = 'SELECT * FROM contacts WHERE email = $1 and user_id = $2';
    const params = [email, user_id];

    try {
        const found = await pool.query(query, params);

        return found.rows[0];
    } catch (error) {
        throw new Error(`Error fetching contact by email and user_id ${error}`)
    }
}

const validateContact = async (contact) => {
    let validName = true;
    let validDate = true;
    let validPhone = true;
    let validAddress = true;
    let validEmail = true;
    let validCreditCard = true;

    // validate name don't contains special characters
    const nameFormat = /[`!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?~]/;
    if (nameFormat.test(contact.name)) validName = false;

    if (!validator.isDate(contact.birth_date) && !validator.isDate(contact.birth_date, { format: '%F' })) validDate = false;

    const phoneFormat = /\(\+\d{2}\) \d{3} \d{3} \d{2} \d{2}/ //(+57) 320 432 05 09
    const phoneFormat2 = /\(\+\d{2}\) \d{3}-\d{3}-\d{2}-\d{2}/ //(+57) 320-432-05-09
    if (!phoneFormat.test(contact.phone) && !phoneFormat2.test(contact.phone)) validPhone = false;

    if (!contact.address.trim()) validAddress = false;

    if (!validator.isEmail(contact.email)) validEmail = false;
    const contactFound = await getContactByEmail(contact.email, contact.user_id);
    if (contactFound) validEmail = false;

    if (!validator.isCreditCard(contact.credit_card)) validCreditCard = false;

    return {
        validName,
        validDate,
        validPhone,
        validAddress,
        validEmail,
        validCreditCard
    }
}

const createContactFail = (contact, fail) => {
    return new Promise ((resolve, reject) => {
        const {
            user_id,
            file_id,
            name,
            email,
        } = contact

        const {
            validName,
            validDate,
            validPhone,
            validAddress,
            validCreditCard,
            validEmail
        } = fail

        const query = `INSERT INTO contacts_fail(user_id, file_id, name, email, valid_name, valid_birth_date,
            valid_phone, valid_address, valid_credit_card, valid_email) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9,
            $10)`
        const params = [user_id, file_id, name, email, validName, validDate,
        validPhone, validAddress, validCreditCard, validEmail]

        pool.query(query, params).then(result => {
            resolve(result)
        }).catch(error => {
            reject(error)
        })
    })
}


module.exports = {
    createFileStructure,
    getFileStructure,
    createContact,
    createContacts,
    getContactByEmail,
    getContacts,
    getContactsCount,
    createContactFail
}
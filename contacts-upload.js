const { getFiles, updateFileStatus } = require('./db/file');
const csv = require('csvtojson');
const path = require('path');
const { createContact, getFileStructure, createContactFail } = require('./db/contacts');
const creditCardType = require('credit-card-type');
const fs = require('fs');

const { FILES_SAVED_PATH } = require('./config');

const saveContacts = async (contacts) => {
        const results = [];    

        for (i = 0; i < contacts.length; i++) {
            const contact = contacts[i];
            
            const result = await createContact(contact);
            
            if (result.error) {
                await createContactFail(contact, result.validations);
            }

            results.push(result)
        }

        return results;
}

const mapColums = (contacts, file_structure, file) => {
    return contacts.map((contact) => (
        {
            user_id: file.user_id,
            file_id: file.file_id,
            name: contact[file_structure.name_column],
            birth_date: contact[file_structure.birth_date_column],
            phone: contact[file_structure.phone_column],
            address: contact[file_structure.address_column],
            credit_card: contact[file_structure.credit_card_column],
            credit_card_network: creditCardType(contact.credit_card)[0].niceType,
            email: contact[file_structure.email_column]
        }
    ))
}

const upload = async () => {
    console.log("Contacts upload process start");
    try {
        
        const files = await getFiles();
        let processed = 0;
    
        console.log(`I'm going to process ${files.length} files`);
        files.forEach(async file => {
            file.status = 'Processing'
            await updateFileStatus(file);
    
            const fileName = path.join(FILES_SAVED_PATH, file.saved_name)
            const contacts = await csv().fromFile(fileName)
    
            const file_structure = await getFileStructure(file.user_id);
    
            if (!file_structure) {
                return console.error('file structure doest exists');
            }
    
            const contactsToSave = mapColums(contacts, file_structure, file);
    
            const results = await saveContacts(contactsToSave)
    
            let success = 0
            console.log(results);
            results.forEach(result => !result.error ? success++ : 0)
            
            if (success == 0 && contacts.length != 0) {
                file.status = 'Failed'
            } else {
                file.status = 'Finished'
            }
    
            fs.rmSync(fileName);
            await updateFileStatus(file)
            processed ++;
    
            if (processed >= files.length) {
                console.log("contacts upload process finished");
            }
        });
    
        if (processed >= files.length) {
            console.log("contacts upload process finished");
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = upload;
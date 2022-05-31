# contact-importer-contact-uploader
background process to upload contact information to data base

## Technologies

 * NodeJS
 * Postgres
 * Cron Job

## Deployment
1. First you need to clone the repository
`git clonhttps://github.com/luisFelipeEvilla/contact-importer.git`

2. create your .env file in your project root directory. **see Enviroment variables sections**

3. Install all the dependencies. For this execute the next command.
`npm install`

4. Run the application
`node index.js`

## Enviroment variables 
You can set enviroment variables for the project and  change the default settings. Here you have a example with the defaults values to deploy the API. Create a .env file in your project root and copy there.

```||
{
# data base user
DB_USER=docker
# data base passsword
DB_PASSWORD=PASS
# data base port
DB_PORT=5432
#  data base name
DB_NAME=docker
# credit card encryption password
ENCRYPTION_PASSWORD=FoCKvdLslUuB4y3EZlKate7XGottHski1LmyqJHvUhs 
}
```


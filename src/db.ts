import config from 'config';
import fs from 'fs';
import { loadFile } from 'sequelize-fixtures';
import { Sequelize } from 'sequelize-typescript';

// extract the password
let password: string | undefined = config.get('database.password');
if(config.get('database.password_file')) {
    password = fs.readFileSync(config.get('database.password_file')).toString();
}

// create the db connection
export const sequelize = new Sequelize(
    config.get('database.schema'),
    config.get('database.user'),
    password,
    { 
        host: config.get('database.host'),
        port: config.get('database.port'),
        dialect: 'mysql',
        modelPaths: [`${__dirname}/models/*.ts`]
    }
);
password = undefined;

// ensure the tables are created
sequelize.sync().then(() => {
    // check for default data to import
    const dataDir = 'data';
    if(fs.existsSync(dataDir)) {
        fs.readdirSync(dataDir)
            .filter(file => file.endsWith('.json'))
            .forEach(file => {
                console.log(`Importing ${file}`)
                loadFile(`${dataDir}/${file}`, sequelize.models)
            });
    }
});

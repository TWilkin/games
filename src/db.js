import config from 'config';
import fs from 'fs';
import Sequelize from 'sequelize';

// extract the password
let password = config.get('database.password');
if(config.get('database.password_file')) {
    password = fs.readFileSync(config.get('database.password_file'));
}

// create the db connection
export const sequelize = new Sequelize(
    config.get('database.schema'),
    config.get('database.user'),
    password,
    { 
        host: config.get('database.host'),
        port: config.get('database.port'),
        dialect: 'mysql'
    }
);
password = undefined;

import fs from 'fs';
import { loadFile } from 'sequelize-fixtures';
import { Sequelize } from 'sequelize-typescript';

import Configuration from './config';

// create the db connection
export const sequelize = new Sequelize(
    Configuration.getDatabaseURI,
    { 
        modelPaths: [`${__dirname}/models/*.model.ts`],
        logging: false
    }
);

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

import fs from 'fs';
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
    const file = Configuration.getDatabaseData
    if(file && fs.existsSync(file)) {
        console.log(`Importing ${file}`);
        const content = fs.readFileSync(file);
        const data = JSON.parse(content.toString());

        // import the test data into the database without hooks
        data.forEach(entry => {
            const model = sequelize.models[entry.model];
            model.bulkCreate(entry.data, { individualHooks: false });
        });
    }
});

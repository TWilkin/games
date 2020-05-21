import fs from 'fs';
import { Sequelize } from 'sequelize-typescript';

import Configuration from './config';

interface ImportModel {
    model: string;
    data: object[];
}

// create the db connection
export const sequelize = new Sequelize(
    Configuration.getDatabaseURI,
    { 
        modelPaths: [`${__dirname}/models/*.model.ts`],
        logging: false
    }
);

// ensure the tables are created
sequelize.sync().then(async () => {
    // check for default data to import
    const file = Configuration.getDatabaseData
    if(file && fs.existsSync(file)) {
        console.log(`Importing ${file}`);
        const content = fs.readFileSync(file);
        const data: ImportModel[] = JSON.parse(content.toString());

        // import the test data into the database without hooks
        for(let entry of data) {
            const model = sequelize.models[entry.model];
            await model.bulkCreate(entry.data, { individualHooks: false });
        }
    }
});

import fs from 'fs';
import { Sequelize } from 'sequelize-typescript';
import { sys } from 'typescript';

import Configuration from './config';
import { retry } from './util';

interface ImportModel {
    model: string;

    // eslint-disable-next-line @typescript-eslint/ban-types
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

connect();

async function connect() {
    // retry connecting X times, then fail
    const success = await retry('Database connect', () => sequelize.sync());
    if(success == null) {
        // retry failed, so quit
        console.log('Cannot connect to database.');
        sys.exit(-1);
    }

    // check for default data to import
    const file = Configuration.getDatabaseData;
    if(file && fs.existsSync(file)) {
        console.log(`Importing ${file}`);
        const content = fs.readFileSync(file);
        const data: ImportModel[] = JSON.parse(content.toString());

        // import the test data into the database without hooks
        for(const entry of data) {
            const model = sequelize.models[entry.model];
            await model.bulkCreate(entry.data, { individualHooks: false });
        }
    }
}

import casual from 'casual';
import dateformat from 'dateformat';
import fs from 'fs';
import { GraphQLSchema, GraphQLObjectType, GraphQLField, isNonNullType, assertNonNullType, GraphQLInt, GraphQLString } from 'graphql';
import util from 'util';

import DateTimeScalarType from '../../src/api/datetime';
import { sequelize } from '../../src/db';

// allow reading of files using await
const readFile = util.promisify(fs.readFile);

export function generateData(schema: GraphQLSchema, typeName: string): any {
    // find the query from the schema
    const type = schema.getType(`${typeName}Input`) as GraphQLObjectType;

    // iterate over the model fields
    let generated = {};
    Object.values(type.getFields())
        .forEach((field) => {
            generated[field.name] = generateType(field);
        });

    return generated;
}

export function mockContext(role: 'user'|'admin') {
    return {
        user: {
            userId: 1,
            userName: 'test',
            role: role
        },
        database: sequelize
    }
}

function generateType(field: GraphQLField<any, any, any>): any {
    // when generating a foreign key return a known good id
    if(field.name.endsWith('Id')) {
        return 1;
    }

    // unpack non-null types
    let fieldType = field.type;
    if(isNonNullType(fieldType)) {
        fieldType = assertNonNullType(fieldType).ofType;
    }

    switch(fieldType) {
        case GraphQLInt:
            return casual.integer(0);
        
        case DateTimeScalarType:
            return dateformat(casual.unix_time * 1000, 'isoUtcDateTime');
        
        case GraphQLString:
        default:
            return casual.string;
    }
}

export function mockSequelize() {
    before(() => {
        // ensure that sequelize has finished initialising before starting
        return sequelize.sync({ force: true });
    });
    
    beforeEach(async () => {
        // read the test data from file
        const file = await readFile(`${__dirname}/../data.json`);
        const data = JSON.parse(file.toString());

        // import the test data into the database
        return Promise.all(
            data.map(record => {
                const model = sequelize.models[record.model];
                return model.create(record.data);
            })
        );
    });

    afterEach(() => {
        // truncate the table to remove any modified records
        return sequelize.sync({ force: true });
    });
}

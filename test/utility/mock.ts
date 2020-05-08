import casual from 'casual';
import dateformat from 'dateformat';
import { GraphQLSchema, GraphQLObjectType, GraphQLField, isNonNullType, assertNonNullType, GraphQLInt, GraphQLString } from 'graphql';

import DateTimeScalarType from '../../src/api/datetime';

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

import 'reflect-metadata';
import { ModelAttributeColumnOptions } from 'sequelize';

// using the sequelize attributes property so the new properties are copied to model.rawAttributes
const metadataKey = 'sequelize:attributes';

// interface to add the new properties to a model column options
interface ExtendedModelAttributeColumnOptions extends ModelAttributeColumnOptions {

    // whether the column should be included in query parameters or not
    queryable?: boolean;

    // whether the column should be included in query parameters and query results or not
    secret?: boolean;
    
}

function addMetadata(target: any, propertyName: string, key: string, value: any): any {
    // retrieve the existing sequelize attributes
    let attributes = Reflect.getMetadata(metadataKey, target);
    if(!attributes) {
        attributes = {};
    }

    // add the new field
    attributes[propertyName][key] = value;
    Reflect.defineMetadata(metadataKey, attributes, target);
}

// Queryable annotation for a model column which indicates this column should appear in query parameters
export function Queryable(target: any, propertyName: string): any {
    addMetadata(target, propertyName, 'queryable', true);
}

// Secret annotation for a model column which indicates this column should not appear in query results
export function Secret(target: any, propertyName: string): any {
    addMetadata(target, propertyName, 'secret', true)
}

// check whether a model column is queryable
export function isQueryable(field: ModelAttributeColumnOptions): boolean {
    const columnOptions = field as ExtendedModelAttributeColumnOptions
    return columnOptions.queryable && !columnOptions.secret ? true : false;
}

// check whether a model column is secret
export function isSecret(field: ModelAttributeColumnOptions): boolean {
    return (field as ExtendedModelAttributeColumnOptions).secret ? true : false;
}

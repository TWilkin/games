import 'reflect-metadata';
import { ModelAttributeColumnOptions } from 'sequelize';

// using the sequelize attributes property so queryable is copied to model.rawAttributes
const queryableMetadataKey = 'sequelize:attributes';

// interface to add queryable to a model column options
interface QueryableModelAttributeColumnOptions extends ModelAttributeColumnOptions {
    queryable?: boolean;
}

// Queryable annotation for a model column
export function Queryable(target: any, propertyName: string): any {
    // retrieve the existing sequelize attributes
    let attributes = Reflect.getMetadata(queryableMetadataKey, target);
    if(!attributes) {
        attributes = {};
    }

    // add that this field is queryable
    attributes[propertyName].queryable = true;
    Reflect.defineMetadata(queryableMetadataKey, attributes, target);
}

// check whether a model column is queryable
export function isQueryable(field: ModelAttributeColumnOptions): boolean {
    return (field as QueryableModelAttributeColumnOptions).queryable ? true : false;
}

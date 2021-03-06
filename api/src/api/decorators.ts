import 'reflect-metadata';
import { ModelAttributeColumnOptions } from 'sequelize';

// using the sequelize attributes property so the new properties are copied to model.rawAttributes
const metadataKey = 'sequelize:attributes';

// interface to add the new properties to a model column options
interface ExtendedModelAttributeColumnOptions extends ModelAttributeColumnOptions {

    // whether the column should be included in query parameters or not
    queryable?: boolean;

    // any nested queryable columns provided by this relationship
    nestedQueryable?: string[];

    // whether the column should be included in query parameters and query results or not
    secret?: {
        excludeInput: boolean,
        excludeResult: boolean
    };

    // whether a column should be the sort column
    sortable?: boolean;
    
}

function addMetadata(target: any, propertyName: string, key: string, value: any) {
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
export function Queryable(target: any, propertyName: string): void {
    addMetadata(target, propertyName, 'queryable', true);
}

// Nested queryable annotation for model column(s) nested in a foreign key relationship
export function NestedQueryable(columns: string[] | string): (target: any, propertyName: string) => void {
    const columnList = typeof columns === 'string' ? [ columns ] : columns;

    return function(target: any, propertyName: string) {
        addMetadata(target, propertyName, 'nestedQueryable', columnList);
    };
}

// Secret annotation for a model column which indicates this column should not appear in query results or inputs
export function Secret(excludeInput=false, excludeResult=true) {
    return function(target: any, propertyName: string): void {
        addMetadata(target, propertyName, 'secret', {
            excludeInput: excludeInput,
            excludeResult: excludeResult
        });
    };
}

// Sortable annotation for a model column which indicates the column should be used for sorting after query
export function Sortable(target: any, propertyName: string): void {
    addMetadata(target, propertyName, 'sortable', true);
}

// check whether a model column is queryable
export function isQueryable(field: ModelAttributeColumnOptions): boolean {
    const columnOptions = field as ExtendedModelAttributeColumnOptions;
    return columnOptions.queryable && !columnOptions.secret?.excludeResult ? true : false;
}

// check whether a model column has nested queryable columns
export function getNestedQueryable(field: ModelAttributeColumnOptions): string[] {
    const columnOptions = field as ExtendedModelAttributeColumnOptions;
    return columnOptions.nestedQueryable && !columnOptions.secret?.excludeResult ? columnOptions.nestedQueryable : [];
}

// check whether a model column should be a secret from an Input
export function isInputSecret(field: ModelAttributeColumnOptions): boolean {
    return (field as ExtendedModelAttributeColumnOptions).secret?.excludeInput == true;
}

// check whether a model column should be a secret from query results
export function isResultSecret(field: ModelAttributeColumnOptions): boolean {
    return (field as ExtendedModelAttributeColumnOptions).secret?.excludeResult == true;
}

// check whether a model column is sortable
export function isSortable(field: ModelAttributeColumnOptions): boolean {
    return (field as ExtendedModelAttributeColumnOptions).sortable == true;
}

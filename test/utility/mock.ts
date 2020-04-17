import casual from 'casual';
import dateformat from 'dateformat';
import { Model, ModelCtor, AbstractDataType, DataTypes, ModelAttributeColumnOptions } from 'sequelize';

export function generateData(model: ModelCtor<Model<any, any>>, includeId=true): any {
    let generated = {};

    // iterate over the model fields
    Object.values(model.rawAttributes)
        .filter(field => !field.primaryKey || includeId)
        .forEach((field) => {
            generated[field.field as string] = generateType(field);
        });

    return generated;
}

function generateType(field: ModelAttributeColumnOptions): any {
    // when generating a foreign key return a known good id
    if(field.references) {
        return 1;
    }

    switch((field.type as AbstractDataType).key) {
        case DataTypes.INTEGER.toString():
            return casual.integer(0);
        
        case DataTypes.DATE.toString():
            return dateformat(casual.unix_time * 1000, 'isoUtcDateTime');
        
        case DataTypes.STRING.toString():
        default:
            return casual.string;
    }
}

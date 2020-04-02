import casual from 'casual';
import dateformat from 'dateformat';
import { Model, ModelCtor, AbstractDataType, DataTypes } from 'sequelize';

export function generateData(model: ModelCtor<Model<any, any>>, includeId=true): any {
    let generated = {};

    // iterate over the model fields
    Object.values(model.rawAttributes)
        .filter(field => !field.primaryKey || includeId)
        .forEach((field) => {
            generated[field.field as string] = generateType(field.type as AbstractDataType);
        });

    return generated;
}

export function generateDataArray(model: ModelCtor<Model<any, any>>, size: number): any[] {
    return Array.apply(null, Array(size)).map(() => {
        return {
            'model': model.name,
            'data': generateData(model)
        }
    });
}

function generateType(type: AbstractDataType): any {
    switch(type.key) {

        case DataTypes.INTEGER.toString():
            return casual.integer(0);
        
        case DataTypes.DATE.toString():
            return dateformat(casual.unix_time * 1000, 'isoUtcDateTime');
        
        case DataTypes.STRING.toString():
        default:
            return casual.string;
    }
}

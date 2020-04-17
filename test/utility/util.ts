import { Model, ModelCtor } from 'sequelize';

export function generateQuery(model: ModelCtor<Model<any, any>>): string {
    let fields: string[] = Object.values(model.rawAttributes)
        .map(field => field.field as string)
        .concat(Object.keys(model.associations)
            .map(key => `${key} { createdAt, updatedAt }`));
    return `query { Get${model.name} { ${fields.join(',')} } }`;
}

export function generateMutation(model: ModelCtor<Model<any, any>>): string {
    return `mutation($input: ${model.name}Input!) {
        Add${model.name}(input: $input) {
            ${model.primaryKeyAttribute},
            createdAt,
            updatedAt 
        }
    }`
}

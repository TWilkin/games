import { Model, ModelCtor } from 'sequelize';

export function generateQuery(model: ModelCtor<Model<any, any>>): string {
    let fields: string[] = Object.values(model.rawAttributes)
        .map(field => field.field as string)
        .concat(Object.keys(model.associations)
            .map(key => `${key} { createdAt, updatedAt }`));
    return `query { Get${model.name} { ${fields.join(',')} } }`;
}

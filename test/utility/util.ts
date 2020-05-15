import { Model, ModelCtor } from 'sequelize';

export function generateQuery(model: ModelCtor<Model<any, any>>, params: any=null): string {
    let fields: string[] = Object.values(model.rawAttributes)
        .map(field => field.field as string)
        .concat(Object.keys(model.associations)
            .map(key => `${key} { createdAt, updatedAt }`));

    // add any query parameters if they are set
    let queryParams = '';
    let assign = '';
    if(params) {
        queryParams = `(${Object.keys(params).map(key => `$${key}: ${params[key].name}`).join(', ')})`;
        assign = `(${Object.keys(params).map(param => `${param}: $${param}`).join(', ')})`;
    }

    return `query${queryParams} { Get${model.name}${assign} { ${fields.join(', ')} } }`;
}

export function generateMutation(model: ModelCtor<Model<any, any>>, isAdd: boolean): string {
    let method = isAdd ? 'Add' : 'Update';
    let idParams = isAdd ? '' : '$id: Int!,';
    let idAssign = isAdd ? '' : 'id: $id,';
    return `mutation(${idParams} $input: ${model.name}Input!) {
        ${method}${model.name}(${idAssign} input: $input) {
            ${model.primaryKeyAttribute},
            createdAt,
            updatedAt 
        }
    }`;
}
